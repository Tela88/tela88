import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Serviços — Tela 88",
  description:
    "Serviços de marketing pensados para gerar mais pedidos, mais vendas e mais organização no negócio.",
};

const focusAreas = ["Procura", "Conversão", "Marca", "Organização"];

const services = [
  {
    title: "Mais pessoas certas a chegar até ti",
    description:
      "Usamos anúncios e conteúdo para que a tua marca apareça mais vezes à frente de quem tem mais probabilidade de comprar.",
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
      "Trabalhamos imagem, comunicação e presença digital para que a marca pareça mais forte e mais profissional.",
    result: "Uma presença digital mais sólida",
    items: ["Design gráfico", "Redes sociais"],
  },
  {
    title: "Mais foco no que interessa",
    description:
      "Analisamos o que está a travar o negócio e definimos um plano simples com prioridades claras.",
    result: "Decisões melhores e menos ruído",
    items: ["Consultoria de marketing"],
  },
];

const process = [
  {
    step: "01",
    title: "Percebemos o bloqueio",
    text: "Entramos no contexto do teu negócio e vemos onde estás a perder oportunidades.",
  },
  {
    step: "02",
    title: "Definimos a prioridade",
    text: "Escolhemos o ponto com maior impacto no curto prazo.",
  },
  {
    step: "03",
    title: "Executamos contigo",
    text: "Implementamos, medimos e ajustamos com base no que está a funcionar.",
  },
];

export default function ServicosPage() {
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
                  Serviços
                </span>
              </div>

              <h1 className="max-w-[11ch] font-headline text-5xl font-bold leading-[0.9] tracking-[-0.05em] text-on-surface sm:text-6xl md:text-7xl xl:text-[5.4rem]">
                Marketing para criar <span className="text-primary-container">mais resultado.</span>
              </h1>

              <p className="mt-8 max-w-[36rem] font-body text-lg leading-[1.75] text-on-surface/68">
                Trabalhamos as áreas que mais mexem no negócio: trazer procura, converter melhor, fortalecer a marca e organizar a operação.
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
                          O impacto que procuramos
                        </p>
                        <h2 className="mt-2 font-headline text-2xl font-bold tracking-[-0.04em] text-on-surface">
                          Negócio mais previsível
                        </h2>
                      </div>
                      <div className="rounded-full border border-primary-container/25 bg-primary-container/12 px-3 py-1 font-label text-[0.68rem] uppercase tracking-[0.2em] text-primary-container">
                        Tela 88
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {[
                        { value: "Mais pedidos", label: "melhor entrada de oportunidades" },
                        { value: "Mais vendas", label: "melhor conversão do tráfego" },
                        { value: "Mais controlo", label: "processo comercial mais claro" },
                      ].map((item) => (
                        <div key={item.value} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                          <p className="font-headline text-2xl font-bold text-primary-container">{item.value}</p>
                          <p className="mt-2 font-body text-sm leading-snug text-on-surface/52">{item.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 rounded-[1.5rem] border border-white/8 bg-gradient-to-br from-white/[0.06] to-transparent p-4">
                      <p className="font-label text-[0.68rem] uppercase tracking-[0.24em] text-on-surface/45">
                        Como isso acontece
                      </p>
                      <div className="mt-4 space-y-3">
                        {[
                          "Trazemos pessoas certas até à marca",
                          "Melhoramos a passagem de visita para pedido",
                          "Organizamos o processo para não perder oportunidades",
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
                O que fazemos
              </p>
              <h2 className="mt-3 font-headline text-3xl font-bold text-on-surface md:text-4xl">
                Cada serviço entra para resolver um bloqueio real.
              </h2>
            </div>
            <p className="max-w-xl font-body text-sm leading-relaxed text-on-surface/50 md:text-base">
              Não é sobre fazer tudo. É sobre escolher o que mais mexe no teu momento atual.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {services.map((service) => (
              <article
                key={service.title}
                className="group rounded-[2rem] border border-white/8 bg-surface-container-low/75 p-7 shadow-[0_24px_70px_-52px_rgba(0,0,0,0.95)] transition-all duration-300 hover:border-primary-container/20 hover:bg-surface-container-low md:p-8"
              >
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <h3 className="max-w-lg font-headline text-3xl font-bold leading-tight text-on-surface transition-colors duration-300 group-hover:text-primary-container">
                      {service.title}
                    </h3>
                    <p className="mt-4 max-w-xl font-body text-base leading-relaxed text-on-surface/60">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-[1.35rem] border border-white/8 bg-black/18 px-5 py-4">
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

        <section className="mx-auto max-w-[1440px] px-6 pb-18 md:px-24 md:pb-24">
          <div className="rounded-[2rem] border border-white/8 bg-white/[0.025] p-7 md:p-10">
            <div className="mb-8">
              <p className="font-label text-[10px] uppercase tracking-[0.24em] text-primary-container">
                Como trabalhamos
              </p>
              <h2 className="mt-3 font-headline text-3xl font-bold text-on-surface md:text-4xl">
                Sem ruído. Com sequência.
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {process.map((item) => (
                <div
                  key={item.step}
                  className="rounded-[1.6rem] border border-white/8 bg-surface-container-low/72 p-6 transition-colors duration-300 hover:border-primary-container/18"
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

        <section className="mx-auto max-w-[1440px] px-6 pb-20 md:px-24 md:pb-24">
          <div className="rounded-[2rem] border border-primary-container/14 bg-gradient-to-br from-white/[0.05] via-surface-container-low/90 to-primary-container/[0.05] px-7 py-10 md:px-12 md:py-14">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="font-label text-[10px] uppercase tracking-[0.22em] text-primary-container">
                  Próximo passo
                </p>
                <h2 className="mt-3 font-headline text-3xl font-bold text-on-surface md:text-4xl">
                  Se queres perceber o que pode dar mais resultado, começamos por aí.
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
