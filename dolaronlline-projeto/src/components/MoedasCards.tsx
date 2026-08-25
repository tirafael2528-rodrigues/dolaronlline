import { motion } from 'motion/react';
import { CoinData } from '../types';
import { formatCurrency, formatPercent } from '../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MoedasCardsProps {
  quotes: Record<string, CoinData>;
}

export default function MoedasCards({ quotes }: MoedasCardsProps) {
  const moedas = [
    { code: 'EURBRL', name: 'Euro', icon: '€' },
    { code: 'GBPBRL', name: 'Libra', icon: '£' },
    { code: 'ARSBRL', name: 'Peso Arg', icon: '$' },
    { code: 'BTCBRL', name: 'Bitcoin', icon: '₿' },
    { code: 'ETHBRL', name: 'Ethereum', icon: 'Ξ' },
    { code: 'XAUUSD', name: 'Ouro (USD)', icon: 'Au' },
  ];

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-text tracking-tight">Outras Moedas</h2>
        <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Tempo Real</span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {moedas.map((m, i) => {
          const data = quotes[m.code];
          if (!data) return null;
          const isUp = parseFloat(data.pctChange) >= 0;

          return (
            <motion.div
              key={m.code}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-2xl bg-card border border-border hover:border-text/10 transition-all flex flex-col items-center group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-text/5 flex items-center justify-center text-primary font-bold text-lg mb-3 group-hover:bg-primary/20 transition-colors">
                {m.icon}
              </div>
              <span className="text-[10px] font-bold text-text-muted uppercase mb-1">{m.name}</span>
              <span className="text-lg font-bold text-text mb-1">
                {m.code.includes('BTC') ? parseFloat(data.bid).toLocaleString('pt-BR') : formatCurrency(parseFloat(data.bid))}
              </span>
              <div className={cn(
                "flex items-center gap-0.5 text-[10px] font-black",
                isUp ? "text-green-500" : "text-red-500"
              )}>
                {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {data.pctChange}%
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

import { cn } from '../lib/utils';
