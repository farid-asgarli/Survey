import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { Layout } from 'lucide-react';

export function SpacingSection() {
  const spacings = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16];

  return (
    <Card variant="elevated" shape="rounded">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layout className="h-5 w-5 text-primary" />
          Spacing Scale
        </CardTitle>
        <CardDescription>Tailwind spacing units (0.25rem = 4px base)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {spacings.map((space) => (
            <div key={space} className="flex items-center gap-4">
              <span className="w-12 text-xs font-mono text-on-surface-variant">p-{space}</span>
              <div className="bg-primary/20 rounded" style={{ width: `${space * 4}px`, height: '24px' }} />
              <span className="text-xs text-on-surface-variant">{space * 4}px</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
