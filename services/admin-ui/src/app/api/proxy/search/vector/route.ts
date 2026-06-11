// Next.js route handler that proxies POST /search/vector to the pipeline.
// Client components in the admin UI cannot reach the compose-internal pipeline
// URL directly, so this server route brokers the call.

import { vectorSearch } from "@/lib/api";

export async function POST(req: Request) {
  const body = await req.json();
  const out = await vectorSearch(body);
  if (out === null) {
    return new Response(JSON.stringify({ error: "search failed" }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
  return new Response(JSON.stringify(out), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
