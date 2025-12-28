import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SurveyIllustration Component
 *
 * Displays an animated illustration representing survey functionality
 * with floating cards and interactive elements.
 */
export function SurveyIllustration() {
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Floating cards representing survey responses */}
      <div className="relative h-80">
        {/* Main card */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 bg-surface-container-lowest rounded-3xl p-6 shadow-xl border border-outline-variant/20 transform rotate-2 transition-transform hover:rotate-0 hover:scale-105">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-primary-container flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="h-2.5 w-24 bg-on-surface/10 rounded-full" />
              <div className="h-2 w-16 bg-on-surface/5 rounded-full mt-1.5" />
            </div>
          </div>
          {/* Survey options */}
          {[85, 60, 40].map((width, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <div className="flex items-center gap-2 mb-1.5">
                <div className={cn('w-4 h-4 rounded-full border-2', i === 0 ? 'border-primary bg-primary' : 'border-outline-variant')} />
                <div className="h-2 bg-on-surface/10 rounded-full" style={{ width: `${width}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Floating response card - left */}
        <div className="absolute left-0 top-8 w-32 bg-tertiary-container/80 rounded-2xl p-4 shadow-lg transform -rotate-6 animate-float">
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={cn('w-4 h-4 rounded-full', i <= 4 ? 'bg-tertiary' : 'bg-tertiary/30')} />
            ))}
          </div>
          <div className="h-2 w-full bg-on-tertiary-container/20 rounded-full" />
        </div>

        {/* Floating response card - right */}
        <div
          className="absolute right-0 bottom-12 w-36 bg-secondary-container/80 rounded-2xl p-4 shadow-lg transform rotate-3 animate-float"
          style={{ animationDelay: '1s' }}
        >
          <div className="h-2.5 w-3/4 bg-on-secondary-container/20 rounded-full mb-2" />
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-secondary rounded-full" />
            <span className="text-xs font-semibold text-on-secondary-container">78%</span>
          </div>
        </div>

        {/* Small accent dot - top right */}
        <div className="absolute right-12 top-0 w-6 h-6 rounded-full bg-primary shadow-lg animate-bounce" style={{ animationDuration: '2s' }} />

        {/* Small accent dot - bottom left */}
        <div
          className="absolute left-8 bottom-4 w-4 h-4 rounded-full bg-tertiary shadow-md animate-bounce"
          style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}
        />
      </div>
    </div>
  );
}
