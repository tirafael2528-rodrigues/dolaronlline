import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Repeat } from 'lucide-react';
import { CoinData } from '../types';
import { MOEDAS_CONFIG } from '../constants';
import { cn } from '../lib/utils';

interface ConverterProps {
  quotes: Record<string, CoinData>;
}

export default function Converter({ quotes }: ConverterProps) {
  const [amount, setAmount] = useState<number>(1);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('BRL');
  const [result, setResult] = useState<number>(0);

  useEffect(() => {
    const convert = () => {
      let rateFrom = 1;
      if (fromCurrency !== 'BRL') {
        const quote = quotes[fromCurrency + 'BRL'];
        if (quote) {
          rateFrom = parseFloat(quote.bid);
        } else if (fromCurrency === 'USD') {
          const usdBrl = quotes['USDBRL'];
          if (usdBrl) rateFrom = parseFloat(usdBrl.bid);
        }
      }

      let rateTo = 1;
      if (toCurrency !== 'BRL') {
        const quote = quotes[toCurrency + 'BRL'];
        if (quote) {
          rateTo = parseFloat(quote.bid);
        } else if (toCurrency === 'USD') {
          const usdBrl = quotes['USDBRL'];
          if (usdBrl) rateTo = parseFloat(usdBrl.bid);
        }
      }

      const amountInBRL = amount * rateFrom;
      const finalResult = amountInBRL / rateTo;
      setResult(finalResult);
    };
    convert();
  }, [amount, fromCurrency, toCurrency, quotes]);

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const formatValue = (num: number, cur: string) => {
    if (cur === 'BTC') {
      return `₿ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`;
    }
    if (cur === 'ETH') {
      return `Ξ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`;
    }
    try {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: cur }).format(num);
    } catch (e) {
      return `${cur} ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const menuOptions = [
    { value: 'BRL', label: 'BRL (Real)' },
    { value: 'USD', label: 'USD (Dólar)' },
    { value: 'EUR', label: 'EUR (Euro - Europa)' },
    { value: 'PYG', label: 'PYG (Tupi Guarani - Paraguai)' },
    { value: 'BTC', label: 'BTC (Bitcoin)' },
    { value: 'GBP', label: 'GBP (Libra Esterlina)' },
    { value: 'ARS', label: 'ARS (Peso Argentino)' },
  ];

  return (
    <section id="conversor-section" className="py-12">
      <div className="max-w-3xl mx-auto p-8 rounded-[2rem] bg-card border border-border shadow-2xl">
        <h2 className="text-2xl font-bold text-text mb-8 flex items-center gap-2">
          Conversor de Moedas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] items-center gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-muted uppercase tracking-widest px-1">Valor</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-text/5 border border-border rounded-2xl h-14 px-4 text-text font-medium focus:outline-hidden focus:border-primary/50 transition-colors"
            />
          </div>

          <button 
            onClick={swapCurrencies}
            className="w-12 h-12 rounded-full bg-text/5 border border-border flex items-center justify-center text-text-muted hover:text-text hover:border-text/20 transition-all mt-6"
          >
            <Repeat size={18} />
          </button>

          <div className="grid grid-cols-2 gap-4 mt-6 md:mt-0">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest px-1">De</label>
              <select 
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full bg-text/5 border border-border rounded-2xl h-14 px-4 text-text font-medium focus:outline-hidden [&>option]:bg-card [&>option]:text-text"
              >
                {menuOptions.map(opt => (
                  <option key={`from-${opt.value}`} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-widest px-1">Para</label>
              <select 
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full bg-text/5 border border-border rounded-2xl h-14 px-4 text-text font-medium focus:outline-hidden [&>option]:bg-card [&>option]:text-text"
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

        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col items-center">
            <span className="text-text-muted text-sm mb-1">{amount} {fromCurrency} é igual a</span>
            <div className="text-4xl md:text-5xl font-black text-text tracking-tighter">
              {formatValue(result, toCurrency)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
