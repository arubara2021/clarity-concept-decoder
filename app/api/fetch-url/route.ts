import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { fetchPublicHtml } from "@/lib/safe-url";
import { fetchUrlRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    const parsed = fetchUrlRequestSchema.safeParse(body);

    if (!parsed.success) {
        return Response.json(
            { error: "Paste a valid public URL." },
            { status: 400 }
        );
    }

    try {
        const result = await fetchPublicHtml(parsed.data.url);
        const dom = new JSDOM(result.html, { url: result.url });
        const article = new Readability(dom.window.document).parse();

        if (!article) {
            return Response.json(
                { error: "No readable article text was found at that URL." },
                { status: 422 }
            );
        }

        const text = article.textContent?.replace(/\s+/g, " ").trim() ?? "";

        if (!text) {
            return Response.json(
                { error: "No readable article text was found at that URL." },
                { status: 422 }
            );
        }

        let title = article.title?.trim();
        if (!title) {
            try {
                title = new URL(result.url).hostname;
            } catch {
                title = "Untitled page";
            }
        }

        return Response.json({
            text,
            url: result.url,
            title,
        });
    } catch (error) {
        console.error("fetch-url failed", error);
        const message =
            error instanceof Error
                ? error.message
                : "That URL could not be extracted.";
        return Response.json({ error: message }, { status: 422 });
    }
}