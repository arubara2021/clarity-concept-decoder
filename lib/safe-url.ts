import { lookup } from "node:dns/promises";

const MAX_RESPONSE_BYTES = 5 * 1024 * 1024;
const MAX_REDIRECTS = 3;
const REQUEST_TIMEOUT_MS = 10_000;
const USER_AGENT = "ClarityBot/1.0";

function isPrivateIpv4(address: string): boolean {
    const octets = address.split(".").map(Number);
    if (octets.length !== 4) return true;
    if (octets.some((part) => Number.isNaN(part) || part < 0 || part > 255)) return true;
    const [first, second] = octets;
    if (first === 0 || first === 10 || first === 127) return true;
    if (first === 169 && second === 254) return true;
    if (first === 172 && second >= 16 && second <= 31) return true;
    if (first === 192 && second === 168) return true;
    if (first === 100 && second >= 64 && second <= 127) return true;
    if (first === 198 && (second === 18 || second === 19)) return true;
    return false;
}

function isPrivateIpv6(address: string): boolean {
    const lower = address.toLowerCase().replace(/^\[|\]$/g, "");
    if (lower === "::1" || lower === "0:0:0:0:0:0:0:1") return true;
    if (lower === "::" || lower === "0:0:0:0:0:0:0:0") return true;
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
    if (lower.startsWith("fe80:")) return true;

    const mappedDotted = lower.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
    if (mappedDotted) return isPrivateIpv4(mappedDotted[1]);

    const mappedHex = lower.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
    if (mappedHex) {
        const high = parseInt(mappedHex[1], 16);
        const low = parseInt(mappedHex[2], 16);
        const ipv4 = `${(high >> 8) & 0xff}.${high & 0xff}.${(low >> 8) & 0xff}.${low & 0xff}`;
        return isPrivateIpv4(ipv4);
    }

    return false;
}

function isPrivateAddress(address: string): boolean {
    if (address.includes(":")) return isPrivateIpv6(address);
    return isPrivateIpv4(address);
}

async function assertPublicDestination(url: URL): Promise<void> {
    if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("Only public HTTP(S) URLs are supported.");
    }
    if (url.username || url.password) {
        throw new Error("URLs with embedded credentials are not supported.");
    }

    const records = await lookup(url.hostname, { all: true, verbatim: true }).catch(() => {
        throw new Error("That URL could not be reached.");
    });

    if (!records.length) {
        throw new Error("That URL could not be reached.");
    }

    if (records.some((record) => isPrivateAddress(record.address))) {
        throw new Error("That URL points to a private or unavailable network.");
    }
}

export async function fetchPublicHtml(
    input: string
): Promise<{ html: string; url: string }> {
    let current: URL;
    try {
        current = new URL(input);
    } catch {
        throw new Error("That does not look like a valid URL.");
    }

    for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
        await assertPublicDestination(current);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        try {
            const response = await fetch(current, {
                redirect: "manual",
                signal: controller.signal,
                headers: {
                    Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1",
                    "User-Agent": USER_AGENT,
                },
            });

            if (response.status >= 300 && response.status < 400 && response.status !== 304) {
                const location = response.headers.get("location");
                if (!location) {
                    throw new Error("The page returned an invalid redirect.");
                }
                let next: URL;
                try {
                    next = new URL(location, current);
                } catch {
                    throw new Error("The page returned an invalid redirect.");
                }
                current = next;
                continue;
            }

            if (!response.ok) {
                throw new Error(`The page returned HTTP ${response.status}.`);
            }

            const contentType = (response.headers.get("content-type") ?? "").toLowerCase();
            if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
                throw new Error("That URL does not point to a public HTML page.");
            }

            const declaredLength = Number(response.headers.get("content-length") ?? 0);
            if (Number.isFinite(declaredLength) && declaredLength > MAX_RESPONSE_BYTES) {
                throw new Error("That page is too large to extract safely.");
            }

            if (!response.body) {
                throw new Error("The page returned no readable content.");
            }

            const reader = response.body.getReader();
            const chunks: Uint8Array[] = [];
            let total = 0;

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    if (!value) continue;
                    total += value.byteLength;
                    if (total > MAX_RESPONSE_BYTES) {
                        throw new Error("That page is too large to extract safely.");
                    }
                    chunks.push(value);
                }
            } finally {
                reader.releaseLock();
            }

            const combined = new Uint8Array(total);
            let offset = 0;
            for (const chunk of chunks) {
                combined.set(chunk, offset);
                offset += chunk.byteLength;
            }

            const html = new TextDecoder().decode(combined);
            return { html, url: current.toString() };
        } catch (error) {
            if (error instanceof Error && error.name === "AbortError") {
                throw new Error("That page took too long to respond.");
            }
            throw error;
        } finally {
            clearTimeout(timeout);
        }
    }

    throw new Error("That page redirected too many times.");
}