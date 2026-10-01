import { streamText } from "ai";
import { buildSectionPrompt, type DecodeSection } from "@/lib/prompts";
import { getGeminiModel } from "@/lib/ai";
import { decodeRequestSchema } from "@/lib/validation";

const sections: DecodeSection[] = ["tldr", "analogy", "jargon", "takeaway"];

function event(type: string, data: Record<string, string>) {
    return `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    const parsed = decodeRequestSchema.safeParse(body);

    if (!parsed.success) {
        return Response.json({ error: "Please provide valid text and audience." }, { status: 400 });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            try {
                const model = getGeminiModel();

                for (const section of sections) {
                    controller.enqueue(encoder.encode(event("section-start", { section })));
                    const result = streamText({
                        model,
                        system: buildSectionPrompt(parsed.data.audience, section),
                        prompt: parsed.data.text,
                        temperature: 0.2,
                    });

                    for await (const delta of result.textStream) {
                        controller.enqueue(encoder.encode(event("token", { section, text: delta })));
                    }

                    controller.enqueue(encoder.encode(event("section-complete", { section })));
                }

                controller.enqueue(encoder.encode(event("done", {})));
            } catch (error) {
                const message = error instanceof Error ? error.message : "The decoder is unavailable.";
                controller.enqueue(encoder.encode(event("global-error", { message })));
            } finally {
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "Content-Type": "text/event-stream",
        },
    });
}
