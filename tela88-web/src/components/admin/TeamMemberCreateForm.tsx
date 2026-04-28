"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { teamMemberStatusLabels } from "@/lib/service-catalog";
import type { TeamMemberStatus } from "@/lib/crm-types";

export default function TeamMemberCreateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<TeamMemberStatus>("disponivel");
  const [dailyCapacity, setDailyCapacity] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const response = await fetch("/api/admin/team", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        username,
        email,
        password,
        role,
        status,
        dailyCapacity,
      }),
    });

    setSaving(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Nao foi possivel criar o colaborador.");
      return;
    }

    setName("");
    setUsername("");
    setEmail("");
    setPassword("");
    setRole("");
    setStatus("disponivel");
    setDailyCapacity("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="border border-outline-variant/15 bg-surface-container-low p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-headline text-xl font-bold text-on-surface">Novo colaborador</h3>
        <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
          Equipa
        </span>
      </div>

      <div className="grid gap-3">
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nome"
          className="w-full border border-outline-variant/20 bg-surface px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
        />
        <div className="grid gap-3 md:grid-cols-2">
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Utilizador"
            className="w-full border border-outline-variant/20 bg-surface px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
          />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="w-full border border-outline-variant/20 bg-surface px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
          />
        </div>
        <input
          type="text"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          placeholder="Funcao"
          className="w-full border border-outline-variant/20 bg-surface px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as TeamMemberStatus)}
          className="w-full border border-outline-variant/20 bg-surface px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
        >
          {Object.entries(teamMemberStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={dailyCapacity}
          onChange={(event) => setDailyCapacity(event.target.value)}
          placeholder="Capacidade diaria ex. 4h livres hoje"
          className="w-full border border-outline-variant/20 bg-surface px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Palavra-passe inicial"
          className="w-full border border-outline-variant/20 bg-surface px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
        />
      </div>

      {error ? <p className="mt-3 font-body text-xs text-error">{error}</p> : null}

      <button
        type="submit"
        disabled={saving}
        className="mt-4 w-full bg-primary-container px-4 py-3 font-headline text-sm font-bold uppercase tracking-[0.16em] text-on-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? "A criar..." : "Adicionar colaborador"}
      </button>
    </form>
  );
}
