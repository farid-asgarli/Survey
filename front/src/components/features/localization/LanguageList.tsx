// Language List - Shows all languages for a survey with status and actions
//
// Displays:
// - Language name with flag
// - Translation progress bar
// - Actions: Edit, Enable/Disable, Delete
// - Set as default option

import { useTranslation } from 'react-i18next';
import { Globe, Check, Trash2, Crown, Eye, EyeOff, MoreHorizontal, Pencil, AlertCircle, FileText, MessageSquare } from 'lucide-react';
import { Button, Menu, MenuItem, MenuSeparator, Tooltip } from '@/components/ui';
import { cn } from '@/lib/utils';
import { LANGUAGE_INFO } from './SurveyLanguageSwitcher';

export interface LanguageStats {
  code: string;
  isDefault: boolean;
  isEnabled?: boolean;
  surveyFieldsTotal: number;
  surveyFieldsTranslated: number;
  questionsTotal: number;
  questionsTranslated: number;
}

interface LanguageListProps {
  /** List of languages with their statistics */
  languages: LanguageStats[];
  /** Currently selected language for editing */
  selectedLanguage?: string;
  /** Whether the component is in read-only mode */
  isReadOnly?: boolean;
  /** Callback when a language is selected for editing */
  onSelect: (languageCode: string) => void;
  /** Callback when delete is requested */
  onDelete: (languageCode: string) => void;
  /** Callback to toggle language visibility */
  onToggleEnabled?: (languageCode: string, enabled: boolean) => void;
  /** Callback to set as default language */
  onSetDefault?: (languageCode: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get display info for a language code
 */
function getLanguageInfo(code: string) {
  return (
    LANGUAGE_INFO[code] || {
      name: code.toUpperCase(),
      nativeName: code.toUpperCase(),
      flag: '🌐',
    }
  );
}

/**
 * Convert country code to flag emoji using regional indicator symbols
 * This is more reliable than storing emoji strings which may not render on all fonts
 */
function countryCodeToFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

/**
 * Get country code from language code for flag display
 */
function getCountryCode(languageCode: string): string {
  const mapping: Record<string, string> = {
    en: 'GB',
    es: 'ES',
    fr: 'FR',
    de: 'DE',
    it: 'IT',
    pt: 'PT',
    nl: 'NL',
    pl: 'PL',
    ru: 'RU',
    az: 'AZ',
    zh: 'CN',
    ja: 'JP',
    ko: 'KR',
    ar: 'SA',
    hi: 'IN',
    tr: 'TR',
  };
  return mapping[languageCode] || languageCode.toUpperCase();
}

/**
 * Calculate overall completion percentage
 */
function getCompletionPercent(stats: LanguageStats): number {
  const total = stats.surveyFieldsTotal + stats.questionsTotal;
  const translated = stats.surveyFieldsTranslated + stats.questionsTranslated;
  if (total === 0) return 100;
  return Math.round((translated / total) * 100);
}

/**
 * Get status color based on completion percentage
 */
function getProgressColor(percent: number): string {
  if (percent === 100) return 'bg-success';
  if (percent >= 75) return 'bg-primary';
  if (percent >= 50) return 'bg-warning';
  if (percent > 0) return 'bg-warning';
  return 'bg-error';
}

/**
 * Single language item in the list
 */
function LanguageItem({
  stats,
  isSelected,
  isReadOnly,
  onSelect,
  onDelete,
  onToggleEnabled,
  onSetDefault,
}: {
  stats: LanguageStats;
  isSelected: boolean;
  isReadOnly: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onToggleEnabled?: (enabled: boolean) => void;
  onSetDefault?: () => void;
}) {
  const { t } = useTranslation();
  const langInfo = getLanguageInfo(stats.code);
  const percent = getCompletionPercent(stats);
  const isEnabled = stats.isEnabled !== false;

  // Calculate missing translations
  const missingFields = stats.surveyFieldsTotal - stats.surveyFieldsTranslated;
  const missingQuestions = stats.questionsTotal - stats.questionsTranslated;
  const hasMissing = missingFields > 0 || missingQuestions > 0;

  return (
    <div
      className={cn(
        // M3 Expressive: Dynamic shape morphing (24px → 36px → 48px)
        'group relative rounded-2xl border-2 transition-[border-radius,border-color,background-color] duration-300 ease-[cubic-bezier(0.2,0,0,1)]',
        'hover:rounded-[36px]',
        // Color based on selection state
        isSelected
          ? 'border-primary bg-primary-container/15 ring-2 ring-primary/20'
          : 'border-outline-variant/40 bg-surface-container-lowest hover:border-primary/30 hover:bg-surface-container',
        !isEnabled && 'opacity-50'
      )}
    >
      {/* Main content - clickable for selection */}
      <button
        onClick={onSelect}
        className="w-full text-left p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 rounded-2xl transition-[border-radius] duration-300 group-hover:rounded-[36px]"
      >
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {/* Flag with container - use generated emoji for better compatibility */}
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-surface-container-high border border-outline-variant/20">
              <span className="text-2xl flex items-center justify-center" role="img" aria-label={langInfo.name}>
                {countryCodeToFlag(getCountryCode(stats.code))}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-semibold text-on-surface text-base">{langInfo.nativeName}</span>
                {stats.isDefault && (
                  <Tooltip content={t('localization.defaultLanguage', 'Default language')}>
                    <span className="inline-flex items-center gap-1.5 h-6 px-2.5 text-xs font-semibold bg-primary-container/60 text-on-primary-container rounded-full">
                      <Crown className="w-3 h-3" />
                      {t('localization.default', 'Default')}
                    </span>
                  </Tooltip>
                )}
                {!isEnabled && (
                  <span className="inline-flex items-center gap-1.5 h-6 px-2.5 text-xs font-semibold bg-secondary-container/60 text-on-secondary-container rounded-full">
                    <EyeOff className="w-3 h-3" />
                    {t('localization.disabled', 'Disabled')}
                  </span>
                )}
              </div>
              <span className="text-sm text-on-surface-variant mt-0.5 block">
                {langInfo.name} • {stats.code.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Completion percentage with visual indicator */}
          <div className="flex items-center gap-3">
            {stats.isDefault ? (
              <span className="inline-flex items-center gap-1.5 h-8 px-4 text-sm font-semibold bg-success-container/60 text-on-success-container rounded-full">
                <Check className="w-4 h-4" />
                {t('localization.source', 'Source')}
              </span>
            ) : (
              <span
                className={cn(
                  'inline-flex items-center justify-center h-8 min-w-14 px-3 text-sm font-semibold rounded-full',
                  percent === 100
                    ? 'bg-success-container/60 text-on-success-container'
                    : percent >= 50
                    ? 'bg-warning-container/60 text-on-warning-container'
                    : 'bg-error-container/60 text-on-error-container'
                )}
              >
                {percent}%
              </span>
            )}
          </div>
        </div>

        {/* Progress bar - only for non-default languages */}
        {!stats.isDefault && (
          <div className="space-y-3 mt-1">
            {/* Progress bar with M3 styling */}
            <div className="h-2 bg-outline-variant/20 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-500 ease-out', getProgressColor(percent))}
                style={{ width: `${percent}%` }}
              />
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                <Tooltip content={t('localization.surveyFieldsTooltip', 'Survey title, description, messages')}>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface-container-high/50 cursor-help">
                    <FileText className="w-3.5 h-3.5" />
                    <span className="font-medium">
                      {stats.surveyFieldsTranslated}/{stats.surveyFieldsTotal}
                    </span>
                    <span className="text-on-surface-variant/70">{t('localization.fieldsLabel', 'fields')}</span>
                  </span>
                </Tooltip>
                <Tooltip content={t('localization.questionsTooltip', 'Question text and options')}>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface-container-high/50 cursor-help">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="font-medium">
                      {stats.questionsTranslated}/{stats.questionsTotal}
                    </span>
                    <span className="text-on-surface-variant/70">{t('localization.questionsLabel', 'questions')}</span>
                  </span>
                </Tooltip>
              </div>

              {/* Missing translations hint */}
              {hasMissing && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-warning bg-warning-container/40 rounded-full">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{t('localization.needsWork', 'Needs work')}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </button>

      {/* Action menu - only in edit mode */}
      {!isReadOnly && !stats.isDefault && (
        <div className="absolute top-4 right-4">
          <Menu
            trigger={
              <Button variant="tonal" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-full h-9 w-9">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            }
            align="end"
          >
            <MenuItem icon={<Pencil className="w-4 h-4" />} onClick={onSelect}>
              {t('localization.editTranslations', 'Edit Translations')}
            </MenuItem>

            {onToggleEnabled && (
              <MenuItem icon={isEnabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} onClick={() => onToggleEnabled(!isEnabled)}>
                {isEnabled ? t('localization.disable', 'Disable') : t('localization.enable', 'Enable')}
              </MenuItem>
            )}

            {onSetDefault && (
              <MenuItem icon={<Crown className="w-4 h-4" />} onClick={onSetDefault}>
                {t('localization.setAsDefault', 'Set as Default')}
              </MenuItem>
            )}

            <MenuSeparator />

            <MenuItem icon={<Trash2 className="w-4 h-4" />} onClick={onDelete} destructive>
              {t('common.delete', 'Delete')}
            </MenuItem>
          </Menu>
        </div>
      )}
    </div>
  );
}

export function LanguageList({
  languages,
  selectedLanguage,
  isReadOnly = false,
  onSelect,
  onDelete,
  onToggleEnabled,
  onSetDefault,
  className,
}: LanguageListProps) {
  const { t } = useTranslation();

  // Sort languages: default first, then by name
  const sortedLanguages = [...languages].sort((a, b) => {
    if (a.isDefault) return -1;
    if (b.isDefault) return 1;
    return getLanguageInfo(a.code).name.localeCompare(getLanguageInfo(b.code).name);
  });

  if (languages.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <Globe className="w-12 h-12 mx-auto text-on-surface-variant/30 mb-4" />
        <p className="text-on-surface-variant">{t('localization.noLanguages', 'No languages configured')}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {sortedLanguages.map((stats) => (
        <LanguageItem
          key={stats.code}
          stats={stats}
          isSelected={selectedLanguage === stats.code}
          isReadOnly={isReadOnly}
          onSelect={() => onSelect(stats.code)}
          onDelete={() => onDelete(stats.code)}
          onToggleEnabled={onToggleEnabled ? (enabled) => onToggleEnabled(stats.code, enabled) : undefined}
          onSetDefault={onSetDefault ? () => onSetDefault(stats.code) : undefined}
        />
      ))}
    </div>
  );
}

export { LANGUAGE_INFO };
