import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LANGUAGES, changeLanguage, getCurrentLanguage, type LanguageCode } from '@/i18n';

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export function LanguageSwitcher({ variant = 'default', className }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const currentLang = getCurrentLanguage();
  const currentLangInfo = LANGUAGES.find((l) => l.code === currentLang);

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

  const handleLanguageChange = (langCode: LanguageCode) => {
    changeLanguage(langCode);
    setOpen(false);
  };

  if (variant === 'compact') {
    return (
      <div className={cn('relative', className)}>
        <button
          ref={triggerRef}
          onClick={() => setOpen(!open)}
          className={cn(
            'flex items-center justify-center h-10 w-10 rounded-full',
            'text-on-surface-variant hover:bg-on-surface/8 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
          )}
          aria-label={t('common.changeLanguage')}
          aria-expanded={open}
          aria-haspopup='listbox'
        >
          <Globe className='h-5 w-5' />
        </button>

        {open && (
          <div
            ref={menuRef}
            className={cn(
              'absolute top-full right-0 mt-2 w-48 py-1 rounded-xl z-50',
              'bg-surface-container border-2 border-outline-variant',
              'animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150'
            )}
            role='listbox'
            aria-label={t('common.selectLanguage')}
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={cn(
                  'flex items-center gap-3 w-full px-4 py-2.5 text-left',
                  'hover:bg-on-surface/5 transition-colors',
                  i18n.language === lang.code && 'bg-primary/8'
                )}
                role='option'
                aria-selected={i18n.language === lang.code}
              >
                <span className='text-lg'>{lang.flag}</span>
                <span className='flex-1 text-sm font-medium text-on-surface'>{lang.nativeName}</span>
                {i18n.language === lang.code && <Check className='h-4 w-4 text-primary' />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl',
          'text-on-surface-variant hover:bg-on-surface/8 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          'border border-outline-variant/50'
        )}
        aria-label={t('common.changeLanguage')}
        aria-expanded={open}
        aria-haspopup='listbox'
      >
        <Globe className='h-4 w-4' />
        <span className='text-sm font-medium'>
          {currentLangInfo?.flag} {currentLangInfo?.nativeName}
        </span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          ref={menuRef}
          className={cn(
            'absolute top-full right-0 mt-2 w-48 py-1 rounded-xl z-50',
            'bg-surface-container border-2 border-outline-variant',
            'animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150'
          )}
          role='listbox'
          aria-label={t('common.selectLanguage')}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={cn(
                'flex items-center gap-3 w-full px-4 py-2.5 text-left',
                'hover:bg-on-surface/5 transition-colors',
                i18n.language === lang.code && 'bg-primary/8'
              )}
              role='option'
              aria-selected={i18n.language === lang.code}
            >
              <span className='text-lg'>{lang.flag}</span>
              <span className='flex-1 text-sm font-medium text-on-surface'>{lang.nativeName}</span>
              {i18n.language === lang.code && <Check className='h-4 w-4 text-primary' />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
