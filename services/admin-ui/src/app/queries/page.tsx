import { QueryRow } from "@/components/QueryRow";
import { listRecentAudits } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function QueriesPage() {
  const rows = await listRecentAudits(100);

  return (
    <section>
      <h1>Queries</h1>
      <p style={{ color: "var(--muted)" }}>
        Most recent {rows.length} audited retrievals from the pipeline. Click a row
        to see the full audit record and the assembled context.
      </p>

      {rows.length === 0 ? (
        <div
          style={{
            padding: 24,
            border: "1px dashed var(--border)",
            borderRadius: 6,
            color: "var(--muted)",
          }}
        >
          No queries yet. Try ingesting a git repo with{" "}
          <code>make ingest-git REPO=…</code> and then call the MCP server.
        </div>
      ) : (
        <div style={{ border: "1px solid var(--border)", borderRadius: 6, marginTop: 12 }}>
          {rows.map((r) => (
            <QueryRow
              key={r.id}
              id={r.id}
              created_at={r.created_at}
              principal={r.principal}
              tool={r.tool}
              query={r.query}
              tokens_in={r.tokens_in}
              tokens_out={r.tokens_out}
              latency_ms={r.latency_ms}
              outcome={r.outcome}
            />
          ))}
        </div>
      )}
    </section>
  );
}
