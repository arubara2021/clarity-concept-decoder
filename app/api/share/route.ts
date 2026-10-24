import { countSharesForIdentity, createShare, SHARE_LIMIT } from "@/lib/share-store";
import { shareRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function resolveBaseUrl(request: Request): string {
    const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
    if (configured) return configured.replace(/\/+$/, "");
    try {
        return new URL(request.url).origin;
    } catch {
        return "";
    }
}

export async function HEAD(request: Request) {
    if (!process.env.DATABASE_URL) {
        return new Response(null, { status: 503 });
    }

    let identity = "";
    try {
        identity = new URL(request.url).searchParams.get("identity")?.trim() ?? "";
    } catch {
        identity = "";
    }

    if (identity.length < 8) {
        return new Response(null, {
            status: 200,
            headers: { "x-share-count": "0" },
        });
    }

    try {
        const count = await countSharesForIdentity(identity);
        return new Response(null, {
            status: 200,
            headers: {
                "x-share-count": String(count),
                "cache-control": "no-store",
            },
        });
    } catch (error) {
        console.error("share count failed", error);
        return new Response(null, {
            status: 200,
            headers: {
                "x-share-count": "0",
                "cache-control": "no-store",
            },
        });
    }
}

export async function POST(request: Request) {
    if (!process.env.DATABASE_URL) {
        return Response.json(
            { error: "Sharing is not configured on this deployment." },
            { status: 503 }
        );
    }

    const body = await request.json().catch(() => null);
    const parsed = shareRequestSchema.safeParse(body);

    if (!parsed.success) {
        return Response.json({ error: "Invalid share payload." }, { status: 400 });
    }

    const { identity, decode } = parsed.data;

    try {
        const count = await countSharesForIdentity(identity);

        if (count >= SHARE_LIMIT) {
            return Response.json(
                {
                    error: "Share limit reached for this browser. Revoke an existing share to create a new one.",
                },
                { status: 429 }
            );
        }

        const created = await createShare(identity, decode);
        const baseUrl = resolveBaseUrl(request);
        const url = `${baseUrl}/s/${created.id}`;

        return Response.json({
            id: created.id,
            deleteToken: created.deleteToken,
            url,
        });
    } catch (error) {
        console.error("share creation failed", error);
        return Response.json(
            { error: "The share could not be created. Please try again." },
            { status: 503 }
        );
    }
}