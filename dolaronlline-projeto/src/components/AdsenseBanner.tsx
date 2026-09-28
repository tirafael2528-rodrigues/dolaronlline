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

  // Evita disparar requisições com IDs fictícios durante a fase de análise do Google AdSense
  const isRealSlot = slot && slot.length >= 8 && !['1234567890', '9876543210', '5432109876', '1122334455'].includes(slot);

  useEffect(() => {
    if (!isRealSlot || isPushed.current) return;

    try {
      if (typeof window !== 'undefined') {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
        isPushed.current = true;
      }
    } catch (err) {
      console.warn("Google AdSense:", err);
    }
  }, [slot, isRealSlot]);

  // Se não for um bloco com ID real configurado, não renderiza caixas vazias
  // Isso evita a reprovação por 'anúncios veiculados em telas sem conteúdo do editor'
  if (!isRealSlot) {
    return null;
  }

  return (
    <div className={`my-6 text-center overflow-hidden transition-all ${className}`}>
      <div className="text-[10px] text-text-muted/60 uppercase tracking-widest font-semibold mb-1">
        Publicidade
      </div>

      <div className="flex items-center justify-center min-h-[90px] w-full overflow-hidden">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ ...style, minHeight: '90px', width: '100%' }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive}
        />
      </div>
    </div>
  );
}
