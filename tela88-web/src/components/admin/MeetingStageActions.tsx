"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MeetingStageActions({
  requestId,
  mode,
}: {
  requestId: string;
  mode: "atendido" | "cliente";
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function handleAction() {
    setStatus("loading");

    const endpoint =
      mode === "atendido"
        ? `/api/admin/requests/${requestId}/attended`
        : `/api/admin/requests/${requestId}/convert`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleAction}
        disabled={status === "loading"}
        className="w-full bg-primary-container px-4 py-3 font-headline text-sm font-bold uppercase tracking-[0.18em] text-on-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        {status === "loading"
          ? "A guardar..."
          : mode === "atendido"
            ? "Marcar como atendido"
            : "Passar para cliente"}
      </button>
      {status === "error" ? (
        <p className="font-body text-xs text-error">Não foi possível atualizar este estado.</p>
      ) : null}
    </div>
  );
}
