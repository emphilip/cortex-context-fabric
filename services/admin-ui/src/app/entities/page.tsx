import { EntityRow } from "@/components/EntityRow";
import { listEntities } from "@/lib/api";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    source?: string;
    classification?: string;
    freshness_state?: string;
    limit?: string;
    offset?: string;
  }>;
}

function num(v: string | undefined, fallback: number): number {
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default async function EntitiesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const limit = Math.min(200, num(params.limit, 50));
  const offset = Math.max(0, num(params.offset, 0));
  const result = await listEntities({
    source: params.source,
    classification: params.classification,
    freshness_state: params.freshness_state,
    limit,
    offset,
  });

  return (
    <section>
      <h1>Entities</h1>
      <p style={{ color: "var(--muted)", marginTop: 0 }}>
        {result.total} matching · showing {result.items.length} (offset {offset})
      </p>

      <form
        method="get"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 12,
          padding: 12,
          border: "1px solid var(--border)",
          borderRadius: 6,
        }}
      >
        <input
          name="source"
          placeholder="source (e.g. git)"
          defaultValue={params.source ?? ""}
          style={{
            padding: "6px 10px",
            border: "1px solid var(--border)",
            borderRadius: 4,
            fontSize: 13,
          }}
        />
        <input
          name="classification"
          placeholder="classification"
          defaultValue={params.classification ?? ""}
          style={{
            padding: "6px 10px",
            border: "1px solid var(--border)",
            borderRadius: 4,
            fontSize: 13,
          }}
        />
        <select
          name="freshness_state"
          defaultValue={params.freshness_state ?? ""}
          style={{
            padding: "6px 10px",
            border: "1px solid var(--border)",
            borderRadius: 4,
            fontSize: 13,
          }}
        >
          <option value="">freshness — any</option>
          <option value="fresh">fresh</option>
          <option value="stale">stale</option>
          <option value="unknown">unknown</option>
        </select>
        <input type="hidden" name="limit" value={limit} />
        <button
          type="submit"
          style={{
            padding: "6px 16px",
            background: "var(--accent)",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Apply
        </button>
      </form>

      {result.items.length === 0 ? (
        <div
          style={{
            padding: 24,
            border: "1px dashed var(--border)",
            borderRadius: 6,
            color: "var(--muted)",
          }}
        >
          No entities match. Try ingesting a repo from the{" "}
          <a href="/ingestion">ingestion page</a>.
        </div>
      ) : (
        <div style={{ border: "1px solid var(--border)", borderRadius: 6 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 80px 90px 90px 140px 50px",
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
            <span>title / uri</span>
            <span>source</span>
            <span>class</span>
            <span>freshness</span>
            <span>updated</span>
            <span />
          </div>
          {result.items.map((e) => (
            <EntityRow key={e.entity_id} entity={e} />
          ))}
        </div>
      )}

      <Pagination total={result.total} limit={limit} offset={offset} params={params} />
    </section>
  );
}

function Pagination({
  total,
  limit,
  offset,
  params,
}: {
  total: number;
  limit: number;
  offset: number;
  params: Record<string, string | undefined>;
}) {
  const next = offset + limit;
  const prev = Math.max(0, offset - limit);
  const qs = (newOffset: number) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v) u.set(k, v);
    }
    u.set("limit", String(limit));
    u.set("offset", String(newOffset));
    return u.toString();
  };

  if (total <= limit) return null;
  return (
    <nav style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
      <a
        href={offset > 0 ? `?${qs(prev)}` : undefined}
        style={{ color: offset > 0 ? "var(--accent)" : "var(--muted)" }}
      >
        ← prev
      </a>
      <span style={{ color: "var(--muted)" }}>
        {offset + 1}–{Math.min(total, offset + limit)} of {total}
      </span>
      <a
        href={next < total ? `?${qs(next)}` : undefined}
        style={{ color: next < total ? "var(--accent)" : "var(--muted)" }}
      >
        next →
      </a>
    </nav>
  );
}
