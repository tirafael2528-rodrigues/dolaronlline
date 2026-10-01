import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './components/Header';
import Hero from './components/Hero';
import Converter from './components/Converter';
import Chart from './components/Chart';
import MoedasCards from './components/MoedasCards';
import News from './components/News';
import PriceAlert from './components/PriceAlert';
import MarketSentiment from './components/MarketSentiment';
import Footer from './components/Footer';
import FinanceEducation from './components/FinanceEducation';
import EducationalGuides from './components/EducationalGuides';
import { fetchQuotes, fetchNews } from './services/api';
import { CoinData, NewsItem } from './types';
import { FETCH_INTERVAL } from './constants';

export default function App() {
  const [quotes, setQuotes] = useState<Record<string, CoinData>>({});
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'BTC'>('USD');

  useEffect(() => {
    const loadData = async () => {
      const pairs = [
        'USD-BRL', 'USD-BRLT', 'EUR-BRL', 'GBP-BRL', 
        'ARS-BRL', 'BTC-BRL', 'ETH-BRL', 'XAU-USD', 'PYG-BRL'
      ];
      const [quotesData, newsData] = await Promise.all([
        fetchQuotes(pairs),
        fetchNews()
      ]);
      setQuotes(quotesData);
      setNews(newsData);
      setLoading(false);
    };

    loadData();
    const interval = setInterval(loadData, FETCH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const chartPair = selectedCurrency === 'USD' ? 'USD-BRL' : selectedCurrency === 'EUR' ? 'EUR-BRL' : 'BTC-BRL';

  return (
    <div className="min-h-screen selection:bg-primary/30">
      <Header selectedCurrency={selectedCurrency} onSelectCurrency={setSelectedCurrency} />
      
      <main className="max-w-7xl mx-auto px-4 md:px-8">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-screen flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <span className="text-text-muted font-mono text-xs tracking-widest uppercase animate-pulse">
                  Conectando-se ao mercado...
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Hero 
                selectedCurrency={selectedCurrency}
                quotes={quotes}
              />

              {/* Grid de Moedas em Tempo Real */}
              <MoedasCards quotes={quotes} />
              
              {/* Painel Principal: Gráfico Histórico + Conversor | Notícias */}
              <div className="grid grid-cols-1 xl:grid-cols-[1fr,384px] gap-8 mt-4">
                <div>
                  <Chart pair={chartPair} />
                  <Converter quotes={quotes} />
                  <PriceAlert quotes={quotes} />
                </div>
                <div className="hidden xl:block">
                  <div className="sticky top-24 space-y-6">
                    <MarketSentiment quote={quotes['USDBRL']} />
                    <News news={news} />
                  </div>
                </div>
              </div>

              {/* Sentimento e Notícias no mobile */}
              <div className="xl:hidden mt-6 space-y-6">
                <MarketSentiment quote={quotes['USDBRL']} />
                <News news={news} />
              </div>

              {/* Seção Editorial e Educativa (Requisito Google AdSense) */}
              <div className="mt-16 pt-8 border-t border-border">
                <EducationalGuides />
                <FinanceEducation />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
