import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, toast } from '@/components/ui';
import { Layers, Check } from 'lucide-react';

export function ColorTokensSection() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const copyColor = (name: string) => {
    navigator.clipboard.writeText(name);
    setCopiedColor(name);
    toast.success(`Copied: ${name}`);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const colorGroups = [
    {
      title: 'Primary',
      colors: [
        { name: 'primary', label: 'Primary' },
        { name: 'on-primary', label: 'On Primary' },
        { name: 'primary-container', label: 'Primary Container' },
        { name: 'on-primary-container', label: 'On Primary Container' },
      ],
    },
    {
      title: 'Secondary',
      colors: [
        { name: 'secondary', label: 'Secondary' },
        { name: 'on-secondary', label: 'On Secondary' },
        { name: 'secondary-container', label: 'Secondary Container' },
        { name: 'on-secondary-container', label: 'On Secondary Container' },
      ],
    },
    {
      title: 'Tertiary',
      colors: [
        { name: 'tertiary', label: 'Tertiary' },
        { name: 'on-tertiary', label: 'On Tertiary' },
        { name: 'tertiary-container', label: 'Tertiary Container' },
        { name: 'on-tertiary-container', label: 'On Tertiary Container' },
      ],
    },
    {
      title: 'Surface',
      colors: [
        { name: 'surface', label: 'Surface' },
        { name: 'surface-container-lowest', label: 'Container Lowest' },
        { name: 'surface-container-low', label: 'Container Low' },
        { name: 'surface-container', label: 'Container' },
        { name: 'surface-container-high', label: 'Container High' },
        { name: 'surface-container-highest', label: 'Container Highest' },
      ],
    },
    {
      title: 'Semantic',
      colors: [
        { name: 'error', label: 'Error' },
        { name: 'warning', label: 'Warning' },
        { name: 'success', label: 'Success' },
        { name: 'info', label: 'Info' },
      ],
    },
    {
      title: 'Utility',
      colors: [
        { name: 'on-surface', label: 'On Surface' },
        { name: 'on-surface-variant', label: 'On Surface Variant' },
        { name: 'outline', label: 'Outline' },
        { name: 'outline-variant', label: 'Outline Variant' },
      ],
    },
  ];

  return (
    <Card variant="elevated" shape="rounded">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          Color Tokens
        </CardTitle>
        <CardDescription>M3 Design System color palette (click to copy)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {colorGroups.map((group) => (
          <div key={group.title} className="space-y-2">
            <h3 className="text-sm font-medium text-on-surface">{group.title}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {group.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => copyColor(color.name)}
                  className="group relative flex flex-col items-start p-2 rounded-lg hover:bg-surface-container transition-colors"
                >
                  <div className={cn('w-full h-10 rounded-lg shadow-sm mb-1 ring-1 ring-inset ring-outline-variant/20', `bg-${color.name}`)} />
                  <span className="text-[10px] font-mono text-on-surface-variant truncate w-full">{color.label}</span>
                  {copiedColor === color.name && (
                    <div className="absolute inset-0 flex items-center justify-center bg-surface/80 rounded-lg">
                      <Check className="w-5 h-5 text-success" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
