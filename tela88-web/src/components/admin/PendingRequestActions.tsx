"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PendingRequestActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function handleConfirm() {
    if (!scheduledAt) return;

    setStatus("loading");

    const response = await fetch(`/api/admin/requests/${requestId}/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ scheduledAt, notes }),
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-2 block font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
          Confirmar pedido com dia e hora
        </label>
        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={(event) => setScheduledAt(event.target.value)}
          className="w-full border border-outline-variant/20 bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
        />
      </div>
      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        rows={3}
        placeholder="Notas internas desta marcação..."
        className="w-full resize-none border border-outline-variant/20 bg-surface-container-low px-4 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
      />
      <button
        type="button"
        onClick={handleConfirm}
        disabled={!scheduledAt || status === "loading"}
        className="w-full bg-primary-container px-4 py-3 font-headline text-sm font-bold uppercase tracking-[0.18em] text-on-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        {status === "loading" ? "A confirmar..." : "Confirmar e colocar na agenda"}
      </button>
      {status === "error" ? (
        <p className="font-body text-xs text-error">Não foi possível confirmar este pedido.</p>
      ) : null}
    </div>
  );
}
