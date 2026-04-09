"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  clientStageLabels,
  getServiceLabel,
  serviceCatalog,
  serviceDeliveryStageLabels,
} from "@/lib/service-catalog";
import type { ClientRecord, ClientStage, ServiceDeliveryStage, ServiceId } from "@/lib/crm-types";

export default function ClientManagementForm({ client }: { client: ClientRecord }) {
  const router = useRouter();
  const [packName, setPackName] = useState(client.packName);
  const [packDescription, setPackDescription] = useState(client.packDescription);
  const [setupFee, setSetupFee] = useState(client.setupFee);
  const [monthlyFee, setMonthlyFee] = useState(client.monthlyFee);
  const [notes, setNotes] = useState(client.internalNotes);
  const [clientStage, setClientStage] = useState<ClientStage>(client.clientStage);
  const [scheduledAt, setScheduledAt] = useState(client.scheduledAt ? client.scheduledAt.slice(0, 16) : "");
  const [selectedServices, setSelectedServices] = useState<ServiceId[]>(client.services.map((service) => service.id));
  const [serviceStages, setServiceStages] = useState<Record<ServiceId, ServiceDeliveryStage | undefined>>(
    () =>
      client.services.reduce<Record<ServiceId, ServiceDeliveryStage | undefined>>((accumulator, service) => {
        accumulator[service.id] = service.stage;
        return accumulator;
      }, {} as Record<ServiceId, ServiceDeliveryStage | undefined>),
  );
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const groupedServices = useMemo(() => {
    const groups: Record<ServiceDeliveryStage, ServiceId[]> = {
      planeado: [],
      "em-processo": [],
      "em-producao": [],
      concluido: [],
    };

    for (const serviceId of selectedServices) {
      const stage = serviceStages[serviceId] ?? "planeado";
      groups[stage].push(serviceId);
    }

    return groups;
  }, [selectedServices, serviceStages]);

  function toggleService(serviceId: ServiceId) {
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((item) => item !== serviceId) : [...prev, serviceId],
    );

    setServiceStages((prev) => ({
      ...prev,
      [serviceId]: prev[serviceId] ?? "planeado",
    }));
  }

  function updateServiceStage(serviceId: ServiceId, stage: ServiceDeliveryStage) {
    setServiceStages((prev) => ({
      ...prev,
      [serviceId]: stage,
    }));
  }

  async function handleSave() {
    setStatus("loading");

    const response = await fetch(`/api/admin/clients/${client.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        packName,
        packDescription,
        setupFee,
        monthlyFee,
        services: selectedServices,
        serviceStages,
        clientStage,
        notes,
        scheduledAt: scheduledAt || null,
      }),
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    setStatus("idle");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.5fr)]">
        <section className="space-y-6">
          <div className="border border-outline-variant/15 bg-surface-container-low p-6">
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
              Pack comercial do cliente
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input
                type="text"
                value={packName}
                onChange={(event) => setPackName(event.target.value)}
                placeholder="Nome do pack"
                className="border border-outline-variant/20 bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
              />
              <input
                type="text"
                value={setupFee}
                onChange={(event) => setSetupFee(event.target.value)}
                placeholder="Valor de setup"
                className="border border-outline-variant/20 bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
              />
              <input
                type="text"
                value={monthlyFee}
                onChange={(event) => setMonthlyFee(event.target.value)}
                placeholder="Recorrencia mensal"
                className="border border-outline-variant/20 bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
              />
            </div>
            <textarea
              value={packDescription}
              onChange={(event) => setPackDescription(event.target.value)}
              rows={4}
              placeholder="Breve descricao do pack e do que vai ser entregue..."
              className="mt-4 w-full resize-none border border-outline-variant/20 bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
            />
          </div>

          <div className="border border-outline-variant/15 bg-surface-container-low p-6">
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
              Servicos contratados
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {serviceCatalog.map((service) => {
                const active = selectedServices.includes(service.id);
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => toggleService(service.id)}
                    className={`border px-4 py-3 text-left font-body text-sm transition-colors ${
                      active
                        ? "border-primary-container bg-primary-container text-on-primary"
                        : "border-outline-variant/20 bg-surface text-on-surface/70"
                    }`}
                  >
                    {service.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="border border-outline-variant/15 bg-surface-container-low p-6">
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">Dados do cliente</p>
            <div className="mt-4 space-y-3 font-body text-sm text-on-surface/70">
              <p>{client.name}</p>
              <p>{client.email}</p>
              <p>{client.company || "Sem empresa indicada"}</p>
              <p>{client.revenue || "Faturacao nao indicada"}</p>
            </div>
          </div>

          <div className="border border-outline-variant/15 bg-surface-container-low p-6">
            <label className="mb-2 block font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
              Kaban do cliente
            </label>
            <select
              value={clientStage}
              onChange={(event) => setClientStage(event.target.value as ClientStage)}
              className="w-full border border-outline-variant/20 bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
            >
              {Object.entries(clientStageLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <label className="mb-2 mt-5 block font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
              Proxima reuniao
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
              className="w-full border border-outline-variant/20 bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
            />

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              placeholder="Notas internas"
              className="mt-5 w-full resize-none border border-outline-variant/20 bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container"
            />

            <button
              type="button"
              onClick={handleSave}
              disabled={status === "loading"}
              className="mt-5 w-full bg-primary-container px-4 py-3 font-headline text-sm font-bold uppercase tracking-[0.18em] text-on-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              {status === "loading" ? "A guardar..." : "Guardar cliente"}
            </button>
            {status === "error" ? (
              <p className="mt-3 font-body text-xs text-error">Nao foi possivel guardar as alteracoes.</p>
            ) : null}
          </div>
        </aside>
      </div>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-headline text-3xl font-bold text-on-surface">Kaban dos servicos do cliente</h2>
          <Link
            href="/area-reservada?tab=clients"
            className="font-label text-[10px] uppercase tracking-[0.2em] text-primary-container"
          >
            Voltar aos clientes
          </Link>
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          {(Object.keys(groupedServices) as ServiceDeliveryStage[]).map((stage) => (
            <div key={stage} className="border border-outline-variant/15 bg-surface-container-low p-4">
              <div className="mb-4 flex items-center justify-between border-b border-outline-variant/12 pb-4">
                <p className="font-headline text-xl font-bold text-on-surface">
                  {serviceDeliveryStageLabels[stage]}
                </p>
                <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                  {String(groupedServices[stage].length).padStart(2, "0")}
                </span>
              </div>
              <div className="space-y-3">
                {groupedServices[stage].length === 0 ? (
                  <div className="border border-dashed border-outline-variant/15 px-4 py-6 text-center">
                    <p className="font-body text-xs text-on-surface/45">Sem servicos nesta fase.</p>
                  </div>
                ) : (
                  groupedServices[stage].map((serviceId) => (
                    <div key={serviceId} className="border border-outline-variant/12 bg-surface p-4">
                      <p className="font-headline text-lg font-bold text-on-surface">{getServiceLabel(serviceId)}</p>
                      <select
                        value={serviceStages[serviceId] ?? "planeado"}
                        onChange={(event) => updateServiceStage(serviceId, event.target.value as ServiceDeliveryStage)}
                        className="mt-3 w-full border border-outline-variant/20 bg-surface-container-low px-3 py-2 font-body text-sm text-on-surface outline-none focus:border-primary-container"
                      >
                        {Object.entries(serviceDeliveryStageLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
