import { TokenBar } from "./TokenBar";

export interface AuditRecordViewProps {
  record: {
    id: number;
    created_at: string;
    correlation_id: string;
    tenant: string;
    principal: string;
    roles: string[];
    tool: string;
    query: string;
    candidate_ids: string[];
    final_entity_ids: string[];
    final_context_hash: string;
    tokens_in: number;
    tokens_out: number;
    latency_ms: number;
    outcome: "ok" | "error";
    error_code?: string | null;
  };
}

function Pair({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "var(--muted)" }}>{label}</div>
      <div style={{ fontFamily: typeof value === "string" && value.length > 20 ? "monospace" : "inherit" }}>
        {value}
      </div>
    </div>
  );
}

export function AuditRecordView({ record }: AuditRecordViewProps) {
  return (
    <article style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <header style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Audit #{record.id}</h2>
        <span
          style={{
            color: record.outcome === "ok" ? "var(--success)" : "var(--error)",
            fontWeight: 600,
          }}
        >
          {record.outcome.toUpperCase()}
        </span>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          padding: 12,
          border: "1px solid var(--border)",
          borderRadius: 6,
        }}
      >
        <Pair label="created_at" value={new Date(record.created_at).toLocaleString()} />
        <Pair label="correlation_id" value={record.correlation_id} />
        <Pair label="tenant" value={record.tenant} />
        <Pair label="principal" value={record.principal} />
        <Pair label="roles" value={record.roles.join(", ")} />
        <Pair label="tool" value={record.tool} />
        <Pair label="latency_ms" value={`${record.latency_ms} ms`} />
        <Pair label="final_context_hash" value={record.final_context_hash.slice(0, 16) + "…"} />
        <Pair label="error_code" value={record.error_code ?? "—"} />
      </section>

      <section>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Query</div>
        <pre style={{ margin: 0 }}>{record.query}</pre>
      </section>

      <section>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Token usage</div>
        <TokenBar tokens_in={record.tokens_in} tokens_out={record.tokens_out} />
      </section>

      <section>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
          Candidates ({record.candidate_ids.length}) → final ({record.final_entity_ids.length})
        </div>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {record.final_entity_ids.map((id) => (
            <li key={id} style={{ fontFamily: "monospace" }}>
              {id}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
