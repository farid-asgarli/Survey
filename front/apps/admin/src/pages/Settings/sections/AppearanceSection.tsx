import { useTranslation } from 'react-i18next';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  SelectionCard,
  SelectionCardLabel,
  SelectionCardIcon,
  SelectionCardGroup,
} from '@/components/ui';
import { Sun, Palette } from 'lucide-react';
import { usePreferencesStore } from '@/stores';
import { useUpdateSinglePreference } from '@/hooks';
import { cn } from '@/lib/utils';
import { COLOR_PALETTES, THEME_MODES } from '../constants';
import type { ThemeMode, ColorPalette } from '@/types';

export function AppearanceSection() {
  const { t } = useTranslation();
  const themeMode = usePreferencesStore((s) => s.preferences.themeMode);
  const colorPalette = usePreferencesStore((s) => s.preferences.colorPalette);
  const setThemeMode = usePreferencesStore((s) => s.setThemeMode);
  const setColorPalette = usePreferencesStore((s) => s.setColorPalette);
  const { updateThemeMode, updateColorPalette, isPending } = useUpdateSinglePreference();

  const handleThemeModeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    updateThemeMode(mode);
  };

  const handleColorPaletteChange = (palette: ColorPalette) => {
    setColorPalette(palette);
    updateColorPalette(palette);
  };

  return (
    <div className="space-y-6">
      {/* Theme Mode Selection */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5 shrink-0 text-primary" />
            {t('settings.appearance.theme')}
          </CardTitle>
          <CardDescription>{t('settings.appearance.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <SelectionCardGroup columns={{ default: 3 }}>
            {THEME_MODES.map((mode) => {
              const isActive = themeMode === mode.id;
              return (
                <SelectionCard
                  key={mode.id}
                  isSelected={isActive}
                  onClick={() => handleThemeModeChange(mode.id as ThemeMode)}
                  disabled={isPending}
                  shape="rounded-2xl"
                  layout="horizontal"
                  gap={3}
                >
                  <SelectionCardIcon isSelected={isActive} size="md">
                    <mode.icon className="h-5 w-5" />
                  </SelectionCardIcon>
                  <div className="text-left">
                    <p className={cn('font-semibold', isActive ? 'text-primary' : 'text-on-surface')}>{t(mode.labelKey)}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{t(mode.descKey)}</p>
                  </div>
                </SelectionCard>
              );
            })}
          </SelectionCardGroup>
        </CardContent>
      </Card>

      {/* Color Palette Selection */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 shrink-0 text-primary" />
            {t('settings.appearance.colorPalette')}
          </CardTitle>
          <CardDescription>{t('settings.appearance.colorDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <SelectionCardGroup columns={{ default: 2, sm: 3, lg: 6 }}>
            {COLOR_PALETTES.map((palette) => {
              const isActive = colorPalette === palette.id;
              return (
                <SelectionCard
                  key={palette.id}
                  isSelected={isActive}
                  onClick={() => handleColorPaletteChange(palette.id as ColorPalette)}
                  disabled={isPending}
                  size="sm"
                  shape="rounded-2xl"
                >
                  {/* Color preview circles */}
                  <div className="flex -space-x-1.5">
                    {palette.colors.map((color, i) => (
                      <div key={i} className="h-7 w-7 rounded-full ring-2 ring-surface" style={{ backgroundColor: color, zIndex: 3 - i }} />
                    ))}
                  </div>
                  <SelectionCardLabel isSelected={isActive} className="text-sm">
                    {t(palette.labelKey)}
                  </SelectionCardLabel>
                </SelectionCard>
              );
            })}
          </SelectionCardGroup>
        </CardContent>
      </Card>
    </div>
  );
}
