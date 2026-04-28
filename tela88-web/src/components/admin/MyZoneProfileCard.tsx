"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AuthenticatedUser } from "@/lib/crm-types";

export default function MyZoneProfileCard({ user }: { user: AuthenticatedUser }) {
  const router = useRouter();
  const [preview, setPreview] = useState(user.avatarUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function uploadAvatar(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Escolhe uma imagem valida.");
      return;
    }

    if (file.size > 1_000_000) {
      setError("A imagem deve ter no maximo 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) return;

      setPreview(result);
      setSaving(true);
      setError("");

      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatarUrl: result,
        }),
      });

      setSaving(false);

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error ?? "Nao foi possivel guardar a foto.");
        return;
      }

      router.refresh();
    };

    reader.readAsDataURL(file);
  }

  return (
    <div className="border border-outline-variant/15 bg-surface-container-low p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-headline text-2xl font-bold text-on-surface">Perfil</h3>
          <p className="mt-2 font-body text-sm text-on-surface/55">
            Foto, identificação e role dentro da operação.
          </p>
        </div>
        <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
          Minha Zona
        </span>
      </div>

      <div className="mt-5 flex items-center gap-4">
        {preview ? (
          <img
            src={preview}
            alt={user.name}
            className="h-20 w-20 rounded-full border border-outline-variant/20 object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-outline-variant/20 bg-surface text-xl font-bold text-primary-container">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
        )}

        <div className="min-w-0">
          <p className="truncate font-headline text-xl font-bold text-on-surface">{user.name}</p>
          <p className="mt-1 truncate font-body text-sm text-on-surface/55">{user.functionRole || user.role}</p>
          <p className="mt-1 truncate font-body text-sm text-on-surface/45">@{user.username}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        <label className="border border-outline-variant/20 bg-surface px-4 py-3 font-label text-[10px] uppercase tracking-[0.18em] text-on-surface/70 transition-colors hover:border-primary-container">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void uploadAvatar(file);
              }
            }}
          />
          {saving ? "A carregar foto..." : "Upload foto de perfil"}
        </label>

        {preview ? (
          <button
            type="button"
            onClick={async () => {
              setSaving(true);
              setError("");
              const response = await fetch("/api/auth/profile", {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ avatarUrl: null }),
              });
              setSaving(false);
              if (!response.ok) {
                const payload = (await response.json().catch(() => null)) as { error?: string } | null;
                setError(payload?.error ?? "Nao foi possivel remover a foto.");
                return;
              }
              setPreview("");
              router.refresh();
            }}
            className="border border-outline-variant/20 bg-surface px-4 py-3 font-label text-[10px] uppercase tracking-[0.18em] text-on-surface/55"
          >
            Remover foto
          </button>
        ) : null}

        {error ? <p className="font-body text-xs text-error">{error}</p> : null}
      </div>
    </div>
  );
}
