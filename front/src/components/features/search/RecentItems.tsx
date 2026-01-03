// RecentItems - Display recently visited items in a dropdown or panel

import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useViewTransitionNavigate, useDateTimeFormatter } from '@/hooks';
import { useSearchStore, type RecentItem } from '@/stores/searchStore';
import { getPageIcon } from '@/config';
import { Clock, Send, X, Trash2, FileText, type LucideIcon } from 'lucide-react';

// Icon mapping for item types - using centralized page icons
const typeIcons: Record<string, LucideIcon> = {
  survey: getPageIcon('surveys'),
  template: getPageIcon('templates'),
  theme: getPageIcon('themes'),
  distribution: Send,
  response: getPageIcon('responses'),
};

const typeColors: Record<string, string> = {
  survey: 'bg-primary-container/40 text-on-primary-container',
  template: 'bg-secondary-container/40 text-on-secondary-container',
  theme: 'bg-tertiary-container/40 text-on-tertiary-container',
  distribution: 'bg-info-container/40 text-on-info-container',
  response: 'bg-success-container/40 text-on-success-container',
};

interface RecentItemRowProps {
  item: RecentItem;
  onSelect: (item: RecentItem) => void;
  onRemove: (id: string) => void;
  compact?: boolean;
}

function RecentItemRow({ item, onSelect, onRemove, compact = false }: RecentItemRowProps) {
  const { formatRelativeTime } = useDateTimeFormatter();
  const Icon = typeIcons[item.type] || FileText;
  const timeAgo = formatRelativeTime(item.visitedAt);

  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-xl transition-all duration-150',
        'hover:bg-surface-container-high cursor-pointer',
        compact ? 'px-3 py-2' : 'px-4 py-3'
      )}
      onClick={() => onSelect(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(item);
        }
      }}
    >
      {/* Icon */}
      <div className={cn('flex items-center justify-center shrink-0 rounded-xl', compact ? 'h-8 w-8' : 'h-10 w-10', typeColors[item.type])}>
        <Icon className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn('font-medium text-on-surface truncate', compact ? 'text-sm' : 'text-base')}>{item.title}</p>
        <p className="text-xs text-on-surface-variant truncate">{timeAgo}</p>
      </div>

      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(item.id);
        }}
        className={cn(
          'p-1.5 rounded-lg opacity-0 group-hover:opacity-100',
          'hover:bg-surface-container-highest transition-all duration-150',
          'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30'
        )}
        aria-label={`Remove ${item.title} from recent items`}
      >
        <X className="h-4 w-4 text-on-surface-variant" />
      </button>
    </div>
  );
}

interface RecentItemsListProps {
  className?: string;
  maxItems?: number;
  compact?: boolean;
  showHeader?: boolean;
  showClearAll?: boolean;
  onItemSelect?: () => void;
}

export function RecentItemsList({
  className,
  maxItems = 5,
  compact = false,
  showHeader = true,
  showClearAll = true,
  onItemSelect,
}: RecentItemsListProps) {
  const { t } = useTranslation();
  const navigate = useViewTransitionNavigate();
  const { recentItems, removeRecentItem, clearRecentItems, addRecentItem } = useSearchStore();

  const displayItems = recentItems.slice(0, maxItems);

  const handleSelect = (item: RecentItem) => {
    // Update visit time
    addRecentItem({
      id: item.id,
      type: item.type,
      title: item.title,
      url: item.url,
    });
    navigate(item.url);
    onItemSelect?.();
  };

  if (displayItems.length === 0) {
    return (
      <div className={cn('py-8 text-center', className)}>
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-container mb-3">
          <Clock className="h-6 w-6 text-on-surface-variant/50" />
        </div>
        <p className="text-sm text-on-surface-variant">{t('emptyState.search.noRecentItems')}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between px-4 py-2">
          <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{t('common.recent')}</h3>
          {showClearAll && displayItems.length > 0 && (
            <button
              onClick={clearRecentItems}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-lg text-xs',
                'text-on-surface-variant hover:text-on-surface',
                'hover:bg-surface-container-high transition-colors'
              )}
            >
              <Trash2 className="h-3 w-3" />
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Items */}
      <div className="space-y-0.5 px-1">
        {displayItems.map((item) => (
          <RecentItemRow key={item.id} item={item} onSelect={handleSelect} onRemove={removeRecentItem} compact={compact} />
        ))}
      </div>
    </div>
  );
}

// Compact dropdown version for header
interface RecentItemsDropdownProps {
  trigger: React.ReactNode;
  className?: string;
}

export function RecentItemsDropdown({ trigger, className }: RecentItemsDropdownProps) {
  const { recentItems } = useSearchStore();

  if (recentItems.length === 0) {
    return <>{trigger}</>;
  }

  return (
    <div className={cn('relative group', className)}>
      {trigger}
      <div
        className={cn(
          'absolute right-0 top-full mt-2 w-80 py-2',
          'bg-surface-container-low rounded-2xl shadow-xl',
          'border border-outline-variant/20',
          'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
          'transition-all duration-200 transform scale-95 group-hover:scale-100',
          'origin-top-right z-50'
        )}
      >
        <RecentItemsList maxItems={5} compact showClearAll={false} />
      </div>
    </div>
  );
}
