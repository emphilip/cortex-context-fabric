import Link from "next/link";
import type { EntityListItem } from "@hive-mind/shared";

export interface EntityRowProps {
  entity: EntityListItem;
}

function freshnessColor(state: string): string {
  if (state === "fresh") return "var(--success)";
  if (state === "stale") return "var(--warn)";
  return "var(--muted)";
}

export function EntityRow({ entity }: EntityRowProps) {
  const tombstoned = entity.tombstoned_at != null;
  return (
    <Link
      href={`/entities/${entity.entity_id}`}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 80px 90px 90px 140px 50px",
        gap: 12,
        padding: "8px 12px",
        borderBottom: "1px solid var(--border)",
        color: "inherit",
        textDecoration: "none",
        opacity: tombstoned ? 0.55 : 1,
      }}
    >
      <span
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        title={entity.source_uri}
      >
        {entity.title ?? entity.source_uri}
      </span>
      <span style={{ color: "var(--muted)", fontFamily: "monospace", fontSize: 12 }}>
        {entity.source}
      </span>
      <span style={{ color: "var(--muted)", fontSize: 12 }}>{entity.classification}</span>
      <span style={{ color: freshnessColor(entity.freshness_state), fontSize: 12 }}>
        {entity.freshness_state}
      </span>
      <span style={{ color: "var(--muted)", fontFamily: "monospace", fontSize: 12 }}>
        {new Date(entity.updated_at).toLocaleString()}
      </span>
      {tombstoned ? (
        <span style={{ color: "var(--error)", fontSize: 11, fontWeight: 600 }}>RIP</span>
      ) : (
        <span />
      )}
    </Link>
  );
}
