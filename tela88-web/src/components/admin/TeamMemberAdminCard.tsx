"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { teamMemberStatusLabels } from "@/lib/service-catalog";
import type { TeamMember, TeamMemberStatus, TeamTask } from "@/lib/crm-types";

type TeamMemberAdminCardProps = {
  member: TeamMember;
  tasks: TeamTask[];
  isAdmin: boolean;
};

export default function TeamMemberAdminCard({
  member,
  tasks,
  isAdmin,
}: TeamMemberAdminCardProps) {
  const router = useRouter();
  const memberTasks = useMemo(() => tasks.filter((task) => task.assigneeId === member.id), [member.id, tasks]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(member.name);
  const [username, setUsername] = useState(member.username ?? "");
  const [email, setEmail] = useState(member.email ?? "");
  const [role, setRole] = useState(member.role);
  const [status, setStatus] = useState<TeamMemberStatus>(member.status);
  const [dailyCapacity, setDailyCapacity] = useState(member.dailyCapacity);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const response = await fetch(`/api/admin/team/${member.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        username,
        email,
        role,
        status,
        dailyCapacity,
        password,
      }),
    });

    setSaving(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Nao foi possivel guardar o colaborador.");
      return;
    }

    setPassword("");
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!window.confirm(`Eliminar o colaborador ${member.name}?`)) return;

    setDeleting(true);
    setError("");

    const response = await fetch(`/api/admin/team/${member.id}`, {
      method: "DELETE",
    });

    setDeleting(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Nao foi possivel eliminar o colaborador.");
      return;
    }

    router.refresh();
  }

  if (!editing) {
    return (
      <div className="border border-outline-variant/15 bg-surface-container-low p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-headline text-xl font-bold text-on-surface">{member.name}</p>
            <p className="mt-1 font-body text-sm text-on-surface/55">{member.role}</p>
          </div>
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary-container">
            {teamMemberStatusLabels[member.status]}
          </span>
        </div>

        <div className="mt-4 space-y-2 font-body text-sm text-on-surface/62">
          <p>Utilizador: {member.username || "Sem username"}</p>
          <p>Email: {member.email || "Sem email"}</p>
          <p>Capacidade: {member.dailyCapacity}</p>
          <p>{memberTasks.length} tarefas atribuidas</p>
        </div>

        {isAdmin ? (
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setError("");
              }}
              className="flex-1 border border-outline-variant/20 px-4 py-3 font-headline text-xs font-bold uppercase tracking-[0.16em] text-on-surface transition-colors hover:border-primary-container"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 border border-error/30 px-4 py-3 font-headline text-xs font-bold uppercase tracking-[0.16em] text-error transition-colors hover:bg-error/8 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {deleting ? "A eliminar..." : "Eliminar"}
            </button>
          </div>
        ) : null}

        {error ? <p className="mt-3 font-body text-xs text-error">{error}</p> : null}
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="border border-primary-container/35 bg-surface-container-low p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="font-headline text-xl font-bold text-on-surface">Editar colaborador</h3>
        <button
          type="button"
          onClick={() => {
            setEditing(false);
            setPassword("");
            setError("");
            setName(member.name);
            setUsername(member.username ?? "");
            setEmail(member.email ?? "");
            setRole(member.role);
            setStatus(member.status);
            setDailyCapacity(member.dailyCapacity);
          }}
          className="border border-outline-variant/20 px-3 py-2 font-headline text-[11px] uppercase tracking-[0.16em] text-on-surface/70"
        >
          Fechar
        </button>
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
          placeholder="Capacidade diaria"
          className="w-full border border-outline-variant/20 bg-surface px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Nova palavra-passe (opcional)"
          className="w-full border border-outline-variant/20 bg-surface px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
        />
      </div>

      {error ? <p className="mt-3 font-body text-xs text-error">{error}</p> : null}

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="border border-error/30 px-4 py-3 font-headline text-xs font-bold uppercase tracking-[0.16em] text-error transition-colors hover:bg-error/8 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {deleting ? "A eliminar..." : "Eliminar colaborador"}
        </button>
        <button
          type="submit"
          disabled={saving}
          className="bg-primary-container px-4 py-3 font-headline text-xs font-bold uppercase tracking-[0.16em] text-on-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? "A guardar..." : "Guardar alteracoes"}
        </button>
      </div>
    </form>
  );
}
