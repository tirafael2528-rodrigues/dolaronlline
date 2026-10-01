import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Search, X, Newspaper } from 'lucide-react';
import { NewsItem } from '../types';

interface NewsProps {
  news: NewsItem[];
}

const QUICK_TAGS = ['Dólar', 'Selic', 'Fed', 'Bitcoin', 'Câmbio'];

export default function News({ news }: NewsProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter news items based on title, description, or source
  const filteredNews = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return news;
    return news.filter(item => 
      item.title.toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term) ||
      item.source.toLowerCase().includes(term)
    );
  }, [news, searchTerm]);

  const handleTagClick = (tag: string) => {
    if (searchTerm.toLowerCase() === tag.toLowerCase()) {
      setSearchTerm('');
    } else {
      setSearchTerm(tag);
    }
  };

  return (
    <section className="py-6">
      {/* Header and Title */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Newspaper size={18} />
          </div>
          <h2 className="text-xl font-bold text-text tracking-tight">Últimas Notícias</h2>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider text-text-muted bg-text/5 px-2.5 py-1 rounded-full border border-border">
          {filteredNews.length} de {news.length}
        </span>
      </div>

      {/* Search Bar Input */}
      <div className="relative mb-3">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
          <Search size={16} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar notícias (ex: Dólar, Selic, Fed)..."
          className="w-full pl-10 pr-9 py-2.5 bg-card border border-border rounded-xl text-xs text-text placeholder-text-muted/70 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            title="Limpar busca"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text transition-colors"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Quick Filter Keyword Chips */}
      <div className="flex items-center gap-1.5 flex-wrap mb-4">
        <span className="text-[10px] text-text-muted font-bold mr-1">Filtros:</span>
        {QUICK_TAGS.map(tag => {
          const isActive = searchTerm.toLowerCase() === tag.toLowerCase();
          return (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`text-[11px] px-2.5 py-0.5 rounded-lg border font-medium transition-all ${
                isActive
                  ? 'bg-primary text-black border-primary font-bold shadow-xs'
                  : 'bg-text/5 text-text-muted border-border hover:text-text hover:border-text/20'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* News List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredNews.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 rounded-2xl bg-card border border-border text-center flex flex-col items-center"
            >
              <div className="w-10 h-10 rounded-full bg-text/5 flex items-center justify-center text-text-muted mb-2">
                <Search size={18} />
              </div>
              <p className="text-xs font-semibold text-text mb-1">
                Nenhuma notícia encontrada para "{searchTerm}"
              </p>
              <p className="text-[11px] text-text-muted mb-3 max-w-[240px]">
                Tente buscar por termos mais genéricos como Dólar, Câmbio, Selic ou Fed.
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs font-bold text-primary hover:underline px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 transition-all"
              >
                Limpar busca
              </button>
            </motion.div>
          ) : (
            filteredNews.map((item, i) => (
              <motion.a
                key={item.title}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
                className="p-4 rounded-2xl bg-card border border-border hover:border-primary/40 hover:bg-card/80 transition-all flex flex-col justify-between group block"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                      {item.source}
                    </span>
                    <ExternalLink size={13} className="text-text-muted group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-text font-semibold text-xs leading-snug mb-1.5 group-hover:text-primary transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-border/40 text-[10px] text-text-muted font-medium flex items-center justify-between">
                  <span>
                    {new Date(item.pubDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">
                    Ler na íntegra &rarr;
                  </span>
                </div>
              </motion.a>
            ))
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
