import React, { useEffect } from 'react';

interface AdsenseBannerProps {
  client?: string; // Opcional, do tipo ca-pub-XXXXXXXXXXXXXXXX
  slot: string;   // ID do bloco de anúncio
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: 'true' | 'false';
  style?: React.CSSProperties;
  className?: string;
}

export default function AdsenseBanner({
  client = "ca-pub-0000000000000000", // Substituir pelo ID ca-pub real de cada editor
  slot,
  format = "auto",
  responsive = "true",
  style = { display: 'block' },
  className = ""
}: AdsenseBannerProps) {
  useEffect(() => {
    try {
      // Executa o pusher de anúncios do Google assim que o componente for montado
      // e garante que o script do Adsense esteja carregado na página
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (err) {
      console.warn("AdSense snippet failed to push. AdBlocker active or script not fully loaded.");
    }
  }, [slot]);

  return (
    <div className={`my-8 bg-card border border-border rounded-2xl p-4 text-center relative overflow-hidden transition-all ${className}`}>
      {/* Indicador sutil de publicidade */}
      <div className="text-[10px] text-text-muted uppercase tracking-widest font-bold mb-2">
        Publicidade • Google AdSense
      </div>

      <div className="flex items-center justify-center min-h-[90px] md:min-h-[250px] bg-text/5 rounded-xl border border-dashed border-border overflow-hidden relative">
        <ins
          className="adsbygoogle"
          style={style}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive}
        />
        
        {/* Placeholder elegante e instrutivo para desenvolvimento e visualização sem script real */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 pointer-events-none opacity-60">
          <svg className="w-8 h-8 text-primary mb-2 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M16 8l-8 8M8 8l8 8" />
          </svg>
          <span className="text-xs font-semibold text-text">Bloco de Anúncio Ativo</span>
          <span className="text-[10px] text-text-muted mt-1 font-mono">Slot: {slot}</span>
        </div>
      </div>
    </div>
  );
}
