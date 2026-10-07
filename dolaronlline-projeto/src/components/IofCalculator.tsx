import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  Banknote, 
  Globe2, 
  Sparkles, 
  TrendingDown, 
  Percent, 
  Sliders, 
  Info,
  ChevronDown,
  ChevronUp,
  FileDown,
  Check
} from 'lucide-react';
import { calculateIof } from '../utils/iof';
import { exportConverterPdf } from '../utils/exportPdf';

interface IofCalculatorProps {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  baseRateToBRL: number;
  convertedResult?: number;
  unitRate?: number;
}

export default function IofCalculator({
  amount,
  fromCurrency,
  toCurrency,
  baseRateToBRL,
  convertedResult,
  unitRate
}: IofCalculatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [cardIofRate, setCardIofRate] = useState<number>(3.38); // 3.38% (cronograma oficial de redução)
  const [cardSpread, setCardSpread] = useState<number>(4.0); // 4% spread médio bancos tradicionais
  const [cashSpread, setCashSpread] = useState<number>(2.5); // 2.5% spread médio casas de câmbio
  const [globalSpread, setGlobalSpread] = useState<number>(1.5); // 1.5% contas globais
  const [showSettings, setShowSettings] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedSuccess, setExportedSuccess] = useState(false);

  // Determinar o valor em moeda estrangeira
  const isForeignOrigin = fromCurrency !== 'BRL';
  const effectiveCurrency = isForeignOrigin ? fromCurrency : (toCurrency === 'BRL' ? 'USD' : toCurrency);
  
  // Valor da compra internacional
  const purchaseAmount = useMemo(() => {
    if (amount <= 0) return 500;
    if (isForeignOrigin) return amount;
    // Se a origem for BRL, converte para a moeda estrangeira
    return baseRateToBRL > 0 ? Math.round(amount / baseRateToBRL) : 500;
  }, [amount, isForeignOrigin, baseRateToBRL]);

  // Cotação comercial de referência
  const commercialRate = baseRateToBRL > 0 ? baseRateToBRL : 5.6850;

  // Cálculos dos 3 métodos via utilitário compartilhado
  const calculations = useMemo(() => {
    return calculateIof({
      purchaseAmount,
      commercialRate,
      cardIofRate,
      cardSpread,
      cashSpread,
      globalSpread
    });
  }, [purchaseAmount, commercialRate, cardIofRate, cardSpread, cashSpread, globalSpread]);

  const handleExportPdf = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsExporting(true);
    try {
      exportConverterPdf({
        amount,
        fromCurrency,
        toCurrency,
        result: convertedResult || (amount * (baseRateToBRL || 1)),
        unitRate: unitRate || (baseRateToBRL || 1),
        purchaseAmount,
        effectiveCurrency,
        commercialRate,
        calculations
      });
      setExportedSuccess(true);
      setTimeout(() => setExportedSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao gerar PDF', err);
    } finally {
      setIsExporting(false);
    }
  };

  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    ARS: '$',
    PYG: '₲',
    BTC: '₿'
  };
  const sym = currencySymbols[effectiveCurrency] || '$';

  return (
    <div className="mt-6 pt-6 border-t border-border">
      {/* Botão de Destaque para abrir/fechar o Simulador */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-text/5 hover:bg-text/10 p-4 rounded-2xl border border-border/80 transition-all cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Percent size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-text">
                Simulador de IOF & Custo no Exterior
              </h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                Cartão vs. Espécie
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Compare impostos e taxas reais para uma compra de {sym} {purchaseAmount.toLocaleString('pt-BR')} {effectiveCurrency}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-black font-bold text-xs hover:bg-primary/90 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            title="Exportar resumo completo da cotação e simulação de IOF em PDF"
          >
            {exportedSuccess ? <Check size={14} className="text-black" /> : <FileDown size={14} />}
            <span>{isExporting ? 'Gerando...' : exportedSuccess ? 'PDF Baixado!' : 'Exportar Resumo'}</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-bold text-xs transition-colors"
          >
            <span>{isOpen ? 'Ocultar' : 'Comparar IOF'}</span>
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Conteúdo Expansível do Módulo de IOF */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-5 rounded-2xl bg-card border border-border space-y-6">
              {/* Resumo da Economia Real */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border border-primary/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary text-black flex items-center justify-center shrink-0 font-bold">
                    <TrendingDown size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary block">
                      Veredito de Economia Cambial
                    </span>
                    <h4 className="text-sm md:text-base font-bold text-text">
                      Economia de até <span className="text-primary font-black">R$ {calculations.diffGlobalVsCard.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> fora do cartão tradicional
                    </h4>
                    <p className="text-xs text-text-muted mt-0.5">
                      Usar dinheiro vivo economiza <strong>R$ {calculations.diffCashVsCard.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> em relação ao cartão de crédito.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleExportPdf}
                    disabled={isExporting}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-black font-bold text-xs hover:bg-primary/90 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {exportedSuccess ? <Check size={13} /> : <FileDown size={13} />}
                    <span>{isExporting ? 'Gerando...' : 'Exportar PDF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-text/5 hover:bg-text/10 border border-border text-text-muted hover:text-text text-xs font-semibold transition-colors"
                  >
                    <Sliders size={13} />
                    <span>Ajustar Taxas</span>
                  </button>
                </div>
              </div>

              {/* Ajustes Avançados Opcionais (Sliders e Alíquotas) */}
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-text/5 border border-border/80 text-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text flex items-center gap-1.5">
                      <Sliders size={14} className="text-primary" />
                      Configurações de Alíquotas & Spread Bancário
                    </span>
                    <span className="text-[11px] text-text-muted">Personalize conforme seu banco</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div>
                      <label className="text-[11px] font-bold text-text-muted block mb-1">
                        IOF Cartão de Crédito (%):
                      </label>
                      <select
                        value={cardIofRate}
                        onChange={(e) => setCardIofRate(parseFloat(e.target.value))}
                        className="w-full bg-card border border-border rounded-lg p-2 text-text font-bold"
                      >
                        <option value={2.38}>2,38% (Alíquota 2026)</option>
                        <option value={3.38}>3,38% (Alíquota 2025)</option>
                        <option value={4.38}>4,38% (Alíquota 2024)</option>
                        <option value={5.38}>5,38% (Alíquota 2023)</option>
                        <option value={6.38}>6,38% (Alíquota Antiga)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-text-muted block mb-1">
                        Spread Cartão de Crédito ({cardSpread}%):
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="7"
                        step="0.5"
                        value={cardSpread}
                        onChange={(e) => setCardSpread(parseFloat(e.target.value))}
                        className="w-full accent-primary cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-text-muted mt-0.5">
                        <span>1% (Baixo)</span>
                        <span>4% (Padrão)</span>
                        <span>7% (Alto)</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-text-muted block mb-1">
                        Spread Dinheiro Espécie ({cashSpread}%):
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="0.5"
                        value={cashSpread}
                        onChange={(e) => setCashSpread(parseFloat(e.target.value))}
                        className="w-full accent-primary cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-text-muted mt-0.5">
                        <span>1% (Casas Digitais)</span>
                        <span>2.5% (Média)</span>
                        <span>5% (Aeroporto)</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Cards Comparativos Lado a Lado */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Dinheiro em Espécie */}
                <div className="p-4 rounded-2xl bg-text/5 border border-border hover:border-primary/40 transition-all flex flex-col justify-between relative overflow-hidden group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 flex items-center justify-center">
                          <Banknote size={16} />
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-text">Dinheiro em Espécie</h5>
                          <span className="text-[10px] text-text-muted">Papel-moeda físico</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                        IOF 1,10%
                      </span>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
                      <div className="flex justify-between text-text-muted">
                        <span>Cotação c/ Spread ({cashSpread}%):</span>
                        <span className="font-mono font-semibold text-text">
                          R$ {calculations.cash.rate.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex justify-between text-text-muted">
                        <span>Subtotal da compra:</span>
                        <span className="font-mono text-text">
                          R$ {calculations.cash.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between text-green-500 font-semibold">
                        <span>Imposto IOF (1,10%):</span>
                        <span className="font-mono">
                          + R$ {calculations.cash.iofAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between text-text-muted pt-1 border-t border-border/40 text-[11px]">
                        <span>VET (Valor Efetivo Total):</span>
                        <span className="font-mono font-bold text-text">
                          R$ {calculations.cash.vet.toFixed(4)} /{sym}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-baseline justify-between">
                    <span className="text-[11px] font-bold text-text-muted uppercase">Total a Pagar:</span>
                    <span className="text-lg font-black text-text font-mono">
                      R$ {calculations.cash.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* 2. Cartão de Crédito Internacional */}
                <div className="p-4 rounded-2xl bg-text/5 border border-red-500/30 hover:border-red-500/50 transition-all flex flex-col justify-between relative overflow-hidden group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
                          <CreditCard size={16} />
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-text">Cartão de Crédito</h5>
                          <span className="text-[10px] text-text-muted">Bancos tradicionais</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                        IOF {cardIofRate}%
                      </span>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
                      <div className="flex justify-between text-text-muted">
                        <span>Cotação c/ Spread ({cardSpread}%):</span>
                        <span className="font-mono font-semibold text-text">
                          R$ {calculations.card.rate.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex justify-between text-text-muted">
                        <span>Subtotal da compra:</span>
                        <span className="font-mono text-text">
                          R$ {calculations.card.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between text-red-400 font-semibold">
                        <span>Imposto IOF ({cardIofRate}%):</span>
                        <span className="font-mono">
                          + R$ {calculations.card.iofAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between text-text-muted pt-1 border-t border-border/40 text-[11px]">
                        <span>VET (Valor Efetivo Total):</span>
                        <span className="font-mono font-bold text-red-400">
                          R$ {calculations.card.vet.toFixed(4)} /{sym}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-baseline justify-between">
                    <span className="text-[11px] font-bold text-text-muted uppercase">Total a Pagar:</span>
                    <span className="text-lg font-black text-red-400 font-mono">
                      R$ {calculations.card.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* 3. Cartão Conta Global (Mais Recomendado) */}
                <div className="p-4 rounded-2xl bg-primary/10 border-2 border-primary/40 transition-all flex flex-col justify-between relative overflow-hidden group shadow-md">
                  <div className="absolute top-0 right-0 bg-primary text-black text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-lg">
                    Mais Econômico
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 text-primary flex items-center justify-center">
                          <Globe2 size={16} />
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-text flex items-center gap-1">
                            Conta Global
                            <Sparkles size={12} className="text-primary" />
                          </h5>
                          <span className="text-[10px] text-text-muted">Wise / Nomad / Inter</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/40 mr-14">
                        IOF 1,10%
                      </span>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
                      <div className="flex justify-between text-text-muted">
                        <span>Cotação c/ Spread ({globalSpread}%):</span>
                        <span className="font-mono font-semibold text-text">
                          R$ {calculations.global.rate.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex justify-between text-text-muted">
                        <span>Subtotal da compra:</span>
                        <span className="font-mono text-text">
                          R$ {calculations.global.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between text-primary font-semibold">
                        <span>Imposto IOF (1,10%):</span>
                        <span className="font-mono">
                          + R$ {calculations.global.iofAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between text-text-muted pt-1 border-t border-border/40 text-[11px]">
                        <span>VET (Valor Efetivo Total):</span>
                        <span className="font-mono font-bold text-primary">
                          R$ {calculations.global.vet.toFixed(4)} /{sym}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-primary/30 flex items-baseline justify-between">
                    <span className="text-[11px] font-bold text-text-muted uppercase">Total a Pagar:</span>
                    <span className="text-lg font-black text-primary font-mono">
                      R$ {calculations.global.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dica Informativa & Regulação do Bacen */}
              <div className="flex items-start gap-2.5 text-[11px] text-text-muted bg-text/5 p-3 rounded-xl border border-border/50">
                <Info size={16} className="text-primary shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Por que o IOF do dinheiro é menor?</strong> Operações de compra de papel-moeda físico e remessas para contas internacionais próprias pagam <strong>1,10% de IOF</strong>. Já compras diretas no cartão de crédito internacional incidem sobre a alíquota de cartão ({cardIofRate}%), que está em cronograma federal de redução progressiva até zerar em 2028.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
