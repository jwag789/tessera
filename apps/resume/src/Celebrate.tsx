// A burst of tiles in the theme's four colors when a job reaches Offer. Reduced motion gets the toast only.
import { useEffect, useState } from 'react';
import { useToast } from '@tessera/react';

const TILES = 36;

export function Celebrate() {
  const { toast } = useToast();
  const [burst, setBurst] = useState(0);
  useEffect(() => {
    const on = (e: Event) => {
      const company = (e as CustomEvent<string>).detail;
      toast({ title: `An offer from ${company || 'them'}!`, description: 'All that work paid off. Take a moment.', icon: 'sparkle', duration: 7000 });
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setBurst((b) => b + 1);
    };
    window.addEventListener('folio:offer', on);
    return () => window.removeEventListener('folio:offer', on);
  }, [toast]);
  useEffect(() => {
    if (!burst) return;
    const t = setTimeout(() => setBurst(0), 1800);
    return () => clearTimeout(t);
  }, [burst]);
  if (!burst) return null;
  return (
    <div className="f-confetti" aria-hidden="true" key={burst}>
      {Array.from({ length: TILES }, (_, i) => {
        const angle = (i / TILES) * Math.PI * 2 + (i % 3) * 0.2;
        const dist = 160 + ((i * 37) % 140);
        return (
          <i
            key={i}
            style={
              {
                '--x': `${Math.cos(angle) * dist}px`,
                '--y': `${Math.sin(angle) * dist - 80}px`,
                '--r': `${((i * 53) % 360) - 180}deg`,
                background: `var(--tile-${(i % 4) + 1})`,
                animationDelay: `${(i % 6) * 18}ms`
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
