import { z } from "zod";

export const audienceSchema = z.enum(["Student", "Executive", "Developer (Non-ML)"]);

export const decodeRequestSchema = z.object({
    text: z.string().trim().min(1, "Please paste some text to decode.").max(20000),
    audience: audienceSchema,
});

export type Audience = z.infer<typeof audienceSchema>;
