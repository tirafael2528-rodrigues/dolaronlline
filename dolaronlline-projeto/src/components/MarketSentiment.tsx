import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Gauge, TrendingUp, TrendingDown, Minus, Info, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CoinData } from '../types';

interface MarketSentimentProps {
  quote?: CoinData;
}

export default function MarketSentiment({ quote }: MarketSentimentProps) {
  const analysis = useMemo(() => {
    const pct = quote ? parseFloat(quote.pctChange || '0') : 0;
    const bid = quote ? parseFloat(quote.bid || '5.68') : 5.68;
    const high = quote ? parseFloat(quote.high || (bid * 1.008).toString()) : bid * 1.008;
    const low = quote ? parseFloat(quote.low || (bid * 0.992).toString()) : bid * 0.992;
    
    // Intraday position ratio (0 to 1)
    const range = high - low > 0 ? high - low : 0.05;
    const intraDayPos = Math.max(0, Math.min(1, (bid - low) / range));

    // Composite Sentiment Score from 0 (Extreme Bearish) to 100 (Extreme Bullish)
    // Base 50 + (pct * 15) weighted with intraday position (30%)
    let rawScore = 50 + (pct * 16) + ((intraDayPos - 0.5) * 25);
    const score = Math.round(Math.max(5, Math.min(95, rawScore)));

    let status: 'strong_bearish' | 'bearish' | 'neutral' | 'bullish' | 'strong_bullish';
    let label = 'Neutro';
    let enLabel = 'Neutral';
    let color = '#9CA3AF'; // gray
    let bgBadge = 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    let description = '';

    if (score <= 25) {
      status = 'strong_bearish';
      label = 'Forte Baixa';
      enLabel = 'Strong Bearish';
      color = '#EF4444'; // red-500
      bgBadge = 'bg-red-500/15 text-red-400 border-red-500/30';
      description = 'Forte pressão vendedora sobre a moeda americana, favorecendo a valorização do Real.';
    } else if (score <= 45) {
      status = 'bearish';
      label = 'Baixa Moderada';
      enLabel = 'Bearish';
      color = '#F97316'; // orange-500
      bgBadge = 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      description = 'Dólar operando em queda no comparativo de 24h, com viés vendedor predominante.';
    } else if (score <= 55) {
      status = 'neutral';
      label = 'Mercado Neutro';
      enLabel = 'Neutral';
      color = '#EAB308'; // yellow-500
      bgBadge = 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
      description = 'Cotação estável em faixa lateral de consolidação, sem tendência direcional definida.';
    } else if (score <= 75) {
      status = 'bullish';
      label = 'Alta Moderada';
      enLabel = 'Bullish';
      color = '#22C55E'; // green-500
      bgBadge = 'bg-green-500/15 text-green-400 border-green-500/30';
      description = 'Dólar em trajetória de valorização frente ao Real com fluxo comprador consistente.';
    } else {
      status = 'strong_bullish';
      label = 'Forte Alta';
      enLabel = 'Strong Bullish';
      color = '#10B981'; // emerald-500
      bgBadge = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      description = 'Forte pressão compradora, cotado próximo das máximas diárias com apetite comprador.';
    }

    // Gauge needle angle from -90deg (0 score) to +90deg (100 score)
    const needleAngle = -90 + (score / 100) * 180;

    return {
      pct,
      bid,
      high,
      low,
      intraDayPos,
      score,
      status,
      label,
      enLabel,
      color,
      bgBadge,
      description,
      needleAngle,
    };
  }, [quote]);

  return (
    <div className="p-5 md:p-6 rounded-3xl bg-card border border-border shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Gauge size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text tracking-tight flex items-center gap-1.5">
              Sentimento de Mercado (24h)
            </h3>
            <span className="text-[10px] text-text-muted">Termômetro Dólar vs Real</span>
          </div>
        </div>

        {/* Live variation badge */}
        <span
          className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg border flex items-center gap-0.5 ${
            analysis.pct >= 0
              ? 'bg-green-500/10 text-green-400 border-green-500/20'
              : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}
        >
          {analysis.pct >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {analysis.pct >= 0 ? `+${analysis.pct.toFixed(2)}%` : `${analysis.pct.toFixed(2)}%`}
        </span>
      </div>

      {/* SVG Semi-Circle Speedometer Gauge */}
      <div className="relative flex flex-col items-center justify-center pt-2 pb-1">
        <div className="relative w-48 h-26 flex items-center justify-center overflow-hidden">
          <svg viewBox="0 0 200 110" className="w-full h-full">
            <defs>
              <linearGradient id="sentimentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EF4444" />    {/* Red / Strong Bear */}
                <stop offset="25%" stopColor="#F97316" />   {/* Orange / Bear */}
                <stop offset="50%" stopColor="#EAB308" />   {/* Yellow / Neutral */}
                <stop offset="75%" stopColor="#22C55E" />   {/* Green / Bull */}
                <stop offset="100%" stopColor="#10B981" />  {/* Emerald / Strong Bull */}
              </linearGradient>
            </defs>

            {/* Background Arc Track */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="14"
              strokeLinecap="round"
              className="text-text/10"
            />

            {/* Colored Segment Arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="url(#sentimentGradient)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray="251.2"
              strokeDashoffset="0"
              opacity="0.85"
            />

            {/* Needle Center Pivot Pin */}
            <circle cx="100" cy="100" r="7" className="fill-card stroke-border" strokeWidth="3" />
            <circle cx="100" cy="100" r="3.5" fill={analysis.color} />

            {/* Animated Needle */}
            <g
              style={{
                transformOrigin: '100px 100px',
                transform: `rotate(${analysis.needleAngle}deg)`,
                transition: 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="30"
                stroke={analysis.color}
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </g>
          </svg>
        </div>

        {/* Meter Labels under arc */}
        <div className="w-full flex items-center justify-between text-[9px] font-black uppercase text-text-muted px-2 -mt-1 font-mono">
          <span className="text-red-400">Bearish (Baixa)</span>
          <span className="text-yellow-400">Neutro</span>
          <span className="text-emerald-400">Bullish (Alta)</span>
        </div>
      </div>

      {/* Main Status Display */}
      <div className="mt-4 pt-3 border-t border-border flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${analysis.bgBadge} flex items-center gap-1.5`}>
            {analysis.score > 55 ? (
              <TrendingUp size={12} />
            ) : analysis.score < 45 ? (
              <TrendingDown size={12} />
            ) : (
              <Minus size={12} />
            )}
            {analysis.enLabel.toUpperCase()} • {analysis.label}
          </span>
          <span className="text-xs font-mono font-bold text-text-muted">
            {analysis.score}/100
          </span>
        </div>

        <p className="text-[11px] text-text-muted leading-relaxed max-w-xs">
          {analysis.description}
        </p>
      </div>

      {/* Intraday Range Mini-bar */}
      <div className="mt-3 pt-3 border-t border-border/50 text-[10px]">
        <div className="flex items-center justify-between text-text-muted font-mono mb-1">
          <span>Mín: R$ {analysis.low.toFixed(3)}</span>
          <span className="text-text font-bold">Atual: R$ {analysis.bid.toFixed(3)}</span>
          <span>Máx: R$ {analysis.high.toFixed(3)}</span>
        </div>
        <div className="w-full h-1.5 bg-text/10 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.round(analysis.intraDayPos * 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ backgroundColor: analysis.color }}
          />
        </div>
      </div>
    </div>
  );
}
