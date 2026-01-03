// Preview Language Switcher - Simple language selector for survey preview
// Allows previewing the survey in different available languages

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui';
import { getLanguageInfo } from '@/config/languages';

interface PreviewLanguageSwitcherProps {
  /** Currently selected preview language */
  currentLanguage: string;
  /** List of available language codes */
  availableLanguages: string[];
  /** Default language of the survey */
  defaultLanguage: string;
  /** Callback when language is selected */
  onLanguageChange: (languageCode: string) => void;
  /** Additional CSS classes */
  className?: string;
}

export function PreviewLanguageSwitcher({
  currentLanguage,
  availableLanguages,
  defaultLanguage,
  onLanguageChange,
  className,
}: PreviewLanguageSwitcherProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const currentLangInfo = getLanguageInfo(currentLanguage);

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
    onLanguageChange(langCode);
    setOpen(false);
  };

  // Don't show if only one language
  if (availableLanguages.length <= 1) {
    return null;
  }

  return (
    <div className={cn('relative', className)}>
      <Tooltip content={t('surveyPreview.switchPreviewLanguage', 'Switch preview language')}>
        <button
          ref={triggerRef}
          onClick={() => setOpen(!open)}
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-full',
            'text-on-surface-variant hover:bg-surface-container-high transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            'border border-outline-variant/30 text-xs font-medium'
          )}
          aria-label={t('surveyPreview.switchPreviewLanguage', 'Switch preview language')}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <Globe className="h-3.5 w-3.5 shrink-0" />
          <span>{currentLangInfo.flag}</span>
          <span className="hidden sm:inline">{currentLangInfo.nativeName}</span>
          <ChevronDown className={cn('h-3 w-3 shrink-0 transition-transform', open && 'rotate-180')} />
        </button>
      </Tooltip>

      {open && (
        <div
          ref={menuRef}
          className={cn(
            'absolute top-full right-0 mt-1 w-48 py-1 rounded-xl z-50',
            'bg-surface-container border border-outline-variant/40',
            'animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150'
          )}
          role="listbox"
          aria-label={t('surveyPreview.selectLanguage', 'Select language')}
        >
          {/* Header */}
          <div className="px-3 py-1.5 border-b border-outline-variant/30">
            <p className="text-xs font-medium text-on-surface-variant">{t('surveyPreview.previewLanguage', 'Preview Language')}</p>
          </div>

          {/* Language List */}
          <div className="py-1 max-h-48 overflow-y-auto">
            {availableLanguages.map((langCode) => {
              const langInfo = getLanguageInfo(langCode);
              const isSelected = langCode === currentLanguage;
              const isDefault = langCode === defaultLanguage;

              return (
                <button
                  key={langCode}
                  onClick={() => handleLanguageSelect(langCode)}
                  className={cn(
                    'flex items-center gap-2 w-full px-3 py-2 text-left text-sm',
                    'hover:bg-on-surface/5 transition-colors',
                    isSelected && 'bg-primary/8'
                  )}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="text-base">{langInfo.flag}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-on-surface truncate">{langInfo.nativeName}</span>
                    {isDefault && (
                      <span className="ml-1.5 text-[10px] font-medium text-primary bg-primary/10 px-1 py-0.5 rounded">
                        {t('localization.default', 'Default')}
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
