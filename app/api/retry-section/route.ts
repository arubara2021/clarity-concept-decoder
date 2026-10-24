import { streamText } from "ai";
import { buildSectionPrompt } from "@/lib/prompts";
import { getGeminiModel } from "@/lib/ai";
import { retryRequestSchema } from "@/lib/validation";
import { MAX_SOURCE_CHARS, sourceTooLongMessage } from "@/lib/limits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function sseEvent(type: string, data: unknown): string {
    return `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
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

    const parsed = retryRequestSchema.safeParse(body);

    if (!parsed.success) {
        return Response.json(
            { error: "Please provide valid text, audience, and section." },
            { status: 400 }
        );
    }

    const { text, audience, section } = parsed.data;
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
                    console.error("retry model setup failed", error);
                    emit("section-error", {
                        section,
                        message: "The decoder is unavailable.",
                    });
                    shutdown();
                    return;
                }

                emit("section-start", { section });

                try {
                    const result = streamText({
                        model,
                        system: buildSectionPrompt(audience, section, text),
                        prompt: "Decode the source-grounded section now.",
                        temperature: 0,
                    });

                    for await (const delta of result.textStream) {
                        if (closed) return;
                        if (delta) emit("token", { section, text: delta });
                    }

                    emit("section-complete", { section });
                } catch (error) {
                    console.error("retry section failed", section, error);
                    emit("section-error", {
                        section,
                        message:
                            "This section couldn't be generated. The connection may have dropped.",
                    });
                }

                emit("done", {});
            } catch (error) {
                console.error("retry stream failed", error);
                emit("section-error", {
                    section,
                    message:
                        "This section couldn't be generated. The connection may have dropped.",
                });
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