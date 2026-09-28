import { useState } from 'react';
import { DollarSign, Github, Mail, HelpCircle, FileText } from 'lucide-react';
import LegalModals from './LegalModals';

export default function Footer() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'about'>('about');

  return (
    <footer className="mt-24 border-t border-border pt-16 pb-12 bg-card/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg premium-gradient flex items-center justify-center">
                <DollarSign className="text-black w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-text">
                Dólar<span className="text-primary">Onlline</span>
              </span>
            </div>
            <p className="text-text-muted text-sm max-w-sm leading-relaxed mb-4">
              Sua fonte definitiva para cotações cambiais em tempo real, educação financeira e análise econômica no Brasil.
              Focado em transparência, velocidade e rigor técnico.
            </p>
            <p className="text-text-muted text-xs">
              Dados de mercado sincronizados com APIs financeiras e Banco Central do Brasil.
            </p>
          </div>
          
          <div>
            <h4 className="text-text font-bold mb-6 text-sm">Informações & Institucional</h4>
            <ul className="space-y-3.5 text-sm text-text-muted">
              <li>
                <a 
                  href="/sobre.html"
                  className="hover:text-primary transition-colors text-left block"
                >
                  Sobre Nós & Linha Editorial
                </a>
              </li>
              <li>
                <a 
                  href="/contato.html"
                  className="hover:text-primary transition-colors text-left block font-medium text-text"
                >
                  Contato & Fale Conosco
                </a>
              </li>
              <li>
                <a 
                  href="/politica-de-privacidade.html"
                  className="hover:text-primary transition-colors text-left block"
                >
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a 
                  href="/termos-de-uso.html"
                  className="hover:text-primary transition-colors text-left block"
                >
                  Termos de Uso
                </a>
              </li>
              <li>
                <a 
                  href="/sitemap.xml" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-primary transition-colors block"
                >
                  Mapa do Site (Sitemap XML)
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-text font-bold mb-6 text-sm">Atendimento & Redação</h4>
            <p className="text-xs text-text-muted mb-4 leading-relaxed">
              Dúvidas sobre cotações ou solicitações da LGPD? Entre em contato com nossos editores:
            </p>
            <div className="flex flex-col gap-2.5">
              <a 
                href="/contato.html" 
                className="flex items-center gap-2.5 text-xs text-primary hover:underline font-semibold"
              >
                <HelpCircle size={16} />
                <span>Página Oficial de Contato</span>
              </a>
              <a 
                href="mailto:tirafael2528@gmail.com" 
                className="flex items-center gap-2.5 text-xs text-text-muted hover:text-text transition-colors"
                title="Enviar e-mail para redação"
              >
                <Mail size={16} />
                <span>tirafael2528@gmail.com</span>
              </a>
              <a 
                href="https://github.com/tirafael2528" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2.5 text-xs text-text-muted hover:text-text transition-colors mt-1"
              >
                <Github size={16} />
                <span>Perfil no GitHub</span>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-text-muted uppercase tracking-wider font-semibold">
          <p>© 2026 DÓLARONLLINE (dolaronlline.com.br) • TODOS OS DIREITOS RESERVADOS</p>
          <p className="text-primary/70">MONITORAMENTO CAMBIAL & EDUCAÇÃO FINANCEIRA</p>
          <p>AVISO: NÃO FORNECEMOS RECOMENDAÇÕES DE INVESTIMENTO.</p>
        </div>
      </div>

      <LegalModals
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        tab={activeTab}
      />
    </footer>
  );
}
