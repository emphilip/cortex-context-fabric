// Client-side DELETE handler that proxies to the pipeline.

import { tombstoneEntity } from "@/lib/api";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const out = await tombstoneEntity(id);
  if (!out) {
    return new Response(JSON.stringify({ error: "tombstone failed" }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
  return new Response(JSON.stringify(out), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
