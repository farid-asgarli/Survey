// KeyboardShortcutsHelp - Dialog showing all available keyboard shortcuts

import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { IconButton } from '@/components/ui/IconButton';
import { useShortcutsStore, formatShortcutKeys, type KeyboardShortcut } from '@/stores/shortcutsStore';
import { X, Keyboard } from 'lucide-react';

interface ShortcutRowProps {
  shortcut: KeyboardShortcut;
}

function ShortcutRow({ shortcut }: ShortcutRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-surface-container-high/50 transition-colors">
      <span className="text-on-surface text-sm">{shortcut.description}</span>
      <kbd
        className={cn(
          'px-2.5 py-1 rounded-lg text-xs font-mono font-medium',
          'bg-surface-container-highest text-on-surface-variant',
          'border border-outline-variant/30'
        )}
      >
        {formatShortcutKeys(shortcut.keys)}
      </kbd>
    </div>
  );
}

interface CategorySectionProps {
  title: string;
  shortcuts: KeyboardShortcut[];
}

function CategorySection({ title, shortcuts }: CategorySectionProps) {
  if (shortcuts.length === 0) return null;

  return (
    <div className="space-y-1">
      <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-3 py-2">{title}</h3>
      <div className="space-y-0.5">
        {shortcuts.map((shortcut) => (
          <ShortcutRow key={shortcut.id} shortcut={shortcut} />
        ))}
      </div>
    </div>
  );
}

const categoryTitles: Record<KeyboardShortcut['category'], string> = {
  navigation: 'Navigation',
  actions: 'Actions',
  editor: 'Editor',
  general: 'General',
};

const categoryOrder: KeyboardShortcut['category'][] = ['general', 'navigation', 'actions', 'editor'];

export function KeyboardShortcutsHelp() {
  const { t } = useTranslation();
  const { isHelpOpen, closeHelp, shortcuts } = useShortcutsStore();

  if (!isHelpOpen) return null;

  // Group shortcuts by category
  const groupedShortcuts = categoryOrder.reduce((acc, category) => {
    acc[category] = Array.from(shortcuts.values())
      .filter((s) => s.category === category && s.enabled !== false)
      .sort((a, b) => a.description.localeCompare(b.description));
    return acc;
  }, {} as Record<KeyboardShortcut['category'], KeyboardShortcut[]>);

  return createPortal(
    <div className="fixed inset-0 z-100" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-scrim/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeHelp} />

      {/* Dialog */}
      <div className="absolute inset-x-4 top-[10%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg">
        <div
          className={cn(
            'bg-surface-container-low rounded-3xl shadow-xl overflow-hidden',
            'border border-outline-variant/20',
            'animate-in slide-in-from-top-4 fade-in duration-300'
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-outline-variant/20">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container/60">
              <Keyboard className="h-5 w-5 text-on-primary-container" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-on-surface">{t('shortcuts.title')}</h2>
              <p className="text-sm text-on-surface-variant">{t('shortcuts.description')}</p>
            </div>
            <IconButton variant="ghost" size="sm" onClick={closeHelp} aria-label={t('a11y.close')}>
              <X className="h-5 w-5" />
            </IconButton>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto py-4 px-3 space-y-4">
            {categoryOrder.map((category) => (
              <CategorySection key={category} title={categoryTitles[category]} shortcuts={groupedShortcuts[category]} />
            ))}

            {/* Empty state */}
            {Array.from(shortcuts.values()).length === 0 && (
              <div className="px-4 py-12 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-container mb-4">
                  <Keyboard className="h-8 w-8 text-on-surface-variant/50" />
                </div>
                <p className="text-on-surface font-medium">{t('shortcuts.noShortcuts')}</p>
                <p className="text-on-surface-variant text-sm mt-1">Shortcuts will appear as you navigate the app</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-outline-variant/20 bg-surface-container/50">
            <p className="text-xs text-on-surface-variant text-center">{t('shortcuts.pressEscToClose')}</p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
