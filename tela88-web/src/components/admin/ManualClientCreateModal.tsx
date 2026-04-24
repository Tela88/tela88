"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clientStageLabels,
  focusAreaLabels,
  serviceCatalog,
  serviceDeliveryStageLabels,
} from "@/lib/service-catalog";
import type { ClientStage, ServiceDeliveryStage, ServiceId } from "@/lib/crm-types";

type FormState = {
  name: string;
  email: string;
  company: string;
  revenue: string;
  challenge: string;
  focusArea: string;
  clientStage: ClientStage;
  packName: string;
  packDescription: string;
  setupFee: string;
  monthlyFee: string;
  scheduledAt: string;
  notes: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  company: "",
  revenue: "",
  challenge: "",
  focusArea: "visibilidade",
  clientStage: "em-processo",
  packName: "",
  packDescription: "",
  setupFee: "",
  monthlyFee: "",
  scheduledAt: "",
  notes: "",
};

export default function ManualClientCreateModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [selectedServices, setSelectedServices] = useState<ServiceId[]>([]);
  const [serviceStages, setServiceStages] = useState<Record<ServiceId, ServiceDeliveryStage | undefined>>({} as Record<ServiceId, ServiceDeliveryStage | undefined>);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

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

  function closeModal() {
    if (status === "loading") return;
    setOpen(false);
    setStatus("idle");
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    const response = await fetch("/api/admin/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        scheduledAt: form.scheduledAt || null,
        services: selectedServices,
        serviceStages,
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { error?: string; client?: { id: string } }
      | null;

    if (!response.ok || !payload?.client?.id) {
      setStatus("error");
      setError(payload?.error ?? "Nao foi possivel criar o cliente.");
      return;
    }

    setForm(initialForm);
    setSelectedServices([]);
    setServiceStages({} as Record<ServiceId, ServiceDeliveryStage | undefined>);
    setStatus("idle");
    setOpen(false);
    router.refresh();
    router.push(`/area-reservada/clientes/${payload.client.id}`);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 border border-primary-container bg-primary-container px-5 py-3 font-label text-[11px] uppercase tracking-[0.18em] text-on-primary transition-all hover:shadow-[0_0_32px_-10px_rgba(195,244,0,0.55)]"
      >
        Novo cliente manual
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 px-4 py-8 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-6xl border border-outline-variant/15 bg-surface shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-outline-variant/12 bg-surface px-6 py-5">
              <div>
                <p className="font-label text-[10px] uppercase tracking-[0.22em] text-primary-container">
                  Criacao direta
                </p>
                <h2 className="mt-2 font-headline text-3xl font-bold text-on-surface">
                  Novo cliente manual
                </h2>
                <p className="mt-2 max-w-2xl font-body text-sm leading-relaxed text-on-surface/55">
                  Este fluxo salta pedido, agendamento e reuniao. O cliente entra logo na base com pack, fees,
                  estagio e servicos definidos.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="border border-outline-variant/15 bg-surface-container-low px-4 py-3 font-label text-[10px] uppercase tracking-[0.18em] text-on-surface/70"
              >
                Fechar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-8 px-6 py-6 xl:grid-cols-[minmax(0,1fr)_380px]">
              <section className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="border border-outline-variant/15 bg-surface-container-low p-6 lg:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-headline text-2xl font-bold text-on-surface">Identificacao</h3>
                      <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                        Dados base
                      </span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <input type="text" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Nome da pessoa" className="border border-outline-variant/20 bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container" />
                      <input type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} placeholder="Email principal" className="border border-outline-variant/20 bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container" />
                      <input type="text" value={form.company} onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))} placeholder="Empresa / marca" className="border border-outline-variant/20 bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container" />
                      <input type="text" value={form.revenue} onChange={(event) => setForm((prev) => ({ ...prev, revenue: event.target.value }))} placeholder="Faturacao / dimensao" className="border border-outline-variant/20 bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container" />
                    </div>
                  </div>

                  <div className="border border-outline-variant/15 bg-surface-container-low p-6 lg:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-headline text-2xl font-bold text-on-surface">Contexto comercial</h3>
                      <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                        Entrada manual
                      </span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <select value={form.focusArea} onChange={(event) => setForm((prev) => ({ ...prev, focusArea: event.target.value }))} className="border border-outline-variant/20 bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container">
                        {Object.entries(focusAreaLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      <select value={form.clientStage} onChange={(event) => setForm((prev) => ({ ...prev, clientStage: event.target.value as ClientStage }))} className="border border-outline-variant/20 bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container">
                        {Object.entries(clientStageLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <textarea value={form.challenge} onChange={(event) => setForm((prev) => ({ ...prev, challenge: event.target.value }))} rows={5} placeholder="Desafio, necessidade ou contexto estrategico" className="mt-4 w-full resize-none border border-outline-variant/20 bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container" />
                  </div>

                  <div className="border border-outline-variant/15 bg-surface-container-low p-6 lg:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-headline text-2xl font-bold text-on-surface">Pack e fees</h3>
                      <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                        Estrutura comercial
                      </span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <input type="text" value={form.packName} onChange={(event) => setForm((prev) => ({ ...prev, packName: event.target.value }))} placeholder="Nome do pack" className="border border-outline-variant/20 bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container md:col-span-2" />
                      <input type="text" value={form.setupFee} onChange={(event) => setForm((prev) => ({ ...prev, setupFee: event.target.value }))} placeholder="Valor de setup" className="border border-outline-variant/20 bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container" />
                      <input type="text" value={form.monthlyFee} onChange={(event) => setForm((prev) => ({ ...prev, monthlyFee: event.target.value }))} placeholder="Mensalidade" className="border border-outline-variant/20 bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container" />
                      <input type="datetime-local" value={form.scheduledAt} onChange={(event) => setForm((prev) => ({ ...prev, scheduledAt: event.target.value }))} className="border border-outline-variant/20 bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container" />
                    </div>
                    <textarea value={form.packDescription} onChange={(event) => setForm((prev) => ({ ...prev, packDescription: event.target.value }))} rows={4} placeholder="Descricao do pack, scope e entregas" className="mt-4 w-full resize-none border border-outline-variant/20 bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container" />
                  </div>

                  <div className="border border-outline-variant/15 bg-surface-container-low p-6 lg:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-headline text-2xl font-bold text-on-surface">Servicos contratados</h3>
                      <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                        Escolha e fase
                      </span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {serviceCatalog.map((service) => {
                        const active = selectedServices.includes(service.id);
                        return (
                          <button key={service.id} type="button" onClick={() => toggleService(service.id)} className={`border px-4 py-4 text-left font-body text-sm transition-colors ${active ? "border-primary-container bg-primary-container text-on-primary" : "border-outline-variant/20 bg-surface text-on-surface/70"}`}>
                            {service.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

              <aside className="space-y-6">
                <div className="border border-outline-variant/15 bg-surface-container-low p-6">
                  <h3 className="font-headline text-2xl font-bold text-on-surface">Notas internas</h3>
                  <textarea value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} rows={8} placeholder="Observacoes operacionais, acessos, contexto comercial, observacoes do onboarding" className="mt-4 w-full resize-none border border-outline-variant/20 bg-surface px-4 py-3 font-body text-sm text-on-surface outline-none focus:border-primary-container" />
                </div>

                <div className="border border-outline-variant/15 bg-surface-container-low p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-headline text-2xl font-bold text-on-surface">Fases dos servicos</h3>
                    <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/35">
                      Kanban inicial
                    </span>
                  </div>
                  <div className="space-y-4">
                    {(Object.keys(groupedServices) as ServiceDeliveryStage[]).map((stage) => (
                      <div key={stage} className="border border-outline-variant/12 bg-surface p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface/45">{serviceDeliveryStageLabels[stage]}</p>
                          <span className="font-body text-xs text-on-surface/45">{groupedServices[stage].length}</span>
                        </div>
                        <div className="space-y-3">
                          {groupedServices[stage].length === 0 ? (
                            <p className="font-body text-xs text-on-surface/40">Sem servicos nesta fase.</p>
                          ) : (
                            groupedServices[stage].map((serviceId) => (
                              <div key={serviceId} className="border border-outline-variant/12 bg-surface-container-low p-3">
                                <p className="font-body text-sm text-on-surface">{serviceCatalog.find((item) => item.id === serviceId)?.label}</p>
                                <select value={serviceStages[serviceId] ?? "planeado"} onChange={(event) => updateServiceStage(serviceId, event.target.value as ServiceDeliveryStage)} className="mt-3 w-full border border-outline-variant/20 bg-surface px-3 py-2 font-body text-sm text-on-surface outline-none focus:border-primary-container">
                                  {Object.entries(serviceDeliveryStageLabels).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                  ))}
                                </select>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {error ? <p className="font-body text-sm text-error">{error}</p> : null}

                <div className="grid gap-3 sm:grid-cols-2">
                  <button type="button" onClick={closeModal} className="border border-outline-variant/15 bg-surface-container-low px-4 py-4 font-label text-[10px] uppercase tracking-[0.18em] text-on-surface/70">
                    Cancelar
                  </button>
                  <button type="submit" disabled={status === "loading"} className="bg-primary-container px-4 py-4 font-headline text-sm font-bold uppercase tracking-[0.18em] text-on-primary disabled:cursor-not-allowed disabled:opacity-40">
                    {status === "loading" ? "A criar..." : "Criar cliente"}
                  </button>
                </div>
              </aside>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}


