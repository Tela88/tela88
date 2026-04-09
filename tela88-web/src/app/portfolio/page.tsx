import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Portefólio — Tela 88",
  description:
    "Exemplos do tipo de resultado que procuramos criar: mais pedidos, mais reservas e uma operação digital mais organizada.",
};

const focusAreas = ["Pedidos", "Reservas", "Vendas", "Organização"];

const showcase = [
  {
    title: "Mais pedidos de orçamento",
    summary:
      "Quando website, mensagem e tráfego trabalham bem juntos, fica mais fácil transformar visitas em contactos reais.",
    result: "Mais oportunidades comerciais",
    labels: ["Website", "Campanhas", "Conversão"],
  },
  {
    title: "Mais reservas diretas",
    summary:
      "Num alojamento local, o objetivo é simples: mais confiança, mais visibilidade e mais reservas próprias.",
    result: "Mais receita sem depender tanto de plataformas",
    labels: ["Posicionamento", "Conteúdo", "Captação"],
  },
  {
    title: "Mais organização comercial",
    summary:
      "Com CRM, automações e seguimento, o negócio perde menos leads e ganha mais clareza no processo de venda.",
    result: "Menos fuga de oportunidades",
    labels: ["CRM", "Seguimento", "Automação"],
  },
];

const principles = [
  {
    title: "Resultado primeiro",
    text: "Tudo o que fazemos tem de se notar em pedidos, vendas, reservas ou organização.",
  },
  {
    title: "Clareza na comunicação",
    text: "Explicamos o trabalho de forma simples, para que saibas sempre o que está a acontecer.",
  },
  {
    title: "Execução com continuidade",
    text: "Preferimos melhorar a operação ao longo do tempo em vez de lançar ações soltas.",
  },
];

export default function PortfolioPage() {
  return (
    <>
      <Navbar />
      <main className="bg-surface">
        <section className="relative isolate overflow-hidden bg-surface pt-28 pb-20 md:pt-32 md:pb-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(195,244,0,0.14),transparent_30%),radial-gradient(circle_at_85%_18%,rgba(195,244,0,0.08),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_28%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:96px_96px]" />
          <div className="pointer-events-none absolute left-[6%] top-24 h-72 w-72 rounded-full bg-primary-container/12 blur-[120px]" />
          <div className="pointer-events-none absolute bottom-0 right-[8%] h-80 w-80 rounded-full bg-primary-container/10 blur-[140px]" />

          <div className="relative mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-14 px-6 md:px-24 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7 xl:pr-12">
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-primary-container" />
                <span className="font-label text-[0.72rem] uppercase tracking-[0.28em] text-on-surface/78">
                  Portefólio
                </span>
              </div>

              <h1 className="max-w-[11ch] font-headline text-5xl font-bold leading-[0.9] tracking-[-0.05em] text-on-surface sm:text-6xl md:text-7xl xl:text-[5.4rem]">
                O nosso trabalho tem de se notar <span className="text-primary-container">no negócio.</span>
              </h1>

              <p className="mt-8 max-w-[36rem] font-body text-lg leading-[1.75] text-on-surface/68">
                Procuramos impacto visível em pedidos, reservas, vendas e organização comercial. O digital tem de trazer clareza e retorno.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                {focusAreas.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-surface-container-low/70 px-4 py-2 font-label text-[0.72rem] uppercase tracking-[0.18em] text-on-surface/62"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-[30rem]">
                <div className="absolute -left-6 top-10 h-24 w-24 rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-md" />
                <div className="absolute -right-5 bottom-16 h-32 w-32 rounded-full border border-primary-container/25 bg-primary-container/10 blur-2xl" />

                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-[0_30px_90px_-45px_rgba(0,0,0,0.85)] backdrop-blur-xl">
                  <div className="rounded-[1.6rem] border border-white/8 bg-[#111111]/90 p-5">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <p className="font-label text-[0.68rem] uppercase tracking-[0.28em] text-on-surface/45">
                          O que valorizamos
                        </p>
                        <h2 className="mt-2 font-headline text-2xl font-bold tracking-[-0.04em] text-on-surface">
                          Impacto simples de perceber
                        </h2>
                      </div>
                      <div className="rounded-full border border-primary-container/25 bg-primary-container/12 px-3 py-1 font-label text-[0.68rem] uppercase tracking-[0.2em] text-primary-container">
                        Tela 88
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {[
                        { value: "Mais clareza", label: "sobre o que está a funcionar" },
                        { value: "Mais retorno", label: "do investimento digital" },
                        { value: "Mais consistência", label: "na execução ao longo do tempo" },
                      ].map((item) => (
                        <div key={item.value} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                          <p className="font-headline text-2xl font-bold text-primary-container">{item.value}</p>
                          <p className="mt-2 font-body text-sm leading-snug text-on-surface/52">{item.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 rounded-[1.5rem] border border-white/8 bg-gradient-to-br from-white/[0.06] to-transparent p-4">
                      <p className="font-label text-[0.68rem] uppercase tracking-[0.24em] text-on-surface/45">
                        Em termos práticos
                      </p>
                      <div className="mt-4 space-y-3">
                        {[
                          "Mais pedidos de orçamento",
                          "Mais reservas diretas",
                          "Menos fuga de oportunidades comerciais",
                        ].map((item) => (
                          <div key={item} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                            <p className="font-body text-sm text-on-surface/68">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-6 py-18 md:px-24 md:py-24">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface/35">
                Impacto procurado
              </p>
              <h2 className="mt-3 font-headline text-3xl font-bold text-on-surface md:text-4xl">
                Três exemplos simples do tipo de resultado certo.
              </h2>
            </div>
            <p className="max-w-xl font-body text-sm leading-relaxed text-on-surface/50 md:text-base">
              Não mostramos dashboards pelo dashboard. Mostramos o tipo de melhoria que interessa ao dono do negócio.
            </p>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            {showcase.map((item) => (
              <article
                key={item.title}
                className="group rounded-[2rem] border border-white/8 bg-surface-container-low/75 p-7 shadow-[0_24px_70px_-52px_rgba(0,0,0,0.95)] transition-all duration-300 hover:border-primary-container/20 hover:bg-surface-container-low"
              >
                <h3 className="max-w-sm font-headline text-3xl font-bold leading-tight text-on-surface transition-colors duration-300 group-hover:text-primary-container">
                  {item.title}
                </h3>
                <p className="mt-5 font-body text-base leading-relaxed text-on-surface/60">{item.summary}</p>

                <div className="mt-6 rounded-[1.35rem] border border-white/8 bg-black/18 px-5 py-4">
                  <p className="font-label text-[10px] uppercase tracking-[0.22em] text-on-surface/35">Resultado</p>
                  <p className="mt-2 font-body text-sm leading-relaxed text-on-surface/68">{item.result}</p>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {item.labels.map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-label text-[10px] uppercase tracking-[0.18em] text-on-surface/52"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-6 pb-18 md:px-24 md:pb-24">
          <div className="rounded-[2rem] border border-white/8 bg-white/[0.025] p-7 md:p-10">
            <div className="grid gap-4 md:grid-cols-3">
              {principles.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.6rem] border border-white/8 bg-surface-container-low/72 p-6 transition-colors duration-300 hover:border-primary-container/18"
                >
                  <h3 className="font-headline text-xl font-bold text-on-surface">{item.title}</h3>
                  <p className="mt-3 font-body text-sm leading-relaxed text-on-surface/56">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-6 pb-20 md:px-24 md:pb-24">
          <div className="rounded-[2rem] border border-primary-container/14 bg-gradient-to-br from-white/[0.05] via-surface-container-low/90 to-primary-container/[0.05] px-7 py-10 md:px-12 md:py-14">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="font-label text-[10px] uppercase tracking-[0.22em] text-primary-container">
                  Conversa inicial
                </p>
                <h2 className="mt-3 font-headline text-3xl font-bold text-on-surface md:text-4xl">
                  Se queres perceber onde o marketing pode mexer no teu negócio, falamos.
                </h2>
                <p className="mt-4 font-body text-base leading-relaxed text-on-surface/58">
                  Mostramos-te onde está o maior potencial e o que vale a pena atacar primeiro.
                </p>
              </div>

              <Link
                href="/contactos"
                className="inline-flex min-h-14 items-center justify-center rounded-full bg-primary-container px-8 py-4 font-headline text-sm font-bold uppercase tracking-[0.2em] text-on-primary transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-20px_rgba(195,244,0,0.65)]"
              >
                Pedir consultoria
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
