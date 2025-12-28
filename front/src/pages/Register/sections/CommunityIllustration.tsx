import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * CommunityIllustration - M3 Expressive Style
 * Visual representation of community with animated user avatars
 */
export function CommunityIllustration() {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative h-80">
        {/* Central circle with users */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-gradient-to-br from-primary-container to-tertiary-container/50 flex items-center justify-center shadow-xl">
          <Users className="w-16 h-16 text-primary" />
        </div>

        {/* Orbiting user avatars */}
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i / 5) * 360 - 90;
          const radius = 120;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;
          const colors = ['bg-primary', 'bg-tertiary', 'bg-secondary', 'bg-primary-container', 'bg-tertiary-container'];
          const sizes = ['w-12 h-12', 'w-10 h-10', 'w-14 h-14', 'w-11 h-11', 'w-10 h-10'];

          return (
            <div
              key={i}
              className={cn('absolute rounded-full shadow-lg flex items-center justify-center animate-float', colors[i], sizes[i])}
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)',
                animationDelay: `${i * 0.3}s`,
              }}
            >
              <div className="w-2/3 h-2/3 rounded-full bg-surface-container-lowest/30" />
            </div>
          );
        })}

        {/* Connecting lines (decorative) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-2 border-dashed border-outline-variant/30 animate-spin-slow" />

        {/* Sparkle accents */}
        <div className="absolute right-8 top-4 w-4 h-4 rounded-full bg-tertiary shadow-md animate-bounce" style={{ animationDuration: '2s' }} />
        <div
          className="absolute left-12 bottom-8 w-3 h-3 rounded-full bg-primary shadow-md animate-bounce"
          style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}
        />
        <div
          className="absolute right-16 bottom-16 w-5 h-5 rounded-full bg-secondary shadow-md animate-bounce"
          style={{ animationDuration: '3s', animationDelay: '1s' }}
        />
      </div>
    </div>
  );
}
