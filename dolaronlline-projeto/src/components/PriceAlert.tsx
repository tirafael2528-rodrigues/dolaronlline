import React, { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, BellRing, Plus, Trash2, CheckCircle2, TrendingUp, TrendingDown, X, Volume2, ShieldAlert } from 'lucide-react';
import { CoinData } from '../types';

export interface PriceAlertItem {
  id: string;
  currency: string;
  currencyName: string;
  pairKey: string;
  targetPrice: number;
  condition: 'above' | 'below';
  createdAt: number;
  triggered: boolean;
  triggeredAt?: number;
  note?: string;
  active: boolean;
}

interface PriceAlertProps {
  quotes: Record<string, CoinData>;
}

const CURRENCIES = [
  { code: 'USD', name: 'Dólar Comercial', pairKey: 'USDBRL', defaultPrice: 5.685 },
  { code: 'USDT', name: 'Dólar Turismo', pairKey: 'USDBRLT', defaultPrice: 5.890 },
  { code: 'EUR', name: 'Euro', pairKey: 'EURBRL', defaultPrice: 6.182 },
  { code: 'BTC', name: 'Bitcoin', pairKey: 'BTCBRL', defaultPrice: 587500 },
  { code: 'GBP', name: 'Libra Esterlina', pairKey: 'GBPBRL', defaultPrice: 7.398 },
];

export default function PriceAlert({ quotes }: PriceAlertProps) {
  const [alerts, setAlerts] = useState<PriceAlertItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('dolar_price_alerts');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: 'sample-1',
        currency: 'USD',
        currencyName: 'Dólar Comercial',
        pairKey: 'USDBRL',
        targetPrice: 5.60,
        condition: 'below',
        createdAt: Date.now() - 3600000,
        triggered: false,
        note: 'Comprar dólar para viagem',
        active: true
      }
    ];
  });

  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0].code);
  const [condition, setCondition] = useState<'above' | 'below'>('below');
  const [targetPriceStr, setTargetPriceStr] = useState<string>('5.60');
  const [note, setNote] = useState('');
  const [activeToast, setActiveToast] = useState<{
    alert: PriceAlertItem;
    currentPrice: number;
  } | null>(null);

  // Save to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('dolar_price_alerts', JSON.stringify(alerts));
      } catch {}
    }
  }, [alerts]);

  // Synthetic sound chime using Web Audio API
  const playAlertSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.24); // D6
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {}
  };

  // Check quotes against active alerts
  useEffect(() => {
    if (!quotes || Object.keys(quotes).length === 0) return;

    alerts.forEach((alert) => {
      if (!alert.active || alert.triggered) return;

      const quote = quotes[alert.pairKey];
      if (!quote) return;

      const current = parseFloat(quote.bid);
      if (isNaN(current) || current <= 0) return;

      let hasTriggered = false;
      if (alert.condition === 'above' && current >= alert.targetPrice) {
        hasTriggered = true;
      } else if (alert.condition === 'below' && current <= alert.targetPrice) {
        hasTriggered = true;
      }

      if (hasTriggered) {
        // Trigger notification
        playAlertSound();
        setActiveToast({ alert, currentPrice: current });

        // Update alert status
        setAlerts((prev) =>
          prev.map((a) =>
            a.id === alert.id
              ? { ...a, triggered: true, triggeredAt: Date.now() }
              : a
          )
        );
      }
    });
  }, [quotes, alerts]);

  // Current price for selected currency in the form
  const currentCurObj = CURRENCIES.find((c) => c.code === selectedCurrency) || CURRENCIES[0];
  const currentQuote = quotes[currentCurObj.pairKey];
  const currentPrice = currentQuote ? parseFloat(currentQuote.bid) : currentCurObj.defaultPrice;

  // Preset offset calculator
  const applyPreset = (percent: number) => {
    const calculated = currentPrice * (1 + percent / 100);
    const decimals = selectedCurrency === 'BTC' ? 0 : 4;
    setTargetPriceStr(calculated.toFixed(decimals));
    if (percent < 0) {
      setCondition('below');
    } else {
      setCondition('above');
    }
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPrice = parseFloat(targetPriceStr.replace(',', '.'));
    if (isNaN(targetPrice) || targetPrice <= 0) return;

    const newAlert: PriceAlertItem = {
      id: `alert-${Date.now()}`,
      currency: currentCurObj.code,
      currencyName: currentCurObj.name,
      pairKey: currentCurObj.pairKey,
      targetPrice,
      condition,
      createdAt: Date.now(),
      triggered: false,
      note: note.trim() || undefined,
      active: true,
    };

    setAlerts((prev) => [newAlert, ...prev]);
    setNote('');
  };

  const handleDelete = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleToggleActive = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, active: !a.active, triggered: false } : a
      )
    );
  };

  const handleTestNotification = () => {
    playAlertSound();
    setActiveToast({
      alert: {
        id: 'test',
        currency: currentCurObj.code,
        currencyName: currentCurObj.name,
        pairKey: currentCurObj.pairKey,
        targetPrice: currentPrice,
        condition: 'below',
        createdAt: Date.now(),
        triggered: true,
        note: 'Notificação de teste visual',
        active: true
      },
      currentPrice
    });
  };

  return (
    <section className="py-8">
      {/* Floating In-App Toast Notification */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            className="fixed top-20 right-4 md:right-8 z-50 max-w-md w-[calc(100vw-2rem)] bg-card/95 backdrop-blur-xl border-2 border-primary shadow-2xl rounded-2xl p-4 text-text flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-primary text-black flex items-center justify-center shrink-0 animate-bounce">
              <BellRing size={20} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                  Alerta de Preço Atingido!
                </span>
                <button
                  onClick={() => setActiveToast(null)}
                  className="text-text-muted hover:text-text p-1"
                >
                  <X size={15} />
                </button>
              </div>

              <h4 className="text-sm font-bold text-text mt-0.5">
                {activeToast.alert.currencyName} ({activeToast.alert.currency})
              </h4>

              <p className="text-xs text-text-muted mt-1 leading-snug">
                A cotação atingiu{' '}
                <strong className="text-primary font-mono">
                  R$ {activeToast.currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </strong>
                {' '}(Sua meta: {activeToast.alert.condition === 'above' ? '≥' : '≤'} R$ {activeToast.alert.targetPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}).
              </p>

              {activeToast.alert.note && (
                <div className="mt-1.5 text-[11px] text-text-muted italic bg-text/5 px-2 py-0.5 rounded-md inline-block">
                  "{activeToast.alert.note}"
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 md:p-8 rounded-[2rem] bg-card border border-border shadow-xl relative overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Bell size={18} />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-text tracking-tight">
                Alertas de Cotação
              </h2>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Receba avisos visuais na tela quando a cotação atingir seu valor desejado
            </p>
          </div>

          <button
            type="button"
            onClick={handleTestNotification}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-text/5 hover:bg-text/10 border border-border text-text-muted hover:text-text transition-colors self-start sm:self-auto"
            title="Testar aviso sonoro e visual"
          >
            <Volume2 size={13} className="text-primary" />
            <span>Testar Aviso</span>
          </button>
        </div>

        {/* Form to create alert */}
        <form onSubmit={handleCreateAlert} className="space-y-4 mb-8 p-4 rounded-2xl bg-text/5 border border-border/60">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Currency selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-text-muted px-1">
                Moeda
              </label>
              <select
                value={selectedCurrency}
                onChange={(e) => {
                  setSelectedCurrency(e.target.value);
                  const cur = CURRENCIES.find((c) => c.code === e.target.value);
                  if (cur) {
                    const price = quotes[cur.pairKey] ? parseFloat(quotes[cur.pairKey].bid) : cur.defaultPrice;
                    setTargetPriceStr(price.toFixed(cur.code === 'BTC' ? 0 : 4));
                  }
                }}
                className="w-full bg-card border border-border rounded-xl h-11 px-3 text-xs font-bold text-text focus:outline-none focus:border-primary/50 cursor-pointer"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-card text-text">
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Condition selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-text-muted px-1">
                Condição
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as 'above' | 'below')}
                className="w-full bg-card border border-border rounded-xl h-11 px-3 text-xs font-bold text-text focus:outline-none focus:border-primary/50 cursor-pointer"
              >
                <option value="below" className="bg-card text-text">Cair para (≤)</option>
                <option value="above" className="bg-card text-text">Subir para (≥)</option>
              </select>
            </div>

            {/* Target price input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                  Preço Alvo (R$)
                </label>
                <span className="text-[10px] text-text-muted font-mono">
                  Atual: {currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </span>
              </div>
              <input
                type="text"
                value={targetPriceStr}
                onChange={(e) => setTargetPriceStr(e.target.value)}
                placeholder="Ex: 5.60"
                className="w-full bg-card border border-border rounded-xl h-11 px-3 text-xs font-bold text-text focus:outline-none focus:border-primary/50 font-mono"
              />
            </div>
          </div>

          {/* Quick presets and note */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-text-muted font-bold mr-1">Atalhos:</span>
              <button
                type="button"
                onClick={() => applyPreset(-1)}
                className="text-[10px] px-2 py-1 rounded-lg border border-border bg-card hover:border-red-500/40 text-red-400 font-bold transition-colors"
              >
                -1%
              </button>
              <button
                type="button"
                onClick={() => applyPreset(-0.5)}
                className="text-[10px] px-2 py-1 rounded-lg border border-border bg-card hover:border-red-500/40 text-red-400 font-bold transition-colors"
              >
                -0.5%
              </button>
              <button
                type="button"
                onClick={() => applyPreset(0.5)}
                className="text-[10px] px-2 py-1 rounded-lg border border-border bg-card hover:border-green-500/40 text-green-400 font-bold transition-colors"
              >
                +0.5%
              </button>
              <button
                type="button"
                onClick={() => applyPreset(1)}
                className="text-[10px] px-2 py-1 rounded-lg border border-border bg-card hover:border-green-500/40 text-green-400 font-bold transition-colors"
              >
                +1%
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nota (ex: Viagem, Venda)..."
                className="flex-1 sm:w-44 bg-card border border-border rounded-xl h-9 px-3 text-[11px] text-text placeholder-text-muted/60 focus:outline-none focus:border-primary/50"
              />
              <button
                type="submit"
                className="flex items-center gap-1 px-4 h-9 rounded-xl bg-primary text-black font-bold text-xs hover:bg-primary/90 transition-all shrink-0 shadow-xs"
              >
                <Plus size={14} />
                <span>Criar Alerta</span>
              </button>
            </div>
          </div>
        </form>

        {/* Alerts list */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Seus Alertas Salvos ({alerts.length})
            </h3>
            {alerts.length > 0 && (
              <span className="text-[10px] text-text-muted font-medium">
                Verificados a cada atualização em tempo real
              </span>
            )}
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-8 rounded-2xl border border-dashed border-border p-6 text-text-muted text-xs">
              <ShieldAlert size={24} className="mx-auto mb-2 opacity-50" />
              Nenhum alerta configurado ainda. Defina um valor alvo acima para ser notificado.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {alerts.map((alert) => {
                const quote = quotes[alert.pairKey];
                const live = quote ? parseFloat(quote.bid) : 0;
                const distancePct = live > 0 ? ((alert.targetPrice - live) / live) * 100 : 0;

                return (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      alert.triggered
                        ? 'bg-primary/10 border-primary/40'
                        : alert.active
                        ? 'bg-card border-border hover:border-text/20'
                        : 'bg-card/40 border-border/40 opacity-60'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-text">
                          {alert.currencyName}
                        </span>
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${
                          alert.condition === 'above'
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                          {alert.condition === 'above' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {alert.condition === 'above' ? '≥' : '≤'} R$ {alert.targetPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                        </span>

                        {alert.triggered && (
                          <span className="text-[10px] font-bold text-primary bg-primary/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 size={11} />
                            Atingido!
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-text-muted">
                        <span>
                          Atual: <strong className="text-text font-mono">R$ {live > 0 ? live.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : '...'}</strong>
                        </span>
                        {!alert.triggered && live > 0 && (
                          <span className={distancePct > 0 ? 'text-green-400' : 'text-red-400'}>
                            (distância: {distancePct > 0 ? `+${distancePct.toFixed(2)}%` : `${distancePct.toFixed(2)}%`})
                          </span>
                        )}
                      </div>

                      {alert.note && (
                        <div className="text-[10px] text-text-muted/80 mt-1 truncate">
                          "{alert.note}"
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleToggleActive(alert.id)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors ${
                          alert.active
                            ? 'bg-text/5 text-text hover:bg-text/10 border-border'
                            : 'bg-text/5 text-text-muted hover:text-text border-border'
                        }`}
                      >
                        {alert.active ? 'Pausar' : 'Ativar'}
                      </button>

                      <button
                        onClick={() => handleDelete(alert.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Excluir alerta"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
