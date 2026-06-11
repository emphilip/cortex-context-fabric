import type { ConnectorStatus } from "@hive-mind/shared";

export interface ConnectorCardProps {
  connector: ConnectorStatus;
  lastRunSummary?: string;
}

export function ConnectorCard({ connector, lastRunSummary }: ConnectorCardProps) {
  return (
    <article
      style={{
        padding: 12,
        border: "1px solid var(--border)",
        borderRadius: 6,
        background: connector.supported ? "white" : "var(--code-bg)",
        opacity: connector.supported ? 1 : 0.7,
      }}
    >
      <header style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <strong>{connector.name}</strong>
        <span
          style={{
            fontSize: 11,
            padding: "1px 6px",
            borderRadius: 4,
            background: connector.supported ? "#dcfce7" : "#fef3c7",
            color: connector.supported ? "var(--success)" : "var(--warn)",
            fontWeight: 600,
          }}
        >
          {connector.supported ? "supported" : "deferred"}
        </span>
      </header>
      {connector.reason ? (
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--muted)" }}>
          {connector.reason}
        </p>
      ) : null}
      {lastRunSummary ? (
        <p style={{ margin: "6px 0 0", fontSize: 12 }}>
          <span style={{ color: "var(--muted)" }}>last run:</span> {lastRunSummary}
        </p>
      ) : null}
    </article>
  );
}
