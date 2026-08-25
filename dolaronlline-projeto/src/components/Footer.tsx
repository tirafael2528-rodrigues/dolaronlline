import { useState } from 'react';
import { DollarSign, Github, Mail, Twitter } from 'lucide-react';
import LegalModals from './LegalModals';

export default function Footer() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'about'>('about');

  const openModal = (tab: 'privacy' | 'terms' | 'about') => {
    setActiveTab(tab);
    setModalOpen(true);
  };

  return (
    <footer className="mt-24 border-t border-border pt-16 pb-12">
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
            <p className="text-text-muted text-sm max-w-xs leading-relaxed">
              Sua fonte definitiva para cotações em tempo real e análise financeira minimalista. 
              Focado em performance e experiência premium.
            </p>
          </div>
          
          <div>
            <h4 className="text-text font-bold mb-6 text-sm">Informações & Termos</h4>
            <ul className="space-y-4 text-sm text-text-muted">
              <li>
                <button 
                  onClick={() => openModal('about')}
                  className="hover:text-text transition-colors cursor-pointer text-left"
                >
                  Sobre Nós & Disclaimer
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openModal('privacy')}
                  className="hover:text-text transition-colors cursor-pointer text-left"
                >
                  Política de Privacidade
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openModal('terms')}
                  className="hover:text-text transition-colors cursor-pointer text-left"
                >
                  Termos de Uso
                </button>
              </li>
              <li><a href="/sitemap.xml" target="_blank" className="hover:text-text transition-colors">Sitemap</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-text font-bold mb-6 text-sm">Contato</h4>
            <div className="flex gap-4">
              <a href="#" className="p-3 rounded-xl bg-card border border-border text-text-muted hover:text-text transition-colors">
                <Twitter size={20} />
              </a>
              <button 
                onClick={() => openModal('about')}
                className="p-3 rounded-xl bg-card border border-border text-text-muted hover:text-text cursor-pointer transition-colors"
                aria-label="Email de Contato"
              >
                <Mail size={20} />
              </button>
              <a href="https://github.com/tirafael2528" target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-card border border-border text-text-muted hover:text-text transition-colors">
                <Github size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-text-muted uppercase tracking-widest font-bold">
          <p>© 2026 DÓLARONLLINE • TODOS OS DIREITOS RESERVADOS</p>
          <p className="text-primary/60">CONSTRUÍDO COM VITE & REACT</p>
          <p>AVISO: ESTE SITE NÃO FORNECE RECOMENDAÇÕES FINANCEIRAS.</p>
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
