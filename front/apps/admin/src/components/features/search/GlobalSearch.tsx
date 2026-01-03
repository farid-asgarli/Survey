// GlobalSearch - Command palette style search dialog

import { useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { IconButton } from '@/components/ui';
import { useViewTransitionNavigate } from '@/hooks';
import { useSearchStore, type SearchResult, type RecentItem } from '@/stores/searchStore';
import { useGlobalSearch } from '@/hooks/queries/useSearch';
import { formatShortcutKeys } from '@/stores/shortcutsStore';
import { getSearchTypeIcon, getSearchTypeLabel, getSearchTypeColors } from '@/config';
import { Search, Clock, ArrowRight, X, CornerDownLeft, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';

interface SearchItemProps {
  item: SearchResult | RecentItem;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  isRecent?: boolean;
}

function SearchItem({ item, isSelected, onClick, onMouseEnter, isRecent = false }: SearchItemProps) {
  const Icon = getSearchTypeIcon(item.type);
  const typeLabel = getSearchTypeLabel(item.type);
  const colorClasses = getSearchTypeColors(item.type);

  return (
    <button
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150',
        'rounded-xl group',
        isSelected ? 'bg-primary-container text-on-primary-container' : 'hover:bg-surface-container-high text-on-surface'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
          isSelected ? 'bg-primary/20' : colorClasses
        )}
      >
        {isRecent ? <Clock className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{item.title}</span>
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full shrink-0',
              isSelected ? 'bg-primary/20 text-on-primary-container' : 'bg-surface-container-high text-on-surface-variant'
            )}
          >
            {typeLabel}
          </span>
        </div>
        {'description' in item && item.description && (
          <p className={cn('text-sm truncate mt-0.5', isSelected ? 'text-on-primary-container/70' : 'text-on-surface-variant')}>{item.description}</p>
        )}
      </div>

      {/* Arrow indicator */}
      <ArrowRight
        className={cn('h-4 w-4 shrink-0 transition-all duration-150', isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2')}
      />
    </button>
  );
}

export function GlobalSearch() {
  const { t } = useTranslation();
  const navigate = useViewTransitionNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const {
    isSearchOpen,
    searchQuery,
    selectedIndex,
    recentItems,
    closeSearch,
    setSearchQuery,
    setSelectedIndex,
    moveSelectionUp,
    moveSelectionDown,
    addRecentItem,
  } = useSearchStore();

  // Search query with debounce
  const { data: searchResults = [], isLoading } = useGlobalSearch({ query: searchQuery, limit: 10 }, { enabled: searchQuery.length >= 2 });

  // Items to display (search results or recent items)
  const displayItems = searchQuery.length >= 2 ? searchResults : recentItems;

  // Focus input when dialog opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Reset selection when items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery, setSelectedIndex]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.querySelector('[data-selected="true"]');
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  const handleSelect = useCallback(
    (item: SearchResult | RecentItem) => {
      // Add to recent items
      addRecentItem({
        id: item.id,
        type: item.type,
        title: item.title,
        url: item.url,
      });
      // Navigate and close
      navigate(item.url);
      closeSearch();
    },
    [navigate, closeSearch, addRecentItem]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          moveSelectionDown();
          break;
        case 'ArrowUp':
          e.preventDefault();
          moveSelectionUp();
          break;
        case 'Enter':
          e.preventDefault();
          if (displayItems[selectedIndex]) {
            handleSelect(displayItems[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          closeSearch();
          break;
      }
    },
    [moveSelectionDown, moveSelectionUp, selectedIndex, displayItems, handleSelect, closeSearch]
  );

  if (!isSearchOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-100" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-scrim/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeSearch} />

      {/* Dialog */}
      <div className="absolute inset-x-4 top-[10%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl">
        <div
          className={cn(
            'bg-surface-container-low rounded-3xl shadow-xl overflow-hidden',
            'border border-outline-variant/20',
            'animate-in slide-in-from-top-4 fade-in duration-300'
          )}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-outline-variant/20">
            <Search className="h-5 w-5 text-on-surface-variant shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('search.placeholder')}
              className={cn('flex-1 bg-transparent text-on-surface placeholder:text-on-surface-variant/50', 'text-lg font-medium focus:outline-none')}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {isLoading && <Loader2 className="h-5 w-5 text-on-surface-variant animate-spin" />}
            <IconButton variant="ghost" size="sm" onClick={closeSearch} aria-label={t('a11y.closeSearch')}>
              <X className="h-5 w-5" />
            </IconButton>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-2 px-2">
            {/* Section header */}
            {displayItems.length > 0 && (
              <div className="px-3 py-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                {searchQuery.length >= 2 ? t('search.results') : t('search.recent')}
              </div>
            )}

            {/* Items */}
            {displayItems.map((item, index) => (
              <div key={item.id} data-selected={index === selectedIndex}>
                <SearchItem
                  item={item}
                  isSelected={index === selectedIndex}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  isRecent={!searchQuery}
                />
              </div>
            ))}

            {/* Empty state */}
            {displayItems.length === 0 && searchQuery.length >= 2 && !isLoading && (
              <div className="px-4 py-12 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container mb-4">
                  <Search className="h-8 w-8 text-on-surface-variant/50" />
                </div>
                <p className="text-on-surface font-medium">{t('search.noResults')}</p>
                <p className="text-on-surface-variant text-sm mt-1">{t('search.tryDifferentKeywords')}</p>
              </div>
            )}

            {/* Empty recent items */}
            {displayItems.length === 0 && searchQuery.length < 2 && (
              <div className="px-4 py-12 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container mb-4">
                  <Clock className="h-8 w-8 text-on-surface-variant/50" />
                </div>
                <p className="text-on-surface font-medium">{t('search.noRecentItems')}</p>
                <p className="text-on-surface-variant text-sm mt-1">{t('search.startTyping')}</p>
              </div>
            )}
          </div>

          {/* Footer with keyboard hints */}
          <div className="flex items-center gap-4 px-4 py-3 border-t border-outline-variant/20 bg-surface-container/50">
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-container-high font-mono">
                <CornerDownLeft className="h-3 w-3 inline" />
              </kbd>
              <span>{t('search.toSelect')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-container-high font-mono">
                <ChevronUp className="h-3 w-3 inline" />
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-container-high font-mono">
                <ChevronDown className="h-3 w-3 inline" />
              </kbd>
              <span>{t('search.toNavigate')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
              <kbd className="px-1.5 py-0.5 rounded bg-surface-container-high font-mono">Esc</kbd>
              <span>{t('search.toClose')}</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-xs text-on-surface-variant">
              <span>{t('emptyState.search.openWith')}</span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-container-high font-mono">{formatShortcutKeys(['Mod', 'K'])}</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
