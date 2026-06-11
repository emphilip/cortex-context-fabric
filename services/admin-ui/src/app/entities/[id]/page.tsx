import { notFound } from "next/navigation";
import { EntityDetailView } from "./EntityDetailView";
import { getEntity } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function EntityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const entity = await getEntity(id);
  if (!entity) notFound();
  return <EntityDetailView entity={entity} />;
}
