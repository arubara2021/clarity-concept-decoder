import { streamText, generateObject } from "ai";
import { buildSectionPrompt, buildGraphPrompt } from "@/lib/prompts";
import { getGeminiModel } from "@/lib/ai";
import { decodeRequestSchema } from "@/lib/validation";
import { graphSchema } from "@/lib/graph-schema";
import { MAX_SOURCE_CHARS, sourceTooLongMessage } from "@/lib/limits";
import type { DecodeSection } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const sections: DecodeSection[] = ["tldr", "analogy", "jargon", "takeaway"];

function sseEvent(type: string, data: unknown): string {
    return `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
}

function sectionErrorMessage(): string {
    return "This section couldn't be generated. The connection may have dropped.";
}

export async function POST(request: Request) {
    const body = await request.json().catch(() => null);

    if (
        body &&
        typeof body.text === "string" &&
        body.text.length > MAX_SOURCE_CHARS
    ) {
        return Response.json({ error: sourceTooLongMessage() }, { status: 400 });
    }

    const parsed = decodeRequestSchema.safeParse(body);

    if (!parsed.success) {
        return Response.json(
            { error: "Please provide valid text and audience." },
            { status: 400 }
        );
    }

    const { text, audience } = parsed.data;
    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            let closed = false;

            const emit = (type: string, data: unknown) => {
                if (closed) return;
                try {
                    controller.enqueue(encoder.encode(sseEvent(type, data)));
                } catch {
                    closed = true;
                }
            };

            const shutdown = () => {
                if (closed) return;
                closed = true;
                try {
                    controller.close();
                } catch {
                    void 0;
                }
            };

            try {
                let model;
                try {
                    model = getGeminiModel();
                } catch (error) {
                    console.error("decode model setup failed", error);
                    emit("global-error", { message: "The decoder is unavailable." });
                    shutdown();
                    return;
                }

                for (const section of sections) {
                    if (closed) return;
                    emit("section-start", { section });

                    try {
                        const result = streamText({
                            model,
                            system: buildSectionPrompt(audience, section, text),
                            prompt: "Decode the source-grounded section now.",
                        });

                        for await (const delta of result.textStream) {
                            if (closed) return;
                            if (delta) emit("token", { section, text: delta });
                        }

                        emit("section-complete", { section });
                    } catch (error) {
                        console.error("decode section failed", section, error);
                        emit("section-error", {
                            section,
                            message: sectionErrorMessage(),
                        });
                    }
                }

                if (closed) return;

                try {
                    const graph = await generateObject({
                        model,
                        schema: graphSchema,
                        system:
                            "You extract only source-supported concepts and relationships. Never invent graph facts.",
                        prompt: buildGraphPrompt(text),
                    });
                    emit("graph", graph.object);
                } catch (error) {
                    console.error("decode graph failed", error);
                    emit("graph-error", {
                        message:
                            "The concept map couldn't be generated. The four sections are still available.",
                    });
                }

                emit("done", {});
            } catch (error) {
                console.error("decode stream failed", error);
                emit("global-error", { message: "The decoder is unavailable." });
            } finally {
                shutdown();
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no",
        },
    });
}