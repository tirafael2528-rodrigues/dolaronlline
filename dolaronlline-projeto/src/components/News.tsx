import { motion } from 'motion/react';
import { ExternalLink } from 'lucide-react';
import { NewsItem } from '../types';

interface NewsProps {
  news: NewsItem[];
}

export default function News({ news }: NewsProps) {
  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold text-text mb-8">Últimas Notícias</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {news.map((item, i) => (
          <motion.a
            key={i}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-3xl bg-card border border-border hover:border-text/10 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{item.source}</span>
                <ExternalLink size={14} className="text-text-muted group-hover:text-text transition-colors" />
              </div>
              <h3 className="text-text font-semibold leading-tight mb-2 group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-text-muted line-clamp-3">
                {item.description}
              </p>
            </div>
            <div className="mt-4 text-[10px] text-text-muted font-medium">
              {new Date(item.pubDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
