import type { VectorSearchHit } from "@hive-mind/shared";

export interface VectorHitProps {
  hit: VectorSearchHit;
  rank: number;
  onShowNeighbours?: (hit: VectorSearchHit) => void;
}

export function VectorHit({ hit, rank, onShowNeighbours }: VectorHitProps) {
  return (
    <article
      style={{
        padding: 12,
        borderBottom: "1px solid var(--border)",
        display: "grid",
        gridTemplateColumns: "32px 1fr 110px",
        gap: 12,
        alignItems: "start",
      }}
    >
      <span
        style={{
          fontFamily: "monospace",
          color: "var(--muted)",
          fontSize: 13,
        }}
      >
        #{rank}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
          <strong style={{ fontFamily: "monospace" }}>{hit.title ?? hit.entity_id}</strong>
          <span style={{ color: "var(--muted)", fontSize: 12 }}>{hit.source}</span>
          {hit.collection ? (
            <span
              style={{
                fontSize: 11,
                color: "var(--muted)",
                background: "var(--code-bg)",
                padding: "1px 6px",
                borderRadius: 4,
              }}
            >
              {hit.collection}
            </span>
          ) : null}
        </div>
        <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>
          {hit.source_uri}
        </div>
        <p
          style={{
            margin: "8px 0 0",
            color: "#374151",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {hit.snippet}
        </p>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 600 }}>
          {hit.score.toFixed(4)}
        </div>
        {onShowNeighbours ? (
          <button
            type="button"
            onClick={() => onShowNeighbours(hit)}
            style={{
              marginTop: 6,
              padding: "4px 8px",
              fontSize: 12,
              color: "var(--accent)",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            show neighbours
          </button>
        ) : null}
      </div>
    </article>
  );
}
