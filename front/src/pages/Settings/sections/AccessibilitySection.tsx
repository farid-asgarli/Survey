import { useTranslation } from 'react-i18next';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Switch,
  SelectionCard,
  SelectionCardLabel,
  SelectionCardDescription,
  SelectionCardGroup,
  SelectionField,
} from '@/components/ui';
import { Eye, ZapOff, Monitor, Type } from 'lucide-react';
import { usePreferencesStore, FONT_SIZE_SCALES } from '@/stores';
import { useUpdateSinglePreference } from '@/hooks';
import { cn } from '@/lib/utils';
import type { FontSizeScale } from '@/types';

const FONT_SIZE_OPTIONS: { value: FontSizeScale; labelKey: string; preview: string }[] = [
  { value: 'small', labelKey: 'settings.accessibility.fontSizes.small', preview: '14px' },
  { value: 'medium', labelKey: 'settings.accessibility.fontSizes.medium', preview: '16px' },
  { value: 'large', labelKey: 'settings.accessibility.fontSizes.large', preview: '18px' },
  { value: 'extra-large', labelKey: 'settings.accessibility.fontSizes.extraLarge', preview: '20px' },
];

export function AccessibilitySection() {
  const { t } = useTranslation();
  const accessibility = usePreferencesStore((s) => s.preferences.accessibility);
  const setAccessibility = usePreferencesStore((s) => s.setAccessibility);
  const { updateAccessibility, isPending } = useUpdateSinglePreference();

  const handleToggle = (key: keyof typeof accessibility) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setAccessibility({ [key]: newValue });
    updateAccessibility({ [key]: newValue });
  };

  const handleFontSizeChange = (value: FontSizeScale) => {
    setAccessibility({ fontSizeScale: value });
    updateAccessibility({ fontSizeScale: value });
  };

  return (
    <div className="space-y-6">
      {/* Visual Settings */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            {t('settings.accessibility.visual.title')}
          </CardTitle>
          <CardDescription>{t('settings.accessibility.visual.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="py-3 border-b border-outline-variant/20">
            <Switch
              label={t('settings.accessibility.highContrast.title')}
              description={t('settings.accessibility.highContrast.description')}
              checked={accessibility.highContrastMode}
              onChange={handleToggle('highContrastMode')}
              disabled={isPending}
            />
          </div>
          <div className="py-3">
            <Switch
              label={t('settings.accessibility.screenReader.title')}
              description={t('settings.accessibility.screenReader.description')}
              checked={accessibility.screenReaderOptimized}
              onChange={handleToggle('screenReaderOptimized')}
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Motion Settings */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ZapOff className="h-5 w-5 text-primary" />
            {t('settings.accessibility.motion.title')}
          </CardTitle>
          <CardDescription>{t('settings.accessibility.motion.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Switch
            label={t('settings.accessibility.reducedMotion.title')}
            description={t('settings.accessibility.reducedMotion.description')}
            checked={accessibility.reducedMotion}
            onChange={handleToggle('reducedMotion')}
            disabled={isPending}
          />
        </CardContent>
      </Card>

      {/* Font Settings */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5 text-primary" />
            {t('settings.accessibility.font.title')}
          </CardTitle>
          <CardDescription>{t('settings.accessibility.font.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Font Size Scale */}
          <SelectionField label={t('settings.accessibility.fontSize.title')}>
            <SelectionCardGroup columns={{ default: 2, sm: 4 }}>
              {FONT_SIZE_OPTIONS.map((option) => {
                const isActive = accessibility.fontSizeScale === option.value;
                const scale = FONT_SIZE_SCALES[option.value];
                return (
                  <SelectionCard
                    key={option.value}
                    isSelected={isActive}
                    onClick={() => handleFontSizeChange(option.value)}
                    disabled={isPending}
                    shape="rounded-2xl"
                  >
                    <span className={cn('font-semibold text-on-surface', isActive && 'text-primary')} style={{ fontSize: `${scale}rem` }}>
                      Aa
                    </span>
                    <div className="text-center">
                      <SelectionCardLabel isSelected={isActive} className="text-sm">
                        {t(option.labelKey)}
                      </SelectionCardLabel>
                      <SelectionCardDescription>{option.preview}</SelectionCardDescription>
                    </div>
                  </SelectionCard>
                );
              })}
            </SelectionCardGroup>
          </SelectionField>

          {/* Dyslexia-friendly Font */}
          <div className="pt-5 border-t border-outline-variant/20">
            <Switch
              label={t('settings.accessibility.dyslexiaFont.title')}
              description={t('settings.accessibility.dyslexiaFont.description')}
              checked={accessibility.dyslexiaFriendlyFont}
              onChange={handleToggle('dyslexiaFriendlyFont')}
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card variant="filled" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-info" />
            {t('settings.accessibility.preview.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              'p-4 rounded-xl bg-surface border border-outline-variant/30',
              accessibility.highContrastMode && 'border-2 border-on-surface',
              accessibility.dyslexiaFriendlyFont && 'font-dyslexia'
            )}
            style={{
              fontSize: `${FONT_SIZE_SCALES[accessibility.fontSizeScale]}rem`,
            }}
          >
            <h4 className="font-semibold text-on-surface mb-2">{t('settings.accessibility.preview.sampleTitle')}</h4>
            <p className="text-on-surface-variant">{t('settings.accessibility.preview.sampleText')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
