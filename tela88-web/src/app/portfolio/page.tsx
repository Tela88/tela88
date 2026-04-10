import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Portefólio — Tela 88",
  description:
    "Exemplos do tipo de resultado que procuramos criar: mais pedidos, mais reservas e uma operação digital mais organizada.",
};

const outcomes = [
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

const values = [
  "Resultado primeiro",
  "Comunicação clara",
  "Execução com continuidade",
];

export default function PortfolioPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface">
        <section className="relative overflow-hidden pt-28 pb-18 md:pt-36 md:pb-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(195,244,0,0.14),transparent_24%),radial-gradient(circle_at_84%_16%,rgba(195,244,0,0.07),transparent_20%)]" />
          <div className="pointer-events-none absolute left-[8%] top-16 h-64 w-64 rounded-full bg-primary-container/10 blur-[120px]" />
          <div className="pointer-events-none absolute right-[10%] top-20 h-72 w-72 rounded-full bg-primary-container/7 blur-[140px]" />

          <div className="relative mx-auto max-w-[1240px] px-6 md:px-12">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-primary-container" />
                <span className="font-label text-[0.72rem] uppercase tracking-[0.28em] text-on-surface/78">
                  Portefólio
                </span>
              </div>

              <h1 className="mt-6 max-w-[10ch] font-headline text-5xl font-bold leading-[0.9] tracking-[-0.05em] text-on-surface sm:text-6xl md:text-7xl xl:text-[5.4rem]">
                O nosso trabalho tem de se notar <span className="text-primary-container">no negócio.</span>
              </h1>

              <p className="mt-8 max-w-[42rem] font-body text-lg leading-[1.75] text-on-surface/66">
                Procuramos impacto visível em pedidos, reservas, vendas e organização comercial. O digital tem de trazer clareza e retorno.
              </p>
            </div>

            <div className="mt-14 flex flex-wrap gap-3">
              {values.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-surface-container-low/70 px-4 py-2 font-label text-[0.72rem] uppercase tracking-[0.18em] text-on-surface/62"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-6 py-18 md:px-12 md:py-24">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface/35">
                Impacto procurado
              </p>
              <h2 className="mt-3 font-headline text-3xl font-bold text-on-surface md:text-4xl">
                Três exemplos simples do tipo de resultado certo.
              </h2>
            </div>
            <p className="max-w-xl font-body text-sm leading-relaxed text-on-surface/48 md:text-base">
              Não mostramos dashboards pelo dashboard. Mostramos o tipo de melhoria que interessa ao dono do negócio.
            </p>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            {outcomes.map((item) => (
              <article
                key={item.title}
                className="rounded-[1.8rem] border border-white/8 bg-surface-container-low/72 p-7 shadow-[0_22px_60px_-48px_rgba(0,0,0,0.95)] transition-colors duration-300 hover:border-primary-container/18"
              >
                <h3 className="max-w-sm font-headline text-3xl font-bold leading-tight text-on-surface">
                  {item.title}
                </h3>
                <p className="mt-5 font-body text-base leading-relaxed text-on-surface/60">{item.summary}</p>

                <div className="mt-6 rounded-[1.2rem] border border-white/8 bg-black/18 px-5 py-4">
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

        <section className="mx-auto max-w-[1240px] px-6 pb-20 md:px-12 md:pb-24">
          <div className="rounded-[2rem] border border-primary-container/14 bg-gradient-to-br from-white/[0.04] to-primary-container/[0.03] px-7 py-10 md:px-12 md:py-14">
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
