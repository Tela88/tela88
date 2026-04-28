"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  getServiceLabel,
  internalUserRoleLabels,
  serviceCatalog,
  teamMemberStatusLabels,
} from "@/lib/service-catalog";
import type { InternalUserRole, ServiceId, TeamMember, TeamMemberStatus, TeamTask } from "@/lib/crm-types";

type TeamMemberAdminCardProps = {
  member: TeamMember;
  tasks: TeamTask[];
  isAdmin: boolean;
};

export default function TeamMemberAdminCard({ member, tasks, isAdmin }: TeamMemberAdminCardProps) {
  const router = useRouter();
  const memberTasks = useMemo(() => tasks.filter((task) => task.assigneeId === member.id), [member.id, tasks]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(member.name);
  const [username, setUsername] = useState(member.username ?? "");
  const [email, setEmail] = useState(member.email ?? "");
  const [accessRole, setAccessRole] = useState<Exclude<InternalUserRole, "admin">>(
    member.accessRole === "secretaria" ? "secretaria" : "collaborator",
  );
  const [role, setRole] = useState(member.role);
  const [serviceIds, setServiceIds] = useState<ServiceId[]>(member.assignedServiceIds ?? []);
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
        accessRole,
        role,
        serviceIds,
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
          <div className="flex min-w-0 items-start gap-4">
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={member.name}
                className="h-14 w-14 rounded-full border border-outline-variant/20 object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-outline-variant/20 bg-surface text-sm font-bold text-primary-container">
                {member.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-headline text-xl font-bold text-on-surface">{member.name}</p>
              <p className="mt-1 truncate font-body text-sm text-on-surface/55">{member.role}</p>
              <p className="mt-2 font-label text-[10px] uppercase tracking-[0.18em] text-on-surface/35">
                {internalUserRoleLabels[member.accessRole ?? "collaborator"]}
              </p>
            </div>
          </div>
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-primary-container">
            {teamMemberStatusLabels[member.status]}
          </span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="border border-outline-variant/12 bg-surface px-4 py-3">
            <p className="font-label text-[10px] uppercase tracking-[0.18em] text-on-surface/35">Utilizador</p>
            <p className="mt-2 truncate font-body text-sm text-on-surface/70">{member.username || "Sem username"}</p>
          </div>
          <div className="border border-outline-variant/12 bg-surface px-4 py-3">
            <p className="font-label text-[10px] uppercase tracking-[0.18em] text-on-surface/35">Email</p>
            <p className="mt-2 truncate font-body text-sm text-on-surface/70">{member.email || "Sem email"}</p>
          </div>
          <div className="border border-outline-variant/12 bg-surface px-4 py-3">
            <p className="font-label text-[10px] uppercase tracking-[0.18em] text-on-surface/35">Capacidade</p>
            <p className="mt-2 truncate font-body text-sm text-on-surface/70">{member.dailyCapacity}</p>
          </div>
          <div className="border border-outline-variant/12 bg-surface px-4 py-3">
            <p className="font-label text-[10px] uppercase tracking-[0.18em] text-on-surface/35">Carga atual</p>
            <p className="mt-2 font-body text-sm text-on-surface/70">{memberTasks.length} tarefas atribuidas</p>
          </div>
        </div>

        <div className="mt-5 border border-outline-variant/12 bg-surface px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-label text-[10px] uppercase tracking-[0.18em] text-on-surface/35">Servicos ligados</p>
            <span className="font-label text-[10px] uppercase tracking-[0.18em] text-on-surface/35">
              {member.assignedServiceIds.length} ativos
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {member.assignedServiceIds.length === 0 ? (
              <span className="font-body text-sm text-on-surface/45">Sem servicos associados.</span>
            ) : (
              member.assignedServiceIds.map((serviceId) => (
                <span
                  key={`${member.id}-${serviceId}`}
                  className="border border-primary-container/18 bg-primary-container/8 px-2 py-1 font-body text-xs text-primary-container"
                >
                  {getServiceLabel(serviceId)}
                </span>
              ))
            )}
          </div>
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
            setAccessRole(member.accessRole === "secretaria" ? "secretaria" : "collaborator");
            setRole(member.role);
            setServiceIds(member.assignedServiceIds ?? []);
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

        <div className="grid gap-3 md:grid-cols-2">
          <select
            value={accessRole}
            onChange={(event) => setAccessRole(event.target.value as Exclude<InternalUserRole, "admin">)}
            className="w-full border border-outline-variant/20 bg-surface px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
          >
            <option value="collaborator">{internalUserRoleLabels.collaborator}</option>
            <option value="secretaria">{internalUserRoleLabels.secretaria}</option>
          </select>
          <input
            type="text"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            placeholder="Funcao"
            className="w-full border border-outline-variant/20 bg-surface px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
          />
        </div>

        <div className="border border-outline-variant/20 bg-surface p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="font-label text-[10px] uppercase tracking-[0.18em] text-on-surface/35">
              Servicos associados
            </p>
            <span className="font-label text-[10px] uppercase tracking-[0.18em] text-on-surface/35">
              {serviceIds.length} selecionados
            </span>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {serviceCatalog.map((service) => {
              const active = serviceIds.includes(service.id);

              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() =>
                    setServiceIds((prev) =>
                      prev.includes(service.id) ? prev.filter((item) => item !== service.id) : [...prev, service.id],
                    )
                  }
                  className={`border px-3 py-2 text-left text-sm transition-colors ${
                    active
                      ? "border-primary-container bg-primary-container text-on-primary"
                      : "border-outline-variant/20 bg-surface-container-low text-on-surface/72"
                  }`}
                >
                  {getServiceLabel(service.id)}
                </button>
              );
            })}
          </div>
        </div>

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
