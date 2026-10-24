import { z } from "zod";
import type { ConceptGraph } from "./types";

const nodeSchema = z.object({
    id: z.string().min(1).max(80),
    label: z.string().min(1).max(120),
});

const edgeSchema = z.object({
    id: z.string().min(1).max(120),
    source: z.string().min(1).max(80),
    target: z.string().min(1).max(80),
    label: z.string().max(80).optional(),
});

export const graphSchema = z
    .object({
        nodes: z.array(nodeSchema).max(24),
        edges: z.array(edgeSchema).max(36),
    })
    .superRefine((graph, context) => {
        const ids = new Set(graph.nodes.map((node) => node.id));
        graph.edges.forEach((edge, index) => {
            if (!ids.has(edge.source) || !ids.has(edge.target)) {
                context.addIssue({
                    code: "custom",
                    path: ["edges", index],
                    message: "Edge references an unknown node.",
                });
            }
        });
    }) satisfies z.ZodType<ConceptGraph>;