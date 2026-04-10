const pillars = [
  {
    title: "Mais procura",
    text: "A marca aparece mais vezes à frente das pessoas certas.",
  },
  {
    title: "Mais conversão",
    text: "O tráfego passa a gerar mais pedidos, marcações e vendas.",
  },
  {
    title: "Mais controlo",
    text: "O processo comercial fica mais claro e mais previsível.",
  },
];

export default function IntroSection() {
  return (
    <section id="impacto" className="relative overflow-hidden bg-surface py-20 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(195,244,0,0.1),transparent_18%),radial-gradient(circle_at_86%_18%,rgba(195,244,0,0.05),transparent_18%)]" />

      <div className="relative mx-auto max-w-[1240px] px-6 md:px-12">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          <div className="rounded-[2rem] border border-white/8 bg-surface-container-low/72 p-8 shadow-[0_24px_70px_-52px_rgba(0,0,0,0.95)] md:p-10">
            <p className="font-label text-[10px] uppercase tracking-[0.24em] text-primary-container">
              Impacto
            </p>
            <h2 className="mt-3 max-w-[12ch] font-headline text-4xl font-bold leading-[0.95] tracking-[-0.04em] text-on-surface md:text-5xl">
              O que fazemos tem de aparecer no negócio.
            </h2>

            <div className="mt-8 max-w-2xl space-y-5 font-body text-base leading-[1.8] text-on-surface/64 md:text-lg">
              <p>
                Trabalhamos em visibilidade, conversão e organização para que o digital deixe de ser só presença e passe a ser uma alavanca real de crescimento.
              </p>
              <p>
                Menos relatórios bonitos. Mais pedidos, mais vendas e mais controlo sobre o que está a acontecer.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {pillars.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.7rem] border border-white/8 bg-white/[0.03] p-6 shadow-[0_20px_60px_-48px_rgba(0,0,0,0.95)]"
              >
                <h3 className="font-headline text-2xl font-bold text-on-surface">{item.title}</h3>
                <p className="mt-3 font-body text-sm leading-relaxed text-on-surface/56 md:text-base">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
