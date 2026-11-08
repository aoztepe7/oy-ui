import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";

/** Tags the API may invalidate (see docs/API.md). */
const TAG_RE = /^(page:[a-z0-9-]+|pages|site|programs|themes|team)$/;

/**
 * Called by oy-service when content changes:
 * POST /api/revalidate, header `x-revalidate-secret`, body `{ "tags": ["page:contact"] }`.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return Response.json({ revalidated: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { tags?: unknown } | null;
  const tags = Array.isArray(body?.tags) ? body.tags.filter((t): t is string => typeof t === "string" && TAG_RE.test(t)) : [];
  if (tags.length === 0) {
    return Response.json({ revalidated: false, message: "Body must be { tags: string[] }" }, { status: 400 });
  }

  // Webhook from another service: expire immediately so the next visitor gets fresh content.
  for (const tag of tags) revalidateTag(tag, { expire: 0 });

  return Response.json({ revalidated: true, tags, now: Date.now() });
}
