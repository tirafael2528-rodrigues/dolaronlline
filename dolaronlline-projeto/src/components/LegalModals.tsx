import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  tab: 'terms' | 'privacy' | 'about';
}

export default function LegalModals({ isOpen, onClose, tab }: LegalModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0A0A0A]/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-card border border-border w-full max-w-3xl max-h-[80vh] overflow-y-auto rounded-3xl p-6 md:p-8 relative z-10 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
              <h2 className="text-xl font-bold text-text">
                {tab === 'privacy' && 'Política de Privacidade'}
                {tab === 'terms' && 'Termos de Uso'}
                {tab === 'about' && 'Sobre Nós & Isenção de Responsabilidade'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-text-muted hover:text-text rounded-lg bg-text/5 hover:bg-text/10 transition-all"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content body */}
            <div className="text-sm text-text-muted space-y-4 leading-relaxed font-sans scroll-smooth">
              {tab === 'privacy' && (
                <>
                  <p>
                    A sua privacidade é de extrema importância para nós. No <strong>DólarOnlline</strong> (dolaronlline.com.br), temos o compromisso de respeitar a sua privacidade em relação a qualquer informação pessoal que possamos coletar por meio do nosso portal.
                  </p>
                  <h3 className="text-base font-bold text-text mt-6">1. Coleta e Uso de Informações</h3>
                  <p>
                    Nosso site funciona principalmente como um portal de informações públicas. Não exigimos cadastro de usuários nem coletamos dados confidenciais de forma ativa de nossos visitantes durante a visualização das cotações.
                  </p>
                  <h3 className="text-base font-bold text-text mt-6">2. Cookies e Web Beacons (Anúncios do Google AdSense)</h3>
                  <p>
                    Para fins de análise técnica e monetização, utilizamos serviços de terceiros, incluindo o <strong>Google AdSense</strong>. O Google utiliza cookies para veicular anúncios com base nas suas visitas anteriores ao nosso site ou a outros sites na Internet.
                  </p>
                  <p>
                    O uso do cookie de publicidade do Google (conhecido como cookie DART) permite que o Google e seus parceiros veiculem anúncios para os nossos usuários com base nas visitas feitas a este e/ou a outros sites. Os usuários podem desativar a publicidade personalizada visitando as Configurações de anúncios do Google.
                  </p>
                  <h3 className="text-base font-bold text-text mt-6">3. LGPD e Direitos dos Usuários</h3>
                  <p>
                    Estamos em total conformidade com as diretrizes da Lei Geral de Proteção de Dados (LGPD) no Brasil. O usuário tem o direito de gerenciar e limpar os cookies nas configurações de seu navegador de internet a qualquer momento, o que não prejudica a usabilidade geral do nosso portal.
                  </p>
                </>
              )}

              {tab === 'terms' && (
                <>
                  <p>
                    Ao acessar o site <strong>DólarOnlline</strong> (dolaronlline.com.br), você concorda em cumprir estes termos de uso, todas as leis e regulamentos aplicáveis e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis.
                  </p>
                  <h3 className="text-base font-bold text-text mt-6">1. Uso de Licença</h3>
                  <p>
                    É concedida permissão para visualizar temporariamente as informações e dados financeiros fornecidos no portal para uso estritamente pessoal e informativo. Esta é a concessão de uma licença, não uma transferência de título. No escopo desta licença, você não deve modificar, vender ou fazer engenharia reversa dos códigos do sistema.
                  </p>
                  <h3 className="text-base font-bold text-text mt-6">2. Isenção de Garantias</h3>
                  <p>
                    Os materiais no site do DólarOnlline são fornecidos "como estão". Não oferecemos garantias expressas ou implícitas de lucros ou exatidão matemática extrema, e por este meio isentamos e negamos todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização ou adequação a um fim específico.
                  </p>
                  <p>
                    Além disso, como as cotações financeiras dependem de Provedores de API Externos terceirizados (AwesomeAPI), atrasos mínimos ou indisponibilidade temporária de conexões podem ocorrer e não representam falha ou prejuízo direto de nossa plataforma.
                  </p>
                </>
              )}

              {tab === 'about' && (
                <>
                  <h3 className="text-lg font-bold text-text">Sobre Nós</h3>
                  <p>
                    O <strong>DólarOnlline</strong> (dolaronlline.com.br) é uma ferramenta independente focada em democratizar o acesso às informações financeiras e cotações de câmbio comercial e turismo das principais moedas do mundo. Oferecemos ferramentas limpas, sem poluição visual ou complexidade excessiva, para otimizar o dia a dia do investidor brasileiro.
                  </p>
                  <h3 className="text-base font-bold text-text mt-6">Isenção de Responsabilidade (Disclaimer Financeiro)</h3>
                  <p className="border-l-2 border-primary pl-4 py-2 italic bg-primary/5 text-text">
                    Aviso Importante: As informações, análises e cotações apresentadas neste portal destinam-se exclusivamente a fins informativos e educacionais. Nós NÃO fornecemos qualquer recomendação financeira, assessoria de investimentos ou consultoria especializada.
                  </p>
                  <p>
                    Antes de tomar qualquer decisão financeira que envolva câmbio, venda ou captação de recursos no exterior, recomenda-se consultar um agente financeiro credenciado junto ao Banco Central do Brasil.
                  </p>
                  <h3 className="text-base font-bold text-text mt-6">Contato e Suporte</h3>
                  <p>
                    Para dúvidas, críticas, sugestões de parcerias corporativas ou propostas de publicidade direta, você pode nos contatar através do email: <span className="text-primary font-mono select-all">tirafael2528@gmail.com</span>. Retornaremos o seu contato o mais breve possível.
                  </p>
                </>
              )}
            </div>

            {/* Footer with actions */}
            <div className="mt-8 pt-4 border-t border-border flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-primary text-black font-bold hover:bg-opacity-90 active:scale-95 transition-all text-xs"
              >
                Entendi
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
