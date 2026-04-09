const stats = [
  { value: "12M+", label: "Utilizadores Alcançados" },
  { value: "140%", label: "ROI Médio" },
  { value: "24/7", label: "Sistemas Ativos" },
  { value: "18", label: "Países" },
];

export default function IntroSection() {
  return (
    <section id="impacto" className="py-32 bg-surface-container-low">
      <div className="max-w-[1440px] mx-auto px-6 md:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          <div>
            <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tight mb-8">
              O que fazemos aparece{" "}
              <span className="italic font-light">nos teus números</span>.
            </h2>
            <div className="space-y-6 text-on-surface/70 text-lg leading-relaxed">
              <p>
                Enquanto outras agências entregam relatórios, nós entregamos
                crescimento. Trabalhamos em visibilidade, tráfego, conversão e
                retenção — quatro áreas que, juntas, constroem receita
                previsível.
              </p>
              <p>
                Cada decisão é suportada por dados. Cada euro rastreado.
                Cada mês melhora o anterior.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-surface p-12 flex flex-col justify-center"
              >
                <span className="text-primary-container font-headline text-5xl font-bold mb-2">
                  {stat.value}
                </span>
                <span className="font-label text-xs uppercase tracking-widest text-on-surface/40">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
