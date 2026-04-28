"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getServiceSummary, serviceCatalog } from "@/lib/service-catalog";
import type { ServiceId, ServiceSubservice } from "@/lib/crm-types";

export default function ServiceSubservicePanel({
  subservices,
  isAdmin,
}: {
  subservices: ServiceSubservice[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [serviceId, setServiceId] = useState<ServiceId>("websites-crm");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  const grouped = useMemo(
    () =>
      Object.fromEntries(
        serviceCatalog.map((service) => [
          service.id,
          subservices.filter((item) => item.serviceId === service.id),
        ]),
      ) as Record<ServiceId, ServiceSubservice[]>,
    [subservices],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const response = await fetch("/api/admin/service-subservices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        serviceId,
        name,
        description,
      }),
    });

    setSaving(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Não foi possível registar o sub-serviço.");
      return;
    }

    setName("");
    setDescription("");
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Eliminar este sub-serviço?")) return;

    setDeletingId(id);
    setError("");

    const response = await fetch(`/api/admin/service-subservices/${id}`, {
      method: "DELETE",
    });

    setDeletingId("");

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Não foi possível eliminar o sub-serviço.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(340px,0.42fr)_minmax(0,1fr)]">
      <div className="border border-outline-variant/15 bg-surface-container-low p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-headline text-2xl font-bold text-on-surface">Base de sub-serviços</h3>
          <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
            Catálogo
          </span>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3">
          <select
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value as ServiceId)}
            disabled={!isAdmin}
            className="w-full border border-outline-variant/20 bg-surface px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container disabled:opacity-60"
          >
            {serviceCatalog.map((service) => (
              <option key={service.id} value={service.id}>
                {service.label}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={!isAdmin}
            placeholder="Nome do sub-serviço"
            className="w-full border border-outline-variant/20 bg-surface px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container disabled:opacity-60"
          />

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={!isAdmin}
            rows={4}
            placeholder="Descrição curta da entrega ou especialidade"
            className="w-full resize-none border border-outline-variant/20 bg-surface px-3 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container disabled:opacity-60"
          />

          <div className="border border-outline-variant/12 bg-surface px-3 py-3">
            <p className="font-label text-[10px] uppercase tracking-[0.18em] text-on-surface/35">
              Como estamos a usar isto
            </p>
            <p className="mt-2 font-body text-sm leading-relaxed text-on-surface/60">
              Os sub-serviços entram nas tarefas para distinguir o trabalho concreto dentro de cada serviço principal.
            </p>
          </div>

          {error ? <p className="font-body text-xs text-error">{error}</p> : null}

          {isAdmin ? (
            <button
              type="submit"
              disabled={saving}
              className="bg-primary-container px-4 py-3 font-headline text-sm font-bold uppercase tracking-[0.16em] text-on-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "A registar..." : "Registar sub-serviço"}
            </button>
          ) : (
            <div className="border border-outline-variant/12 bg-surface px-4 py-3 font-body text-sm text-on-surface/55">
              Apenas admins podem registar ou eliminar sub-serviços.
            </div>
          )}
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {serviceCatalog.map((service) => (
          <div key={service.id} className="border border-outline-variant/15 bg-surface-container-low p-5">
            <div className="mb-4 border-b border-outline-variant/12 pb-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-headline text-xl font-bold text-on-surface">{service.label}</h3>
                <span className="font-label text-[10px] uppercase tracking-[0.18em] text-primary-container">
                  {String(grouped[service.id].length).padStart(2, "0")}
                </span>
              </div>
              <p className="mt-3 font-body text-sm leading-relaxed text-on-surface/55">
                {getServiceSummary(service.id)}
              </p>
            </div>

            <div className="space-y-3">
              {grouped[service.id].length === 0 ? (
                <div className="border border-dashed border-outline-variant/15 px-4 py-6 text-center">
                  <p className="font-body text-xs text-on-surface/45">Sem sub-serviços registados.</p>
                </div>
              ) : (
                grouped[service.id].map((subservice) => (
                  <div key={subservice.id} className="border border-outline-variant/12 bg-surface p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-headline text-base font-bold text-on-surface">{subservice.name}</p>
                        {subservice.description ? (
                          <p className="mt-2 font-body text-sm leading-relaxed text-on-surface/55">
                            {subservice.description}
                          </p>
                        ) : null}
                      </div>
                      {isAdmin ? (
                        <button
                          type="button"
                          onClick={() => handleDelete(subservice.id)}
                          disabled={deletingId === subservice.id}
                          className="shrink-0 border border-error/25 px-3 py-2 font-label text-[10px] uppercase tracking-[0.16em] text-error disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {deletingId === subservice.id ? "A..." : "Eliminar"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
