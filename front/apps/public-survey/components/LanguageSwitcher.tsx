/**
 * Language Switcher - Allows users to switch survey language
 * Only displays when survey has multiple available languages
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { cn } from '@survey/ui-primitives';

// Language display names (native names for better recognition)
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  ru: 'Русский',
  az: 'Azərbaycan',
  tr: 'Türkçe',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
  pt: 'Português',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  ar: 'العربية',
  hi: 'हिन्दी',
  uk: 'Українська',
  pl: 'Polski',
  nl: 'Nederlands',
  sv: 'Svenska',
  da: 'Dansk',
  fi: 'Suomi',
  no: 'Norsk',
  cs: 'Čeština',
  sk: 'Slovenčina',
  ro: 'Română',
  hu: 'Magyar',
  bg: 'Български',
  el: 'Ελληνικά',
  he: 'עברית',
  th: 'ไทย',
  vi: 'Tiếng Việt',
  id: 'Bahasa Indonesia',
  ms: 'Bahasa Melayu',
};

// Get language display name, fallback to uppercase code
function getLanguageName(code: string): string {
  return LANGUAGE_NAMES[code.toLowerCase()] || code.toUpperCase();
}

interface LanguageSwitcherProps {
  currentLanguage: string;
  availableLanguages: string[];
  className?: string;
}

export function LanguageSwitcher({ currentLanguage, availableLanguages, className }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // Don't render if only one language available (after all hooks)
  if (availableLanguages.length <= 1) {
    return null;
  }

  const handleLanguageChange = (langCode: string) => {
    if (langCode === currentLanguage) {
      setIsOpen(false);
      return;
    }

    // Build new URL with updated lang parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set('lang', langCode);

    // Navigate to new URL (this will trigger a server-side re-fetch with new language)
    router.push(`${pathname}?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center gap-2 px-3 py-2 rounded-full',
          'bg-surface-container-high/80 hover:bg-surface-container-highest/90',
          'border border-outline-variant/30 hover:border-outline-variant/50',
          'text-sm font-medium text-on-surface-variant',
          'transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          isOpen && 'bg-surface-container-highest border-outline-variant/50'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select language"
      >
        <Globe className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline">{getLanguageName(currentLanguage)}</span>
        <span className="sm:hidden">{currentLanguage.toUpperCase()}</span>
        <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', isOpen && 'rotate-180')} aria-hidden="true" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute right-0 mt-2 min-w-40 py-1',
            'bg-surface-container rounded-xl shadow-lg',
            'border border-outline-variant/30',
            'z-50 animate-in fade-in-0 zoom-in-95 duration-150'
          )}
          role="listbox"
          aria-label="Available languages"
        >
          {availableLanguages.map((langCode) => {
            const isSelected = langCode === currentLanguage;
            return (
              <button
                key={langCode}
                type="button"
                onClick={() => handleLanguageChange(langCode)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-left',
                  'text-sm font-medium transition-colors duration-150',
                  isSelected ? 'bg-primary-container/50 text-on-primary-container' : 'text-on-surface hover:bg-surface-container-high'
                )}
                role="option"
                aria-selected={isSelected}
              >
                <span className="flex-1">{getLanguageName(langCode)}</span>
                {isSelected && <Check className="w-4 h-4 text-primary" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
