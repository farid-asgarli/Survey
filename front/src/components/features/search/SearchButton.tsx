// SearchButton - Trigger button for global search

import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useSearchStore } from '@/stores/searchStore';
import { formatShortcutKeys } from '@/stores/shortcutsStore';
import { Search } from 'lucide-react';

interface SearchButtonProps {
  className?: string;
  variant?: 'full' | 'compact' | 'icon';
}

export function SearchButton({ className, variant = 'full' }: SearchButtonProps) {
  const { t } = useTranslation();
  const { openSearch } = useSearchStore();

  if (variant === 'icon') {
    return (
      <button
        onClick={openSearch}
        className={cn(
          'p-2.5 rounded-full',
          'hover:bg-surface-container-high transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
          className
        )}
        aria-label={t('a11y.search')}
      >
        <Search className="h-5 w-5 text-on-surface-variant" />
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={openSearch}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl',
          'bg-surface-container hover:bg-surface-container-high',
          'text-on-surface-variant transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
          className
        )}
        aria-label={t('a11y.search')}
      >
        <Search className="h-4 w-4" />
        <span className="text-sm">{t('common.search')}</span>
        <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-surface-container-high text-xs font-mono ml-1">
          {formatShortcutKeys(['Mod', 'K'])}
        </kbd>
      </button>
    );
  }

  // Full variant (default)
  return (
    <button
      onClick={openSearch}
      className={cn(
        'flex items-center gap-3 w-full max-w-md px-4 py-2.5 rounded-2xl',
        'bg-surface-container hover:bg-surface-container-high',
        'border border-outline-variant/30 hover:border-outline-variant/50',
        'text-on-surface-variant transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
        'group',
        className
      )}
      aria-label={t('a11y.search')}
    >
      <Search className="h-5 w-5 shrink-0 group-hover:text-on-surface transition-colors" />
      <span className="flex-1 text-left text-sm">Search surveys, templates...</span>
      <kbd className="hidden sm:inline-flex px-2 py-1 rounded-lg bg-surface-container-high text-xs font-mono">{formatShortcutKeys(['Mod', 'K'])}</kbd>
    </button>
  );
}
