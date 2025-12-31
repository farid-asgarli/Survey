// Survey Language Switcher - Language management for survey builder
// Allows switching between available survey languages and adding new ones

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown, Plus, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui';

// Language metadata for display
const LANGUAGE_INFO: Record<string, { name: string; nativeName: string; flag: string }> = {
  en: { name: 'English', nativeName: 'English', flag: '🇬🇧' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  it: { name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  pt: { name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  nl: { name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  pl: { name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  ru: { name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  az: { name: 'Azerbaijani', nativeName: 'Azərbaycan', flag: '🇦🇿' },
  zh: { name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  ja: { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  ko: { name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  ar: { name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  tr: { name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
};

export interface LanguageStatus {
  code: string;
  isDefault: boolean;
  /** Completion percentage (0-100) */
  completionPercent?: number;
}

interface SurveyLanguageSwitcherProps {
  /** Currently selected language for editing */
  currentLanguage: string;
  /** List of available languages with their status */
  availableLanguages: LanguageStatus[];
  /** Callback when language is selected */
  onLanguageSelect: (languageCode: string) => void;
  /** Callback when "Add Language" is clicked */
  onAddLanguage: () => void;
  /** Callback to open language management panel */
  onManageLanguages?: () => void;
  /** Whether the survey is in read-only mode */
  isReadOnly?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Get display info for a language code
 */
function getLanguageInfo(code: string) {
  return LANGUAGE_INFO[code] || { name: code.toUpperCase(), nativeName: code.toUpperCase(), flag: '🌐' };
}

/**
 * Get status color based on completion percentage
 */
function getStatusColor(percent?: number): string {
  if (percent === undefined || percent === 100) return 'text-success';
  if (percent >= 50) return 'text-warning';
  if (percent > 0) return 'text-warning-dark';
  return 'text-error';
}

export function SurveyLanguageSwitcher({
  currentLanguage,
  availableLanguages,
  onLanguageSelect,
  onAddLanguage,
  onManageLanguages,
  isReadOnly = false,
  className,
}: SurveyLanguageSwitcherProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const currentLangInfo = getLanguageInfo(currentLanguage);
  const currentStatus = availableLanguages.find((l) => l.code === currentLanguage);

  // Close on click outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Close on escape key
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open]);

  const handleLanguageSelect = (langCode: string) => {
    onLanguageSelect(langCode);
    setOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <Tooltip content={t('localization.switchLanguage', 'Switch editing language')}>
        <button
          ref={triggerRef}
          onClick={() => setOpen(!open)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg',
            'text-on-surface-variant hover:bg-surface-container transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            'border border-outline-variant/50'
          )}
          aria-label={t('localization.switchLanguage', 'Switch editing language')}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <Languages className="h-4 w-4" />
          <span className="text-sm font-medium">
            {currentLangInfo.flag} {currentLangInfo.nativeName}
          </span>
          {currentStatus?.isDefault && (
            <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">{t('localization.default', 'Default')}</span>
          )}
          <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
        </button>
      </Tooltip>

      {open && (
        <div
          ref={menuRef}
          className={cn(
            'absolute top-full left-0 mt-2 w-64 py-1 rounded-xl z-50',
            'bg-surface-container border-2 border-outline-variant',
            'shadow-elevation-2 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150'
          )}
          role="listbox"
          aria-label={t('localization.selectLanguage', 'Select language')}
        >
          {/* Header */}
          <div className="px-4 py-2 border-b border-outline-variant/30">
            <div className="flex items-center gap-2 text-sm font-medium text-on-surface">
              <Globe className="h-4 w-4" />
              {t('localization.surveyLanguages', 'Survey Languages')}
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {t('localization.languageCount', '{{count}} language(s)', { count: availableLanguages.length })}
            </p>
          </div>

          {/* Language List */}
          <div className="py-1 max-h-64 overflow-y-auto">
            {availableLanguages.map((lang) => {
              const langInfo = getLanguageInfo(lang.code);
              const isSelected = lang.code === currentLanguage;
              const completionPercent = lang.completionPercent;

              return (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageSelect(lang.code)}
                  className={cn(
                    'flex items-center gap-3 w-full px-4 py-2.5 text-left',
                    'hover:bg-on-surface/5 transition-colors',
                    isSelected && 'bg-primary/8'
                  )}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="text-lg">{langInfo.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-on-surface truncate">{langInfo.nativeName}</span>
                      {lang.isDefault && (
                        <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                          {t('localization.default', 'Default')}
                        </span>
                      )}
                    </div>
                    {/* Completion indicator */}
                    {completionPercent !== undefined && completionPercent < 100 && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 bg-outline-variant/30 rounded-full overflow-hidden">
                          <div
                            className={cn('h-full rounded-full transition-all', getStatusColor(completionPercent).replace('text-', 'bg-'))}
                            style={{ width: `${completionPercent}%` }}
                          />
                        </div>
                        <span className={cn('text-[10px] font-medium', getStatusColor(completionPercent))}>{completionPercent}%</span>
                      </div>
                    )}
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Actions */}
          {!isReadOnly && (
            <div className="border-t border-outline-variant/30 py-1">
              <button
                onClick={() => {
                  setOpen(false);
                  onAddLanguage();
                }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-on-surface/5 transition-colors"
              >
                <Plus className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">{t('localization.addLanguage', 'Add Language')}</span>
              </button>
              {onManageLanguages && (
                <button
                  onClick={() => {
                    setOpen(false);
                    onManageLanguages();
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-on-surface/5 transition-colors"
                >
                  <Globe className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">{t('localization.editTranslation', 'Edit Translation...')}</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { LANGUAGE_INFO };
