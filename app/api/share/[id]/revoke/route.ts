import { revokeShare } from "@/lib/share-store";
import { revokeRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    if (!process.env.DATABASE_URL) {
        return Response.json(
            { error: "Sharing is not configured on this deployment." },
            { status: 503 }
        );
    }

    const { id } = await context.params;

    if (!id || typeof id !== "string") {
        return Response.json(
            { error: "A share ID is required." },
            { status: 400 }
        );
    }

    const body = await request.json().catch(() => null);
    const parsed = revokeRequestSchema.safeParse(body);

    if (!parsed.success) {
        return Response.json(
            { error: "A delete token is required." },
            { status: 400 }
        );
    }

    try {
        const outcome = await revokeShare(id, parsed.data.deleteToken);

        if (outcome === "revoked") {
            return new Response(null, { status: 204 });
        }

        if (outcome === "forbidden") {
            return Response.json(
                { error: "The delete token does not match this share." },
                { status: 403 }
            );
        }

        return Response.json(
            { error: "That share does not exist." },
            { status: 404 }
        );
    } catch (error) {
        console.error("share revoke failed", error);
        return Response.json(
            { error: "The share could not be revoked. Please try again." },
            { status: 503 }
        );
    }
}