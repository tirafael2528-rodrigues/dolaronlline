import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Repeat, ArrowRightLeft } from 'lucide-react';
import { CoinData } from '../types';

interface ConverterProps {
  quotes: Record<string, CoinData>;
}

const FALLBACK_BRL_RATES: Record<string, number> = {
  BRL: 1,
  USD: 5.6850,
  EUR: 6.1820,
  GBP: 7.3980,
  ARS: 0.0055,
  PYG: 0.000725,
  BTC: 587500,
  ETH: 18620,
};

const getRateToBRL = (currency: string, quotesDict: Record<string, CoinData>): number => {
  if (currency === 'BRL') return 1;
  const directKey = `${currency}BRL`;
  const quote = quotesDict[directKey];
  if (quote && parseFloat(quote.bid) > 0) {
    return parseFloat(quote.bid);
  }
  // Secondary check if quote is stored without hyphen or with different key
  if (currency === 'USD' && quotesDict['USDBRL']) {
    return parseFloat(quotesDict['USDBRL'].bid);
  }
  return FALLBACK_BRL_RATES[currency] || 1;
};

export default function Converter({ quotes }: ConverterProps) {
  const [amount, setAmount] = useState<number>(1);
  const [amountStr, setAmountStr] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('BRL');
  const [result, setResult] = useState<number>(0);

  useEffect(() => {
    const rateFrom = getRateToBRL(fromCurrency, quotes);
    const rateTo = getRateToBRL(toCurrency, quotes);

    const amountInBRL = amount * rateFrom;
    const finalResult = amountInBRL / rateTo;
    setResult(finalResult);
  }, [amount, fromCurrency, toCurrency, quotes]);

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const handleAmountChange = (val: string) => {
    setAmountStr(val);
    if (val === '' || val === '-') {
      setAmount(0);
    } else {
      const parsed = parseFloat(val.replace(',', '.'));
      setAmount(isNaN(parsed) ? 0 : parsed);
    }
  };

  const formatValue = (num: number, cur: string) => {
    if (cur === 'BTC') {
      return `₿ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`;
    }
    if (cur === 'ETH') {
      return `Ξ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
    }
    if (cur === 'PYG' || cur === 'ARS') {
      return `${cur} ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
    }
    try {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: cur }).format(num);
    } catch {
      return `${cur} ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const rateFrom = getRateToBRL(fromCurrency, quotes);
  const rateTo = getRateToBRL(toCurrency, quotes);
  const unitRate = rateFrom / rateTo;

  const menuOptions = [
    { value: 'BRL', label: 'BRL - Real Brasileiro (R$)' },
    { value: 'USD', label: 'USD - Dólar Americano ($)' },
    { value: 'EUR', label: 'EUR - Euro (€)' },
    { value: 'GBP', label: 'GBP - Libra Esterlina (£)' },
    { value: 'ARS', label: 'ARS - Peso Argentino ($)' },
    { value: 'PYG', label: 'PYG - Guarani Paraguaio (₲)' },
    { value: 'BTC', label: 'BTC - Bitcoin (₿)' },
  ];

  const presets = [1, 10, 50, 100, 1000];

  return (
    <section id="conversor-section" className="py-8">
      <div className="p-6 md:p-8 rounded-[2rem] bg-card border border-border shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-text flex items-center gap-2 tracking-tight">
              <ArrowRightLeft className="text-primary w-6 h-6" />
              Conversor de Moedas
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Cotações em tempo real com conversão instantânea
            </p>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mr-1">Rápido:</span>
            {presets.map(p => (
              <button
                key={p}
                onClick={() => {
                  setAmount(p);
                  setAmountStr(p.toString());
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  amount === p 
                    ? 'bg-primary text-black border-primary font-bold shadow-xs' 
                    : 'bg-text/5 text-text-muted border-border hover:text-text hover:border-text/20'
                }`}
              >
                {p.toLocaleString('pt-BR')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] items-center gap-4 md:gap-6">
          {/* Amount input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-wider px-1">
              Valor a Converter
            </label>
            <div className="relative">
              <input 
                type="number" 
                value={amountStr}
                onChange={(e) => handleAmountChange(e.target.value)}
                min="0"
                step="any"
                placeholder="1"
                className="w-full bg-text/5 border border-border rounded-2xl h-14 px-4 text-text font-bold text-lg focus:outline-none focus:border-primary/50 transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-text-muted">
                {fromCurrency}
              </span>
            </div>
          </div>

          {/* Swap button */}
          <div className="flex justify-center md:pt-5">
            <button 
              onClick={swapCurrencies}
              title="Inverter Moedas"
              className="w-12 h-12 rounded-2xl bg-text/5 border border-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all shadow-xs"
            >
              <Repeat size={18} />
            </button>
          </div>

          {/* Selectors grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-wider px-1">
                De
              </label>
              <select 
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full bg-text/5 border border-border rounded-2xl h-14 px-3 text-text font-semibold text-sm focus:outline-none focus:border-primary/50 [&>option]:bg-card [&>option]:text-text cursor-pointer"
              >
                {menuOptions.map(opt => (
                  <option key={`from-${opt.value}`} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-wider px-1">
                Para
              </label>
              <select 
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full bg-text/5 border border-border rounded-2xl h-14 px-3 text-text font-semibold text-sm focus:outline-none focus:border-primary/50 [&>option]:bg-card [&>option]:text-text cursor-pointer"
              >
                {menuOptions.map(opt => (
                  <option key={`to-${opt.value}`} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Conversion result display */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-text-muted text-xs md:text-sm mb-1 font-medium">
              {amount.toLocaleString('pt-BR')} {fromCurrency} equivale a
            </span>
            <motion.div 
              key={`${amount}-${fromCurrency}-${toCurrency}-${result}`}
              initial={{ scale: 0.96, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-black text-text tracking-tight text-primary"
            >
              {formatValue(result, toCurrency)}
            </motion.div>
            <div className="text-[11px] text-text-muted mt-2 font-mono">
              Taxa de câmbio: 1 {fromCurrency} = {unitRate < 0.01 ? unitRate.toFixed(6) : unitRate.toFixed(4)} {toCurrency}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
