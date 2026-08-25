import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import { CoinData } from '../types';
import { formatCurrency, formatPercent } from '../lib/utils';
import { cn } from '../lib/utils';

interface HeroProps {
  selectedCurrency: 'USD' | 'EUR' | 'BTC';
  quotes: Record<string, CoinData>;
}

export default function Hero({ selectedCurrency, quotes }: HeroProps) {
  let mainData: CoinData | null = null;
  let sideData: CoinData | null = null;
  let mainTitle = '';
  let sideTitle = '';
  let icon: React.ReactNode = null;
  
  if (selectedCurrency === 'USD') {
    mainData = quotes['USDBRL'] || null;
    sideData = quotes['USDBRLT'] || null;
    mainTitle = 'AO VIVO • DÓLAR COMERCIAL';
    sideTitle = 'Dólar Turismo';
    icon = <DollarSignBig />;
  } else if (selectedCurrency === 'EUR') {
    mainData = quotes['EURBRL'] || null;
    const baseEur = quotes['EURBRL'];
    sideData = baseEur ? {
      ...baseEur,
      bid: (parseFloat(baseEur.bid) * 1.035).toFixed(4),
    } : null;
    mainTitle = 'AO VIVO • EURO COMERCIAL';
    sideTitle = 'Euro Turismo (Est.)';
    icon = <EuroSignBig />;
  } else if (selectedCurrency === 'BTC') {
    mainData = quotes['BTCBRL'] || null;
    sideData = quotes['ETHBRL'] || null;
    mainTitle = 'AO VIVO • BITCOIN (BTC)';
    sideTitle = 'Ethereum (ETH)';
    icon = <BitcoinSignBig />;
  }

  if (!mainData) return null;

  const isUp = parseFloat(mainData.pctChange) >= 0;

  return (
    <section className="pt-24 pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          key={`main-hero-${selectedCurrency}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-3xl bg-card border border-border relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            {icon}
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 text-text-muted text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {mainTitle}
            </div>
            
            <div className="flex items-end gap-3 mb-2">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-text">
                {mainData.code === 'BTC' ? parseFloat(mainData.bid).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : formatCurrency(parseFloat(mainData.bid))}
              </h1>
              <div className={cn(
                "flex items-center gap-1 mb-2 px-2 py-0.5 rounded-full text-sm font-bold",
                isUp ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
              )}>
                {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {formatPercent(mainData.pctChange)}
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-text-muted">
              <div className="flex flex-col">
                <span>Mínima</span>
                <span className="text-text font-medium">
                  {mainData.code === 'BTC' ? parseFloat(mainData.low).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : formatCurrency(parseFloat(mainData.low))}
                </span>
              </div>
              <div className="flex flex-col">
                <span>Máxima</span>
                <span className="text-text font-medium">
                  {mainData.code === 'BTC' ? parseFloat(mainData.high).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : formatCurrency(parseFloat(mainData.high))}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col justify-stretch">
          <PriceCard 
            key={`price-card-${selectedCurrency}`}
            title={sideTitle} 
            value={sideData?.bid || '0'} 
            change={sideData?.pctChange || '0'}
            isCrypto={selectedCurrency === 'BTC'}
            className="h-full flex flex-col justify-center py-10"
          />
        </div>
      </div>
    </section>
  );
}

function PriceCard({ title, value, change, isCrypto, className }: { title: string, value: string, change: string; isCrypto?: boolean; className?: string; key?: string }) {
  const isUp = parseFloat(change) >= 0;
  const numValue = parseFloat(value);
  const formatted = isCrypto 
    ? numValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : formatCurrency(numValue);
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn("p-8 rounded-3xl bg-card border border-border hover:border-text/10 transition-colors", className)}
    >
      <span className="text-xs font-bold text-text-muted uppercase tracking-widest">{title}</span>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-text">{formatted}</span>
      </div>
      <div className={cn(
        "mt-1 text-xs font-medium flex items-center gap-0.5",
        isUp ? "text-green-500" : "text-red-500"
      )}>
        {isUp ? "+" : ""}{change}%
      </div>
    </motion.div>
  );
}

function PriceBox({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="p-6 rounded-3xl bg-card border border-border flex flex-col justify-between">
      <div className="w-10 h-10 rounded-xl bg-text/5 flex items-center justify-center border border-border">
        {icon}
      </div>
      <div>
        <h3 className="text-text font-semibold mb-1">{title}</h3>
        <p className="text-xs text-text-muted">{description}</p>
      </div>
    </div>
  );
}

function DollarSignBig() {
  return (
    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-text">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function EuroSignBig() {
  return (
    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-text">
      <path d="M4 10h12" />
      <path d="M4 14h9" />
      <path d="M19 6a7.7 7.7 0 0 0-5.2-2a7.9 7.9 0 0 0 6 12a7.9 7.9 0 0 0 7.8 8a7.7 7.7 0 0 0 5.2-2" />
    </svg>
  );
}

function BitcoinSignBig() {
  return (
    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-text">
      <path d="M11.75 14H14a3 3 0 0 0 2.25-5.25c-.25-.25-.5-.4-.75-.5A3.25 3.25 0 0 0 13 5h-4v9h2.75zm0 0H15a3 3 0 0 1 2.25 5.25c-.25.25-.5.4-.75.5A3.25 3.25 0 0 1 14 21h-5v-7h2.75z" />
    </svg>
  );
}
