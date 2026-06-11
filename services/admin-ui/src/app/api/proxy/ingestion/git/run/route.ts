import { runGit } from "@/lib/api";

export async function POST(req: Request) {
  const body = (await req.json()) as { repo_url?: string };
  if (!body.repo_url) {
    return new Response(JSON.stringify({ error: "repo_url required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  const out = await runGit(body.repo_url);
  if (!out) {
    return new Response(JSON.stringify({ error: "run failed" }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
  return new Response(JSON.stringify(out), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
