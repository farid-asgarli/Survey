import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Chip } from '@/components/ui';
import { Wand2, Github, Zap, Code } from 'lucide-react';

export function BadgesChipsSection() {
  const [selectedChips, setSelectedChips] = useState<string[]>(['react']);

  const toggleChip = (id: string) => {
    setSelectedChips((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  return (
    <Card variant="elevated" shape="rounded">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-primary" />
          Badges & Chips
        </CardTitle>
        <CardDescription>Labels, tags, and selection chips</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Badges */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-on-surface">Badges</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="tertiary">Tertiary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </div>

        {/* Chips */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-on-surface">Filter Chips</h3>
          <div className="flex flex-wrap gap-2">
            {['react', 'typescript', 'tailwind', 'vite'].map((tech) => (
              <Chip key={tech} selected={selectedChips.includes(tech)} onClick={() => toggleChip(tech)}>
                {tech}
              </Chip>
            ))}
          </div>
        </div>

        {/* Chip with icons */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-on-surface">Chips with Icons</h3>
          <div className="flex flex-wrap gap-2">
            <Chip icon={<Github className="h-3.5 w-3.5" />}>GitHub</Chip>
            <Chip icon={<Zap className="h-3.5 w-3.5" />} selected>
              Fast
            </Chip>
            <Chip icon={<Code className="h-3.5 w-3.5" />}>Code</Chip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
