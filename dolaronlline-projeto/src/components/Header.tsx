import { motion, AnimatePresence } from 'motion/react';
import { DollarSign, Menu, Moon, Sun, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HeaderProps {
  selectedCurrency: 'USD' | 'EUR' | 'BTC';
  onSelectCurrency: (currency: 'USD' | 'EUR' | 'BTC') => void;
}

export default function Header({ selectedCurrency, onSelectCurrency }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });
  const [brasiliaTime, setBrasiliaTime] = useState('');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Real-time Brasília Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      setBrasiliaTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSelect = (currency: 'USD' | 'EUR' | 'BTC') => {
    onSelectCurrency(currency);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToConversor = () => {
    setIsMenuOpen(false);
    setTimeout(() => {
      const element = document.getElementById('conversor-section');
      if (element) {
        const headerOffset = 80; // Compensates for the fixed header height
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + (window.scrollY || window.pageYOffset || 0) - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => handleSelect('USD')}
        >
          <div className="w-8 h-8 rounded-lg premium-gradient flex items-center justify-center">
            <DollarSign className="text-black w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-text">
            Dólar<span className="text-primary">Onlline</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-muted">
          <button 
            type="button"
            onClick={() => handleSelect('USD')} 
            className={`hover:text-text transition-colors cursor-pointer ${selectedCurrency === 'USD' ? 'text-primary font-bold' : ''}`}
          >
            Dólar Hoje
          </button>
          <button 
            type="button"
            onClick={() => handleSelect('EUR')} 
            className={`hover:text-text transition-colors cursor-pointer ${selectedCurrency === 'EUR' ? 'text-primary font-bold' : ''}`}
          >
            Euro Hoje
          </button>
          <button 
            type="button"
            onClick={() => handleSelect('BTC')} 
            className={`hover:text-text transition-colors cursor-pointer ${selectedCurrency === 'BTC' ? 'text-primary font-bold' : ''}`}
          >
            Bitcoin
          </button>
          <button 
            type="button"
            onClick={handleScrollToConversor} 
            className="hover:text-text transition-colors cursor-pointer"
          >
            Conversor
          </button>
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Real-time Brasília Clock */}
          {brasiliaTime && (
            <div className="flex items-center text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-wider bg-text/5 border border-border/80 px-2 md:px-3 py-1.5 rounded-xl gap-1.5 md:gap-2 font-mono">
              <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-red-500"></span>
              </span>
              <span>ao vivo <span className="text-text">{brasiliaTime}</span></span>
            </div>
          )}

          <button 
            onClick={toggleTheme}
            className="p-2 text-text-muted hover:text-text transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <button 
            className="md:hidden p-2 text-text-muted transition-colors hover:text-text"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Abrir menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-border bg-background/95 backdrop-blur-md absolute top-16 left-0 right-0 z-40 overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-4 text-sm font-medium">
              <button 
                onClick={() => handleSelect('USD')} 
                className={`text-left py-2 hover:text-text transition-colors w-full cursor-pointer ${selectedCurrency === 'USD' ? 'text-primary font-bold border-l-2 border-primary pl-2' : 'pl-2'}`}
              >
                Dólar Hoje
              </button>
              <button 
                onClick={() => handleSelect('EUR')} 
                className={`text-left py-2 hover:text-text transition-colors w-full cursor-pointer ${selectedCurrency === 'EUR' ? 'text-primary font-bold border-l-2 border-primary pl-2' : 'pl-2'}`}
              >
                Euro Hoje
              </button>
              <button 
                onClick={() => handleSelect('BTC')} 
                className={`text-left py-2 hover:text-text transition-colors w-full cursor-pointer ${selectedCurrency === 'BTC' ? 'text-primary font-bold border-l-2 border-primary pl-2' : 'pl-2'}`}
              >
                Bitcoin
              </button>
              <button 
                onClick={handleScrollToConversor} 
                className="text-left py-2 hover:text-text transition-colors w-full cursor-pointer pl-2"
              >
                Conversor
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
