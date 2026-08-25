import { GraduationCap, ArrowUpRight } from 'lucide-react';

export default function FinanceEducation() {
  return (
    <section className="my-8 max-w-4xl mx-auto px-1">
      <a 
        href="https://www.bcb.gov.br/cidadaniafinanceira/cursos" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block p-6 md:p-8 rounded-[2rem] bg-card border border-primary/20 hover:border-primary/40 transition-all shadow-md hover:shadow-xl group relative overflow-hidden"
      >
        {/* Subtle background glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-transform duration-300 shrink-0 mt-0.5">
              <GraduationCap className="text-primary w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] text-primary uppercase tracking-widest font-black block mb-0.5">
                Utilidade Pública
              </span>
              <h3 className="text-lg md:text-xl font-bold text-text group-hover:text-primary transition-colors">
                Educação Financeira • Banco Central
              </h3>
              <p className="text-xs md:text-sm text-text-muted mt-1.5 leading-relaxed">
                Aprenda a gerenciar seus recursos de forma inteligente. Acesse de forma gratuita os materiais e cursos oficiais de Cidadania Financeira disponibilizados pelo Banco Central do Brasil.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-black font-bold text-xs group-hover:bg-opacity-95 transition-all shadow-lg shadow-primary/10 shrink-0 self-end md:self-auto">
            <span>Acessar Cursos</span>
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      </a>
    </section>
  );
}
