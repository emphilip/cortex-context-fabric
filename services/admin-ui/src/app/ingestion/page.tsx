import { ConnectorCard } from "@/components/ConnectorCard";
import { IngestionRunRow } from "@/components/IngestionRunRow";
import { listConnectors, listRecentRuns } from "@/lib/api";
import { RunNowPanel } from "./RunNowPanel";

export const dynamic = "force-dynamic";

export default async function IngestionPage() {
  const [connectors, runs] = await Promise.all([listConnectors(), listRecentRuns()]);

  const lastByConnector = new Map<string, string>();
  for (const r of runs) {
    if (!lastByConnector.has(r.connector)) {
      const when = new Date(r.started_at).toLocaleString();
      const summary = `${r.status}${
        r.status === "succeeded" && r.parents != null
          ? ` · ${r.parents} files / ${r.chunks} chunks`
          : ""
      } · ${when}`;
      lastByConnector.set(r.connector, summary);
    }
  }

  return (
    <section>
      <h1>Ingestion</h1>
      <p style={{ color: "var(--muted)", marginTop: 0 }}>
        Connectors configured in this deploy. Run history is in-memory and will
        clear on service restart (durable history lands with a follow-up change).
      </p>

      <section style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, margin: "0 0 8px" }}>Connectors</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 8,
          }}
        >
          {connectors.length === 0 ? (
            <div style={{ color: "var(--muted)" }}>
              Could not reach ingestion service — is the stack up?
            </div>
          ) : (
            connectors.map((c) => (
              <ConnectorCard
                key={c.name}
                connector={c}
                lastRunSummary={lastByConnector.get(c.name)}
              />
            ))
          )}
        </div>
      </section>

      <section style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, margin: "0 0 8px" }}>Run now (git)</h2>
        <RunNowPanel />
      </section>

      <section>
        <h2 style={{ fontSize: 16, margin: "0 0 8px" }}>Recent runs</h2>
        {runs.length === 0 ? (
          <div
            style={{
              padding: 24,
              border: "1px dashed var(--border)",
              borderRadius: 6,
              color: "var(--muted)",
            }}
          >
            No runs yet.
          </div>
        ) : (
          <div style={{ border: "1px solid var(--border)", borderRadius: 6 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr 100px 90px 90px 90px",
                gap: 12,
                padding: "8px 12px",
                borderBottom: "1px solid var(--border)",
                background: "var(--code-bg)",
                fontSize: 11,
                color: "var(--muted)",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              <span>status</span>
              <span>repo</span>
              <span>started</span>
              <span>duration</span>
              <span>files</span>
              <span>chunks</span>
            </div>
            {runs.map((r) => (
              <IngestionRunRow key={r.run_id} run={r} />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
