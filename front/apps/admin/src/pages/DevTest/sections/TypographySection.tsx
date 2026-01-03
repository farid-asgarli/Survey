import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { Type } from 'lucide-react';

export function TypographySection() {
  return (
    <Card variant="elevated" shape="rounded">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="h-5 w-5 text-primary" />
          Typography
        </CardTitle>
        <CardDescription>Font sizes, weights and styles</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="p-3 bg-surface-container rounded-lg">
            <span className="text-xs text-on-surface-variant font-mono">text-xs</span>
            <p className="text-xs text-on-surface">The quick brown fox jumps over the lazy dog</p>
          </div>
          <div className="p-3 bg-surface-container rounded-lg">
            <span className="text-xs text-on-surface-variant font-mono">text-sm</span>
            <p className="text-sm text-on-surface">The quick brown fox jumps over the lazy dog</p>
          </div>
          <div className="p-3 bg-surface-container rounded-lg">
            <span className="text-xs text-on-surface-variant font-mono">text-base</span>
            <p className="text-base text-on-surface">The quick brown fox jumps over the lazy dog</p>
          </div>
          <div className="p-3 bg-surface-container rounded-lg">
            <span className="text-xs text-on-surface-variant font-mono">text-lg</span>
            <p className="text-lg text-on-surface">The quick brown fox jumps over the lazy dog</p>
          </div>
          <div className="p-3 bg-surface-container rounded-lg">
            <span className="text-xs text-on-surface-variant font-mono">text-xl</span>
            <p className="text-xl text-on-surface">The quick brown fox jumps over the lazy dog</p>
          </div>
          <div className="p-3 bg-surface-container rounded-lg">
            <span className="text-xs text-on-surface-variant font-mono">text-2xl</span>
            <p className="text-2xl text-on-surface">The quick brown fox jumps over the lazy dog</p>
          </div>
          <div className="p-3 bg-surface-container rounded-lg">
            <span className="text-xs text-on-surface-variant font-mono">text-3xl font-semibold</span>
            <p className="text-3xl font-semibold text-on-surface">The quick brown fox</p>
          </div>
        </div>

        {/* Font weights */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-on-surface">Font Weights</h3>
          <div className="grid grid-cols-2 gap-2">
            {['font-light', 'font-normal', 'font-medium', 'font-semibold', 'font-bold'].map((weight) => (
              <div key={weight} className="p-2 bg-surface-container rounded-lg">
                <span className="text-xs text-on-surface-variant font-mono">{weight}</span>
                <p className={cn('text-on-surface', weight)}>Sample Text</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
