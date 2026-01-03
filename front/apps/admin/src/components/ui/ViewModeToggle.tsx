import { type HTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@survey/ui-primitives';

/**
 * View mode type representing the display mode for list/grid views.
 */
export type ViewMode = 'grid' | 'list';

/**
 * Props for the ViewModeToggle component.
 */
interface ViewModeToggleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Current view mode */
  value: ViewMode;
  /** Callback when view mode changes */
  onChange: (mode: ViewMode) => void;
  /** Custom icon for grid view */
  gridIcon?: React.ReactNode;
  /** Custom icon for list view */
  listIcon?: React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'default';
}

/**
 * A toggle component for switching between grid and list view modes.
 * Used consistently across list pages for view mode switching.
 *
 * @example
 * ```tsx
 * const [viewMode, setViewMode] = useState<ViewMode>('grid');
 * <ViewModeToggle value={viewMode} onChange={setViewMode} />
 * ```
 */
export function ViewModeToggle({ value, onChange, gridIcon, listIcon, size = 'default', className, ...props }: ViewModeToggleProps) {
  const { t } = useTranslation();
  const buttonSize = size === 'sm' ? 'icon-sm' : 'icon-sm';
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <div
      className={cn('flex items-center bg-surface-container rounded-full p-1', className)}
      role="radiogroup"
      aria-label={t('common.viewMode')}
      {...props}
    >
      <Button
        variant={value === 'grid' ? 'tonal' : 'text'}
        size={buttonSize}
        className="rounded-full"
        onClick={() => onChange('grid')}
        aria-pressed={value === 'grid'}
        aria-label={t('common.gridView')}
      >
        {gridIcon || <LayoutGrid className={iconSize} />}
      </Button>
      <Button
        variant={value === 'list' ? 'tonal' : 'text'}
        size={buttonSize}
        className="rounded-full"
        onClick={() => onChange('list')}
        aria-pressed={value === 'list'}
        aria-label={t('common.listView')}
      >
        {listIcon || <List className={iconSize} />}
      </Button>
    </div>
  );
}
