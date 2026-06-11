// Tiny pipeline-service client used by server components.

const PIPELINE_URL =
  process.env.HIVE_MIND__PIPELINE__URL || "http://pipeline:8000";

export interface AuditRow {
  id: number;
  created_at: string;
  correlation_id: string;
  tenant: string;
  principal: string;
  roles: string[];
  tool: string;
  query: string;
  final_entity_ids: string[];
  candidate_ids: string[];
  final_context_hash: string;
  tokens_in: number;
  tokens_out: number;
  latency_ms: number;
  outcome: "ok" | "error";
  error_code?: string | null;
}

export async function listRecentAudits(limit = 50): Promise<AuditRow[]> {
  const res = await fetch(`${PIPELINE_URL}/audit/recent?limit=${limit}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const body = (await res.json()) as { items: AuditRow[] };
  return body.items ?? [];
}

export async function getAudit(id: number): Promise<AuditRow | null> {
  const res = await fetch(`${PIPELINE_URL}/audit/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()) as AuditRow;
}
