"use client";

import { useState } from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

type FormState = "idle" | "loading" | "success" | "error";

const focusAreas = [
  { id: "pedidos", label: "Mais pedidos" },
  { id: "vendas", label: "Mais vendas" },
  { id: "visibilidade", label: "Mais visibilidade" },
  { id: "organizacao", label: "Mais organização" },
];

const revenueOptions = [
  "Ainda a lançar / pré-receita",
  "Até €5.000/mês",
  "€5.000 - €20.000/mês",
  "€20.000 - €50.000/mês",
  "Mais de €50.000/mês",
];

export default function ContactosPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    revenue: "",
    challenge: "",
  });
  const [selectedArea, setSelectedArea] = useState("");
  const [status, setStatus] = useState<FormState>("idle");
  const [errors, setErrors] = useState<Partial<typeof form & { area: string }>>({});

  function validate() {
    const nextErrors: typeof errors = {};
    if (!form.name.trim()) nextErrors.name = "Nome é obrigatório.";
    if (!form.email.trim()) nextErrors.email = "Email é obrigatório.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = "Email inválido.";
    if (!selectedArea) nextErrors.area = "Escolhe a prioridade principal.";
    return nextErrors;
  }

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors = validate();

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setStatus("loading");

    try {
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          focusArea: selectedArea,
        }),
      });

      if (!response.ok) {
        setStatus("error");
        return;
      }

      setStatus("success");
      setForm({
        name: "",
        email: "",
        company: "",
        revenue: "",
        challenge: "",
      });
      setSelectedArea("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface">
        <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_86%_16%,rgba(195,244,0,0.1),transparent_22%),radial-gradient(circle_at_14%_20%,rgba(195,244,0,0.05),transparent_20%)]" />

          <div className="relative mx-auto max-w-[1240px] px-6 md:px-12">
            <div className="rounded-[2rem] border border-white/8 bg-white/[0.03] px-7 py-10 shadow-[0_30px_100px_-60px_rgba(0,0,0,0.85)] backdrop-blur-sm md:px-12 md:py-14">
              <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-label text-[11px] uppercase tracking-[0.22em] text-primary-container">
                Consultoria gratuita
              </span>
              <h1 className="mt-6 max-w-4xl font-headline text-5xl font-bold leading-[0.92] tracking-[-0.05em] text-on-surface md:text-7xl">
                Diz-nos onde o negócio está a travar.
              </h1>
              <p className="mt-6 max-w-2xl font-body text-lg leading-relaxed text-on-surface/64 md:text-xl">
                Nós ajudamos-te a perceber o que está a falhar e qual deve ser o próximo passo.
              </p>
            </div>
          </div>
        </section>

        <section className="pb-20 md:pb-24">
          <div className="mx-auto max-w-[1240px] px-6 md:px-12">
            <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="space-y-5">
                <div className="rounded-[1.75rem] border border-white/8 bg-surface-container-low/80 p-6">
                  <p className="font-label text-[10px] uppercase tracking-[0.22em] text-primary-container">
                    O que acontece depois
                  </p>
                  <div className="mt-4 space-y-3">
                    {[
                      "Revemos o teu pedido.",
                      "Confirmamos dia e hora.",
                      "Falamos contigo de forma direta.",
                    ].map((item) => (
                      <p key={item} className="font-body text-sm leading-relaxed text-on-surface/58">
                        {item}
                      </p>
                    ))}
                  </div>
                </div>

                <p className="px-1 font-body text-sm leading-relaxed text-on-surface/44">
                  Sem compromisso. Resposta habitual em menos de 24 horas úteis.
                </p>
              </aside>

              <div>
                {status === "success" ? (
                  <div className="rounded-[2rem] border border-white/8 bg-surface-container-low/80 p-10 text-center md:p-14">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-primary-container/30 bg-primary-container/10">
                      <svg
                        className="h-9 w-9 text-primary-container"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <h2 className="mt-8 font-headline text-4xl font-bold text-on-surface">Pedido enviado.</h2>
                    <p className="mx-auto mt-4 max-w-md font-body text-base leading-relaxed text-on-surface/58">
                      Vamos responder em menos de 24 horas úteis para confirmar a chamada.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="rounded-[2rem] border border-white/8 bg-surface-container-low/80 p-8 shadow-[0_20px_60px_-45px_rgba(0,0,0,0.95)] md:p-10"
                  >
                    <div className="space-y-8">
                      <div>
                        <label className="mb-3 block font-label text-[10px] uppercase tracking-[0.22em] text-on-surface/35">
                          Qual é a prioridade principal? *
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {focusAreas.map((area) => {
                            const active = selectedArea === area.id;

                            return (
                              <button
                                key={area.id}
                                type="button"
                                onClick={() => {
                                  setSelectedArea(area.id);
                                  setErrors((prev) => ({ ...prev, area: undefined }));
                                }}
                                className={`rounded-full border px-4 py-3 font-body text-sm transition-colors ${
                                  active
                                    ? "border-primary-container bg-primary-container text-on-primary"
                                    : "border-white/10 bg-white/[0.03] text-on-surface hover:border-primary-container/30"
                                }`}
                              >
                                {area.label}
                              </button>
                            );
                          })}
                        </div>
                        {errors.area ? <p className="mt-3 font-body text-sm text-error">{errors.area}</p> : null}
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block font-label text-[10px] uppercase tracking-[0.22em] text-on-surface/35">
                            Nome *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            autoComplete="name"
                            placeholder="O teu nome"
                            className={`w-full rounded-2xl border bg-surface px-4 py-4 font-body text-sm text-on-surface outline-none transition-colors focus:border-primary-container ${
                              errors.name ? "border-error" : "border-white/10"
                            }`}
                          />
                          {errors.name ? <p className="mt-2 font-body text-sm text-error">{errors.name}</p> : null}
                        </div>
                        <div>
                          <label className="mb-2 block font-label text-[10px] uppercase tracking-[0.22em] text-on-surface/35">
                            Email *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
                            placeholder="o.teu@email.com"
                            className={`w-full rounded-2xl border bg-surface px-4 py-4 font-body text-sm text-on-surface outline-none transition-colors focus:border-primary-container ${
                              errors.email ? "border-error" : "border-white/10"
                            }`}
                          />
                          {errors.email ? <p className="mt-2 font-body text-sm text-error">{errors.email}</p> : null}
                        </div>
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block font-label text-[10px] uppercase tracking-[0.22em] text-on-surface/35">
                            Empresa / website
                          </label>
                          <input
                            type="text"
                            name="company"
                            value={form.company}
                            onChange={handleChange}
                            placeholder="Nome da marca ou URL"
                            className="w-full rounded-2xl border border-white/10 bg-surface px-4 py-4 font-body text-sm text-on-surface outline-none transition-colors focus:border-primary-container"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block font-label text-[10px] uppercase tracking-[0.22em] text-on-surface/35">
                            Faturação atual
                          </label>
                          <select
                            name="revenue"
                            value={form.revenue}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-white/10 bg-surface px-4 py-4 font-body text-sm text-on-surface outline-none transition-colors focus:border-primary-container"
                          >
                            <option value="">Selecionar</option>
                            {revenueOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block font-label text-[10px] uppercase tracking-[0.22em] text-on-surface/35">
                          O que está a acontecer neste momento?
                        </label>
                        <textarea
                          name="challenge"
                          value={form.challenge}
                          onChange={handleChange}
                          rows={5}
                          placeholder="Ex.: temos visitas ao site, mas quase ninguém pede orçamento."
                          className="w-full resize-none rounded-[1.5rem] border border-white/10 bg-surface px-4 py-4 font-body text-sm leading-relaxed text-on-surface outline-none transition-colors focus:border-primary-container"
                        />
                      </div>

                      {status === "error" ? (
                        <p className="font-body text-sm text-error">
                          Algo correu mal. Tenta novamente ou escreve para hello@tela88.io.
                        </p>
                      ) : null}

                      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <button
                          type="submit"
                          disabled={status === "loading"}
                          className="inline-flex min-h-14 items-center justify-center rounded-full bg-primary-container px-8 py-4 font-headline text-sm font-bold uppercase tracking-[0.2em] text-on-primary transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-20px_rgba(195,244,0,0.65)] disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          {status === "loading" ? "A enviar..." : "Reservar consultoria gratuita"}
                        </button>

                        <p className="font-body text-sm leading-relaxed text-on-surface/42">Sem compromisso.</p>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
