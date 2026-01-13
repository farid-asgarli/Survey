/**
 * CategoryCard - Preview card for displaying a survey category
 *
 * Features:
 * - Color indicator with customizable icon
 * - Action menu for edit, delete, set default
 * - Default badge indicator
 * - Survey count display
 * - Compact mode for list view
 */

import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Check, MoreVertical, Trash2, Edit, Star, FolderOpen, Hash, Tag, Folder, Grid3X3, Box } from 'lucide-react';
import { Menu, MenuItem, MenuSeparator, IconButton, Badge } from '@/components/ui';
import type { SurveyCategorySummary, SurveyCategory } from '@/types';

/** Category data that can be displayed in the preview card */
type CategoryPreviewData = SurveyCategorySummary | SurveyCategory;

// Map of icon names to Lucide components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  folder: Folder,
  'folder-open': FolderOpen,
  tag: Tag,
  hash: Hash,
  grid: Grid3X3,
  box: Box,
};

interface CategoryCardProps {
  category: CategoryPreviewData;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetDefault?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

// Helper to get the icon component
function getCategoryIcon(iconName?: string): React.ComponentType<{ className?: string }> {
  if (iconName && ICON_MAP[iconName]) {
    return ICON_MAP[iconName];
  }
  return Folder;
}

// Helper to determine if a color is light or dark
function isLightColor(hexColor: string): boolean {
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6) return true;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

export function CategoryCard({
  category,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
  showActions = true,
  compact = false,
}: CategoryCardProps) {
  const { t } = useTranslation();

  const hasActions = showActions && (onEdit || onDelete || onSetDefault);
  const color = category.color || '#6366f1';
  const IconComponent = getCategoryIcon(category.icon);
  const iconTextColor = isLightColor(color) ? 'text-gray-800' : 'text-white';

  // List/Compact view - horizontal layout
  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-4 px-4 py-3.5 transition-colors duration-200',
          'border-b border-outline-variant/20',
          'hover:bg-surface-container-low',
          'cursor-pointer group',
          isSelected && 'bg-primary-container/10 hover:bg-primary-container/15'
        )}
        onClick={onSelect}
      >
        {/* Color indicator with icon */}
        <div className='flex items-center justify-center h-10 w-10 rounded-lg shrink-0' style={{ backgroundColor: color }}>
          <IconComponent className={cn('h-5 w-5', iconTextColor)} />
        </div>

        {/* Content */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-0.5'>
            <h3 className='font-semibold text-on-surface truncate'>{category.name}</h3>
            {category.isDefault && (
              <Badge variant='secondary' className='text-xs'>
                {t('common.default')}
              </Badge>
            )}
            {!category.isActive && (
              <Badge variant='outline' className='text-xs text-on-surface-variant'>
                {t('common.inactive')}
              </Badge>
            )}
          </div>
          {category.description && <p className='text-sm text-on-surface-variant truncate'>{category.description}</p>}
        </div>

        {/* Survey count */}
        <div className='text-sm text-on-surface-variant whitespace-nowrap'>{t('categories.surveyCount', { count: category.surveyCount })}</div>

        {/* Actions */}
        {hasActions && (
          <div className='opacity-0 group-hover:opacity-100 transition-opacity' onClick={(e) => e.stopPropagation()}>
            <Menu
              trigger={
                <IconButton variant='ghost' size='sm' aria-label={t('a11y.moreOptions')}>
                  <MoreVertical className='h-4 w-4' />
                </IconButton>
              }
            >
              {onEdit && (
                <MenuItem onClick={onEdit}>
                  <Edit className='h-4 w-4 mr-2' />
                  {t('common.edit')}
                </MenuItem>
              )}
              {onSetDefault && !category.isDefault && (
                <MenuItem onClick={onSetDefault}>
                  <Star className='h-4 w-4 mr-2' />
                  {t('categories.setAsDefault')}
                </MenuItem>
              )}
              {(onEdit || onSetDefault) && onDelete && <MenuSeparator />}
              {onDelete && (
                <MenuItem onClick={onDelete} destructive>
                  <Trash2 className='h-4 w-4 mr-2' />
                  {t('common.delete')}
                </MenuItem>
              )}
            </Menu>
          </div>
        )}
      </div>
    );
  }

  // Grid view - card layout
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl overflow-hidden transition-all duration-200',
        'bg-surface-container-lowest border border-outline-variant/30',
        'hover:shadow-md hover:border-outline-variant/50',
        'cursor-pointer group',
        isSelected && 'ring-2 ring-primary ring-offset-2'
      )}
      onClick={onSelect}
    >
      {/* Color header */}
      <div className='h-20 flex items-center justify-center relative' style={{ backgroundColor: color }}>
        <IconComponent className={cn('h-10 w-10', iconTextColor)} />

        {/* Default badge */}
        {category.isDefault && (
          <div className='absolute top-2 left-2'>
            <Badge variant='secondary' className='bg-white/90 text-gray-800 text-xs'>
              <Check className='h-3 w-3 mr-1' />
              {t('common.default')}
            </Badge>
          </div>
        )}

        {/* Actions menu */}
        {hasActions && (
          <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity' onClick={(e) => e.stopPropagation()}>
            <Menu
              trigger={
                <IconButton variant='ghost' size='sm' aria-label={t('a11y.moreOptions')} className='bg-white/80 hover:bg-white text-gray-800'>
                  <MoreVertical className='h-4 w-4' />
                </IconButton>
              }
            >
              {onEdit && (
                <MenuItem onClick={onEdit}>
                  <Edit className='h-4 w-4 mr-2' />
                  {t('common.edit')}
                </MenuItem>
              )}
              {onSetDefault && !category.isDefault && (
                <MenuItem onClick={onSetDefault}>
                  <Star className='h-4 w-4 mr-2' />
                  {t('categories.setAsDefault')}
                </MenuItem>
              )}
              {(onEdit || onSetDefault) && onDelete && <MenuSeparator />}
              {onDelete && (
                <MenuItem onClick={onDelete} destructive>
                  <Trash2 className='h-4 w-4 mr-2' />
                  {t('common.delete')}
                </MenuItem>
              )}
            </Menu>
          </div>
        )}
      </div>

      {/* Content */}
      <div className='p-4 flex-1 flex flex-col'>
        <div className='flex items-center gap-2 mb-1'>
          <h3 className='font-semibold text-on-surface truncate flex-1'>{category.name}</h3>
          {!category.isActive && (
            <Badge variant='outline' className='text-xs'>
              {t('common.inactive')}
            </Badge>
          )}
        </div>

        {category.description && <p className='text-sm text-on-surface-variant line-clamp-2 mb-3'>{category.description}</p>}

        <div className='mt-auto pt-3 border-t border-outline-variant/20'>
          <p className='text-xs text-on-surface-variant'>{t('categories.surveyCount', { count: category.surveyCount })}</p>
        </div>
      </div>
    </div>
  );
}
