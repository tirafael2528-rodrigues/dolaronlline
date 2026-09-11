import { BookOpen, ArrowUpRight, CheckCircle2, ShieldCheck } from 'lucide-react';

const GUIDES = [
  {
    url: '/dolar-comercial-vs-turismo.html',
    category: 'Câmbio Prático',
    time: '6 min de leitura',
    title: 'Dólar Comercial vs. Dólar Turismo: Entenda as Diferenças e Qual Você Paga',
    summary: 'Descubra por que o dólar de turismo é sempre mais caro e como o mercado financeiro precifica cada modalidade cambial.'
  },
  {
    url: '/guia-iof-cambio.html',
    category: 'Tributação Cambial',
    time: '7 min de leitura',
    title: 'Manual Completo do IOF no Câmbio: Dinheiro Vivo, Cartões e Contas Globais',
    summary: 'Conheça as alíquotas oficiais do IOF, o cálculo do Valor Efetivo Total (VET) e o cronograma de redução gradual.'
  },
  {
    url: '/o-que-e-taxa-ptax.html',
    category: 'Mercado Financeiro',
    time: '5 min de leitura',
    title: 'Taxa PTAX do Banco Central: O Termômetro Oficial do Mercado de Câmbio',
    summary: 'Entenda como o Banco Central apura as 4 janelas de consulta diária e o impacto em contratos futuros e cartões.'
  },
  {
    url: '/como-comprar-dolar-viagem.html',
    category: 'Finanças Pessoais',
    time: '6 min de leitura',
    title: 'Planejamento Cambial para Viagens: Estratégia do Preço Médio e Segurança',
    summary: 'O passo a passo recomendado por consultores financeiros para proteger seu bolso das oscilações da moeda.'
  }
];

export default function EducationalGuides() {
  return (
    <section className="my-10 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Educação Financeira & Guias Práticos</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-text tracking-tight">
            Artigos e Guias Exclusivos sobre Câmbio
          </h2>
          <p className="text-xs md:text-sm text-text-muted mt-1 max-w-3xl">
            Conteúdo editorial e técnico produzido pela redação do Dólar Onlline para tirar dúvidas sobre impostos, taxas e planejamento cambial.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {GUIDES.map((guide, idx) => (
          <a
            key={idx}
            href={guide.url}
            className="p-6 rounded-2xl bg-card border border-border hover:border-primary/40 transition-all shadow-sm hover:shadow-lg flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold border border-primary/20 text-[10px] uppercase">
                  {guide.category}
                </span>
                <span className="text-text-muted text-[11px] font-medium">
                  {guide.time}
                </span>
              </div>

              <h3 className="text-base font-bold text-text group-hover:text-primary transition-colors leading-snug">
                {guide.title}
              </h3>

              <p className="text-xs text-text-muted leading-relaxed">
                {guide.summary}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-xs">
              <span className="text-primary font-bold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Ler artigo completo &rarr;
              </span>
              <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
            </div>
          </a>
        ))}
      </div>

      <div className="mt-5 p-4 rounded-xl bg-card/60 border border-border/80 flex items-center gap-3 text-xs text-text-muted">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
        <p>
          <strong className="text-text font-semibold">Compromisso Editorial:</strong> Todos os nossos guias são revisados com base nas normativas do Banco Central do Brasil (Bacen) e na legislação tributária vigente.
        </p>
      </div>
    </section>
  );
}
