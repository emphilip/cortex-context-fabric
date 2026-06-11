"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Entity } from "@hive-mind/shared";
import { EntityDetail } from "@/components/EntityDetail";

export function EntityDetailView({ entity }: { entity: Entity }) {
  const router = useRouter();
  const [showFullBody, setShowFullBody] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTombstone = async () => {
    if (!confirm("Soft-delete this entity? It will be excluded from future retrievals.")) {
      return;
    }
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/proxy/entities/${entity.entity_id}`, {
      method: "DELETE",
    });
    setBusy(false);
    if (!res.ok) {
      setError(`Tombstone failed (${res.status})`);
      return;
    }
    router.refresh();
  };

  return (
    <>
      {error ? (
        <div
          style={{
            padding: 12,
            marginBottom: 12,
            color: "var(--error)",
            border: "1px solid var(--error)",
            borderRadius: 6,
          }}
        >
          {error}
        </div>
      ) : null}
      <EntityDetail
        entity={entity}
        showFullBody={showFullBody}
        onToggleFullBody={() => setShowFullBody((v) => !v)}
        onTombstone={busy ? undefined : handleTombstone}
      />
    </>
  );
}
