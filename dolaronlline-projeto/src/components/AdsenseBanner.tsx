import React, { useEffect, useRef } from 'react';

interface AdsenseBannerProps {
  client?: string;
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: 'true' | 'false';
  style?: React.CSSProperties;
  className?: string;
}

export default function AdsenseBanner({
  client = "ca-pub-7230683739706170",
  slot,
  format = "auto",
  responsive = "true",
  style = { display: 'block' },
  className = ""
}: AdsenseBannerProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const isPushed = useRef(false);

  useEffect(() => {
    // Evita chamar push duplicado no mesmo componente
    if (isPushed.current) return;

    try {
      if (typeof window !== 'undefined') {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
        isPushed.current = true;
      }
    } catch (err) {
      console.warn("Google AdSense não pôde inicializar o anúncio:", err);
    }
  }, [slot]);

  // Se não houver slot definido e o usuário estiver usando Auto Ads do Google,
  // os anúncios automáticos cuidam do layout. Caso haja slot, renderizamos o bloco oficial.
  return (
    <div className={`my-6 text-center overflow-hidden transition-all ${className}`}>
      {/* Rótulo de conformidade do Google */}
      <div className="text-[10px] text-text-muted/60 uppercase tracking-widest font-semibold mb-1">
        Publicidade
      </div>

      <div className="flex items-center justify-center min-h-[90px] w-full overflow-hidden">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ ...style, minHeight: '90px', width: '100%' }}
          data-ad-client={client}
          {...(slot ? { 'data-ad-slot': slot } : {})}
          data-ad-format={format}
          data-full-width-responsive={responsive}
        />
      </div>
    </div>
  );
}
