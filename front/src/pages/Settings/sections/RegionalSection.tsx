import { useTranslation } from 'react-i18next';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Select,
  SelectionCard,
  SelectionCardLabel,
  SelectionCardDescription,
  SelectionCardGroup,
  SelectionField,
} from '@/components/ui';
import { Globe, Calendar, Clock, Hash } from 'lucide-react';
import { usePreferencesStore, COMMON_TIMEZONES } from '@/stores';
import { useUpdateSinglePreference } from '@/hooks';
import { cn } from '@/lib/utils';
import { LANGUAGES } from '@/i18n';
import type { SupportedLanguage, DateFormatOption, TimeFormatOption, DecimalSeparator, ThousandsSeparator } from '@/types';

// Date format options
const DATE_FORMAT_OPTIONS: { value: DateFormatOption; label: string; example: string }[] = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '12/27/2025' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '27/12/2025' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2025-12-27' },
];

// Time format options
const TIME_FORMAT_OPTIONS: { value: TimeFormatOption; labelKey: string; example: string }[] = [
  { value: '12h', labelKey: 'settings.regional.timeFormats.12h', example: '3:30 PM' },
  { value: '24h', labelKey: 'settings.regional.timeFormats.24h', example: '15:30' },
];

// Number format options
const DECIMAL_OPTIONS: { value: DecimalSeparator; labelKey: string; example: string }[] = [
  { value: 'dot', labelKey: 'settings.regional.decimal.dot', example: '1,234.56' },
  { value: 'comma', labelKey: 'settings.regional.decimal.comma', example: '1.234,56' },
];

const THOUSANDS_OPTIONS: { value: ThousandsSeparator; labelKey: string; example: string }[] = [
  { value: 'comma', labelKey: 'settings.regional.thousands.comma', example: '1,234,567' },
  { value: 'dot', labelKey: 'settings.regional.thousands.dot', example: '1.234.567' },
  { value: 'space', labelKey: 'settings.regional.thousands.space', example: '1 234 567' },
  { value: 'none', labelKey: 'settings.regional.thousands.none', example: '1234567' },
];

// Timezone display helper
const formatTimezone = (tz: string): string => {
  try {
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
    });
    const parts = formatter.formatToParts(new Date());
    const offset = parts.find((p) => p.type === 'timeZoneName')?.value || '';
    return `${tz.replace(/_/g, ' ')} (${offset})`;
  } catch {
    return tz;
  }
};

export function RegionalSection() {
  const { t } = useTranslation();
  const regional = usePreferencesStore((s) => s.preferences.regional);
  const setRegional = usePreferencesStore((s) => s.setRegional);
  const { updateRegional, isPending } = useUpdateSinglePreference();

  const handleLanguageChange = (language: SupportedLanguage) => {
    setRegional({ language });
    updateRegional({ language });
  };

  const handleDateFormatChange = (dateFormat: DateFormatOption) => {
    setRegional({ dateFormat });
    updateRegional({ dateFormat });
  };

  const handleTimeFormatChange = (timeFormat: TimeFormatOption) => {
    setRegional({ timeFormat });
    updateRegional({ timeFormat });
  };

  const handleTimezoneChange = (timezone: string) => {
    setRegional({ timezone });
    updateRegional({ timezone });
  };

  const handleDecimalChange = (decimalSeparator: DecimalSeparator) => {
    setRegional({ decimalSeparator });
    updateRegional({ decimalSeparator });
  };

  const handleThousandsChange = (thousandsSeparator: ThousandsSeparator) => {
    setRegional({ thousandsSeparator });
    updateRegional({ thousandsSeparator });
  };

  return (
    <div className="space-y-6">
      {/* Language Selection */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            {t('settings.regional.language.title')}
          </CardTitle>
          <CardDescription>{t('settings.regional.language.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <SelectionCardGroup columns={{ default: 3 }}>
            {LANGUAGES.map((lang) => {
              const isActive = regional.language === lang.code;
              return (
                <SelectionCard
                  key={lang.code}
                  isSelected={isActive}
                  onClick={() => handleLanguageChange(lang.code as SupportedLanguage)}
                  disabled={isPending}
                  shape="rounded-2xl"
                  layout="horizontal"
                  gap={3}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="text-left">
                    <p className={cn('font-semibold', isActive ? 'text-primary' : 'text-on-surface')}>{lang.nativeName}</p>
                    <p className="text-xs text-on-surface-variant">{lang.name}</p>
                  </div>
                </SelectionCard>
              );
            })}
          </SelectionCardGroup>
        </CardContent>
      </Card>

      {/* Date & Time Formats */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {t('settings.regional.dateTime.title')}
          </CardTitle>
          <CardDescription>{t('settings.regional.dateTime.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date Format */}
          <SelectionField label={t('settings.regional.dateFormat.title')}>
            <SelectionCardGroup columns={{ default: 1, sm: 3 }}>
              {DATE_FORMAT_OPTIONS.map((option) => {
                const isActive = regional.dateFormat === option.value;
                return (
                  <SelectionCard
                    key={option.value}
                    isSelected={isActive}
                    onClick={() => handleDateFormatChange(option.value)}
                    disabled={isPending}
                    size="sm"
                    layout="horizontal"
                    gap={3}
                  >
                    <SelectionCardLabel isSelected={isActive} mono>
                      {option.label}
                    </SelectionCardLabel>
                    <SelectionCardDescription>{option.example}</SelectionCardDescription>
                  </SelectionCard>
                );
              })}
            </SelectionCardGroup>
          </SelectionField>

          {/* Time Format */}
          <SelectionField label={t('settings.regional.timeFormat.title')} withBorder>
            <SelectionCardGroup columns={{ default: 2 }}>
              {TIME_FORMAT_OPTIONS.map((option) => {
                const isActive = regional.timeFormat === option.value;
                return (
                  <SelectionCard
                    key={option.value}
                    isSelected={isActive}
                    onClick={() => handleTimeFormatChange(option.value)}
                    disabled={isPending}
                    layout="horizontal-center"
                    gap={3}
                  >
                    <Clock className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-on-surface-variant')} />
                    <div className="text-left">
                      <SelectionCardLabel isSelected={isActive}>{t(option.labelKey)}</SelectionCardLabel>
                      <span className="ml-2 text-sm text-on-surface-variant">{option.example}</span>
                    </div>
                  </SelectionCard>
                );
              })}
            </SelectionCardGroup>
          </SelectionField>

          {/* Timezone */}
          <SelectionField label={t('settings.regional.timezone.title')} withBorder>
            <Select
              options={COMMON_TIMEZONES.map((tz) => ({
                value: tz,
                label: formatTimezone(tz),
              }))}
              value={regional.timezone}
              onChange={handleTimezoneChange}
              disabled={isPending}
              placeholder={t('settings.regional.timezone.placeholder')}
              searchable
            />
            <p className="text-xs text-on-surface-variant">{t('settings.regional.timezone.helper')}</p>
          </SelectionField>
        </CardContent>
      </Card>

      {/* Number Formats */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-primary" />
            {t('settings.regional.numbers.title')}
          </CardTitle>
          <CardDescription>{t('settings.regional.numbers.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Decimal Separator */}
          <SelectionField label={t('settings.regional.decimal.title')}>
            <SelectionCardGroup columns={{ default: 2 }}>
              {DECIMAL_OPTIONS.map((option) => {
                const isActive = regional.decimalSeparator === option.value;
                return (
                  <SelectionCard
                    key={option.value}
                    isSelected={isActive}
                    onClick={() => handleDecimalChange(option.value)}
                    disabled={isPending}
                    size="sm"
                    layout="horizontal"
                    gap={3}
                  >
                    <SelectionCardLabel isSelected={isActive}>{t(option.labelKey)}</SelectionCardLabel>
                    <SelectionCardDescription mono>{option.example}</SelectionCardDescription>
                  </SelectionCard>
                );
              })}
            </SelectionCardGroup>
          </SelectionField>

          {/* Thousands Separator */}
          <SelectionField label={t('settings.regional.thousands.title')} withBorder>
            <SelectionCardGroup columns={{ default: 2, sm: 4 }}>
              {THOUSANDS_OPTIONS.map((option) => {
                const isActive = regional.thousandsSeparator === option.value;
                return (
                  <SelectionCard
                    key={option.value}
                    isSelected={isActive}
                    onClick={() => handleThousandsChange(option.value)}
                    disabled={isPending}
                    size="sm"
                    layout="horizontal"
                    gap={3}
                  >
                    <SelectionCardLabel isSelected={isActive} className="text-sm">
                      {t(option.labelKey)}
                    </SelectionCardLabel>
                    <SelectionCardDescription mono>{option.example}</SelectionCardDescription>
                  </SelectionCard>
                );
              })}
            </SelectionCardGroup>
          </SelectionField>
        </CardContent>
      </Card>
    </div>
  );
}
