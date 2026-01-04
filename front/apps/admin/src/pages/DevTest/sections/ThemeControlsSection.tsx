import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/themeStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@/components/ui';
import { Palette, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { COLOR_PALETTES, THEME_MODES } from '@/config';

export function ThemeControlsSection() {
  const { t } = useTranslation();
  const { colorPalette, themeMode, isDark, setColorPalette, setThemeMode } = useThemeStore();

  return (
    <Card variant="elevated" shape="rounded">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          Theme Controls
        </CardTitle>
        <CardDescription>Customize the application appearance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Color Palette Selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-on-surface">Color Scheme</h3>
          <div className="grid grid-cols-3 gap-3">
            {COLOR_PALETTES.map((palette) => (
              <button
                key={palette.id}
                onClick={() => setColorPalette(palette.id)}
                className={cn(
                  'relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200',
                  'border-2 hover:scale-105',
                  colorPalette === palette.id
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-outline-variant/30 hover:border-outline-variant bg-surface-container-low'
                )}
              >
                <div className="flex gap-1">
                  {palette.colors.map((color, i) => (
                    <div key={i} className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: color }} />
                  ))}
                </div>
                <span className="text-xs font-medium text-on-surface">{t(palette.labelKey)}</span>
                {colorPalette === palette.id && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-on-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Mode Selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-on-surface">Theme Mode</h3>
          <div className="flex gap-2">
            {THEME_MODES.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => setThemeMode(mode.id)}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200',
                    'border-2 hover:scale-[1.02]',
                    themeMode === mode.id
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : 'border-outline-variant/30 hover:border-outline-variant bg-surface-container-low'
                  )}
                >
                  <Icon className={cn('h-6 w-6 shrink-0', themeMode === mode.id ? 'text-primary' : 'text-on-surface-variant')} />
                  <span className="text-sm font-medium text-on-surface">{t(mode.labelKey)}</span>
                  <span className="text-xs text-on-surface-variant">{t(mode.descKey)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current State Display */}
        <div className="p-4 bg-surface-container rounded-xl space-y-2">
          <h3 className="text-sm font-medium text-on-surface">Current State</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Palette: {colorPalette}</Badge>
            <Badge variant="secondary">Mode: {themeMode}</Badge>
            <Badge variant={isDark ? 'default' : 'outline'}>{isDark ? 'Dark Active' : 'Light Active'}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
