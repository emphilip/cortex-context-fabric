"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

async function send(path: string, method: string, body: object) {
  return fetch(`/api/proxy/graph/${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function ConceptActions({
  conceptId,
  layout = "row",
}: {
  conceptId: string;
  layout?: "row" | "menu";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const menu = layout === "menu";
  const wrapClass = menu ? "flex flex-col gap-1" : "mb-3 flex gap-2";
  const btnClass = menu ? "w-full justify-start" : undefined;
  async function transition(action: string) {
    setBusy(true);
    await send(`concepts/${conceptId}/${action}`, "POST", { reason: "admin review" });
    setBusy(false);
    router.refresh();
  }
  async function tombstone() {
    setBusy(true);
    await send(`concepts/${conceptId}`, "DELETE", { reason: "admin review" });
    setBusy(false);
    router.push("/graph");
    router.refresh();
  }
  async function merge() {
    const raw = window.prompt("Comma-separated concept IDs to merge into this concept");
    const fromIds = raw?.split(",").map((item) => item.trim()).filter(Boolean);
    if (!fromIds?.length) return;
    setBusy(true);
    await send("concepts/merge", "POST", {
      into_id: conceptId,
      from_ids: fromIds,
      reason: "admin merge",
    });
    setBusy(false);
    router.refresh();
  }
  return (
    <div className={wrapClass}>
      <Button size="sm" className={btnClass} disabled={busy} onClick={() => transition("promote")}>Promote</Button>
      <Button size="sm" variant="secondary" className={btnClass} disabled={busy} onClick={() => transition("demote")}>Demote</Button>
      <Button size="sm" variant="outline" className={btnClass} disabled={busy} onClick={merge}>Merge into…</Button>
      <Button size="sm" variant="destructive" className={btnClass} disabled={busy} onClick={tombstone}>Tombstone</Button>
    </div>
  );
}

export function VocabCreateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    await send("vocab", "POST", { name: name.trim(), description });
    setName("");
    setDescription("");
    router.refresh();
  }
  return (
    <form onSubmit={submit} className="mb-3 flex gap-2">
      <Input aria-label="Relationship name" value={name} onChange={(event) => setName(event.target.value)} placeholder="relationship_name" className="max-w-xs" />
      <Input aria-label="Relationship description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" className="max-w-sm" />
      <Button type="submit" variant="secondary">Add type</Button>
    </form>
  );
}
