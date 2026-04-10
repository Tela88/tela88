import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Serviços — Tela 88",
  description:
    "Serviços de marketing pensados para gerar mais pedidos, mais vendas e mais organização no negócio.",
};

const services = [
  {
    title: "Mais pessoas certas a chegar até ti",
    description:
      "Usamos anúncios e conteúdo para aumentar a visibilidade da tua marca junto de quem tem maior probabilidade de comprar.",
    result: "Mais atenção qualificada",
    items: ["Anúncios", "Tráfego orgânico"],
  },
  {
    title: "Mais pedidos e mais vendas",
    description:
      "Melhoramos website, CRM e funis para transformar visitas em pedidos de orçamento, marcações e compras.",
    result: "Mais retorno do tráfego",
    items: ["Websites", "CRM", "Funis de conversão"],
  },
  {
    title: "Mais clareza e mais confiança",
    description:
      "Trabalhamos imagem, comunicação e presença digital para que a tua marca pareça mais forte e mais profissional.",
    result: "Uma presença digital mais sólida",
    items: ["Design gráfico", "Redes sociais"],
  },
  {
    title: "Mais foco no que interessa",
    description:
      "Analisamos o que está a travar o negócio e definimos um plano simples com prioridades claras.",
    result: "Decisões melhores",
    items: ["Consultoria de marketing"],
  },
];

const process = [
  {
    step: "01",
    title: "Diagnóstico",
    text: "Percebemos onde o negócio está a perder atenção, pedidos ou tempo.",
  },
  {
    step: "02",
    title: "Prioridade",
    text: "Escolhemos o ponto com maior impacto para atacar primeiro.",
  },
  {
    step: "03",
    title: "Execução",
    text: "Implementamos e ajustamos com base no que está a funcionar.",
  },
];

export default function ServicosPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface">
        <section className="relative overflow-hidden pt-28 pb-18 md:pt-36 md:pb-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(195,244,0,0.14),transparent_24%),radial-gradient(circle_at_82%_16%,rgba(195,244,0,0.07),transparent_20%)]" />
          <div className="pointer-events-none absolute left-[8%] top-16 h-64 w-64 rounded-full bg-primary-container/10 blur-[120px]" />
          <div className="pointer-events-none absolute right-[10%] top-20 h-72 w-72 rounded-full bg-primary-container/7 blur-[140px]" />

          <div className="relative mx-auto max-w-[1240px] px-6 md:px-12">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-primary-container" />
                <span className="font-label text-[0.72rem] uppercase tracking-[0.28em] text-on-surface/78">
                  Serviços
                </span>
              </div>

              <h1 className="mt-6 max-w-[10ch] font-headline text-5xl font-bold leading-[0.9] tracking-[-0.05em] text-on-surface sm:text-6xl md:text-7xl xl:text-[5.4rem]">
                Marketing para criar <span className="text-primary-container">mais resultado.</span>
              </h1>

              <p className="mt-8 max-w-[42rem] font-body text-lg leading-[1.75] text-on-surface/66">
                Escolhemos e executamos as áreas que mais mexem no teu negócio: visibilidade, conversão, marca e organização.
              </p>
            </div>

            <div className="mt-14 grid gap-4 md:grid-cols-3">
              {[
                { value: "Mais pedidos", label: "melhor entrada de oportunidades" },
                { value: "Mais vendas", label: "melhor conversão do tráfego" },
                { value: "Mais controlo", label: "processo comercial mais claro" },
              ].map((item) => (
                <div
                  key={item.value}
                  className="rounded-[1.6rem] border border-white/8 bg-surface-container-low/70 px-5 py-5 shadow-[0_18px_40px_-32px_rgba(0,0,0,0.9)]"
                >
                  <p className="font-headline text-2xl font-bold text-primary-container">{item.value}</p>
                  <p className="mt-2 font-body text-sm leading-relaxed text-on-surface/50">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-6 py-18 md:px-12 md:py-24">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-label text-[10px] uppercase tracking-[0.24em] text-on-surface/35">
                O que fazemos
              </p>
              <h2 className="mt-3 font-headline text-3xl font-bold text-on-surface md:text-4xl">
                Quatro blocos. Um objetivo: fazer o negócio avançar.
              </h2>
            </div>
            <p className="max-w-xl font-body text-sm leading-relaxed text-on-surface/48 md:text-base">
              Cada serviço existe para resolver um bloqueio real e produzir um resultado claro.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {services.map((service) => (
              <article
                key={service.title}
                className="rounded-[1.8rem] border border-white/8 bg-surface-container-low/72 p-7 shadow-[0_22px_60px_-48px_rgba(0,0,0,0.95)] transition-colors duration-300 hover:border-primary-container/18"
              >
                <h3 className="max-w-lg font-headline text-3xl font-bold leading-tight text-on-surface">
                  {service.title}
                </h3>
                <p className="mt-4 max-w-xl font-body text-base leading-relaxed text-on-surface/60">
                  {service.description}
                </p>

                <div className="mt-6 rounded-[1.2rem] border border-white/8 bg-black/18 px-5 py-4">
                  <p className="font-label text-[10px] uppercase tracking-[0.22em] text-on-surface/35">
                    Resultado esperado
                  </p>
                  <p className="mt-2 font-body text-sm leading-relaxed text-on-surface/68">{service.result}</p>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {service.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-label text-[10px] uppercase tracking-[0.18em] text-on-surface/52"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-6 pb-18 md:px-12 md:pb-24">
          <div className="rounded-[2rem] border border-white/8 bg-white/[0.02] p-7 md:p-10">
            <div className="mb-8">
              <p className="font-label text-[10px] uppercase tracking-[0.24em] text-primary-container">
                Como trabalhamos
              </p>
              <h2 className="mt-3 font-headline text-3xl font-bold text-on-surface md:text-4xl">
                Simples, claro e direto.
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {process.map((item) => (
                <div
                  key={item.step}
                  className="rounded-[1.5rem] border border-white/8 bg-surface-container-low/70 p-6"
                >
                  <p className="font-label text-[10px] uppercase tracking-[0.24em] text-primary-container/82">
                    {item.step}
                  </p>
                  <h3 className="mt-4 font-headline text-xl font-bold text-on-surface">{item.title}</h3>
                  <p className="mt-3 font-body text-sm leading-relaxed text-on-surface/56">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-6 pb-20 md:px-12 md:pb-24">
          <div className="rounded-[2rem] border border-primary-container/14 bg-gradient-to-br from-white/[0.04] to-primary-container/[0.03] px-7 py-10 md:px-12 md:py-14">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="font-label text-[10px] uppercase tracking-[0.22em] text-primary-container">
                  Próximo passo
                </p>
                <h2 className="mt-3 font-headline text-3xl font-bold text-on-surface md:text-4xl">
                  Se queres perceber o que vai trazer mais retorno, começamos por aí.
                </h2>
                <p className="mt-4 font-body text-base leading-relaxed text-on-surface/58">
                  Numa conversa curta percebemos o bloqueio principal e dizemos-te o que faz sentido fazer primeiro.
                </p>
              </div>

              <Link
                href="/contactos"
                className="inline-flex min-h-14 items-center justify-center rounded-full bg-primary-container px-8 py-4 font-headline text-sm font-bold uppercase tracking-[0.2em] text-on-primary transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-20px_rgba(195,244,0,0.65)]"
              >
                Consultoria gratuita
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
