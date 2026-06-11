import { notFound } from "next/navigation";
import { AuditRecordView } from "@/components/AuditRecordView";
import { getAudit } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function QueryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numeric = Number(id);
  if (!Number.isFinite(numeric)) notFound();
  const record = await getAudit(numeric);
  if (!record) notFound();
  return <AuditRecordView record={record} />;
}
