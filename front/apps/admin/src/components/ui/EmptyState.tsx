import { type ReactNode, type HTMLAttributes, type Ref } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from './Button';
import { getPageIcon } from '@/config';
import { Inbox, Search, Link2, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Preset icons for common empty states - using centralized page icons where applicable
const presetIcons: Record<string, LucideIcon> = {
  surveys: getPageIcon('surveys'),
  responses: getPageIcon('responses'),
  templates: getPageIcon('templates'),
  themes: getPageIcon('themes'),
  analytics: getPageIcon('analytics'),
  distributions: getPageIcon('distributions'),
  links: Link2,
  members: getPageIcon('responses'), // Uses Users icon
  namespaces: getPageIcon('workspaces'),
  search: Search,
  default: Inbox,
};

const emptyStateVariants = cva('flex flex-col items-center justify-center text-center', {
  variants: {
    size: {
      sm: 'py-8 px-4 gap-3',
      default: 'py-12 px-6 gap-4',
      lg: 'py-16 px-8 gap-5',
      full: 'min-h-[400px] py-16 px-8 gap-5',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const iconContainerVariants = cva('flex items-center justify-center border', {
  variants: {
    size: {
      sm: 'h-12 w-12 rounded-xl',
      default: 'h-16 w-16 rounded-2xl',
      lg: 'h-16 w-16 rounded-3xl',
      full: 'h-16 w-16 rounded-3xl',
    },
    variant: {
      default: 'bg-surface-container-high border-outline-variant/50',
      primary: 'bg-primary-container border-primary/20',
      secondary: 'bg-secondary-container border-secondary/20',
      muted: 'bg-surface-container border-outline-variant/30',
    },
  },
  defaultVariants: {
    size: 'default',
    variant: 'default',
  },
});

const iconVariants = cva('', {
  variants: {
    size: {
      sm: 'h-5 w-5',
      default: 'h-8 w-8',
      lg: 'h-10 w-10',
      full: 'h-12 w-12',
    },
    variant: {
      default: 'text-on-surface-variant',
      primary: 'text-primary',
      secondary: 'text-secondary',
      muted: 'text-on-surface-variant/70',
    },
  },
  defaultVariants: {
    size: 'default',
    variant: 'default',
  },
});

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: ButtonProps['variant'];
  icon?: ReactNode;
}

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof emptyStateVariants> {
  ref?: Ref<HTMLDivElement>;
  /** Custom icon element or preset name */
  icon?: ReactNode | keyof typeof presetIcons;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Icon container variant */
  iconVariant?: 'default' | 'primary' | 'secondary' | 'muted';
  /** Primary action button */
  action?: EmptyStateAction;
  /** Secondary action button */
  secondaryAction?: EmptyStateAction;
  /** Additional content below actions */
  children?: ReactNode;
}

function EmptyState({
  className,
  size,
  icon = 'default',
  iconVariant = 'default',
  title,
  description,
  action,
  secondaryAction,
  children,
  ref,
  ...props
}: EmptyStateProps) {
  // Resolve icon from preset or use custom
  const IconComponent = typeof icon === 'string' ? presetIcons[icon] || presetIcons.default : null;
  const iconElement = IconComponent ? <IconComponent className={cn(iconVariants({ size, variant: iconVariant }))} /> : icon;

  return (
    <div ref={ref} className={cn(emptyStateVariants({ size }), className)} {...props}>
      {/* Icon */}
      <div className={cn(iconContainerVariants({ size, variant: iconVariant }))}>{iconElement}</div>

      {/* Text */}
      <div className='space-y-1.5 max-w-md'>
        <h3
          className={cn('font-semibold text-on-surface', {
            'text-base': size === 'sm',
            'text-lg': size === 'default',
            'text-xl': size === 'lg' || size === 'full',
          })}
        >
          {title}
        </h3>
        {description && (
          <p
            className={cn('text-on-surface-variant', {
              'text-sm': size === 'sm' || size === 'default',
              'text-base': size === 'lg' || size === 'full',
            })}
          >
            {description}
          </p>
        )}
      </div>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className='flex items-center gap-3 mt-2'>
          {secondaryAction && (
            <Button variant={secondaryAction.variant || 'outline'} size={size === 'sm' ? 'sm' : 'default'} onClick={secondaryAction.onClick}>
              {secondaryAction.icon}
              {secondaryAction.label}
            </Button>
          )}
          {action && (
            <Button variant={action.variant || 'filled'} size={size === 'sm' ? 'sm' : 'default'} onClick={action.onClick}>
              {action.icon}
              {action.label}
            </Button>
          )}
        </div>
      )}

      {/* Additional content */}
      {children}
    </div>
  );
}

// Preset empty states for common scenarios
interface PresetEmptyStateProps extends Omit<EmptyStateProps, 'icon' | 'title' | 'description'> {
  hasFilters?: boolean;
  onClearFilters?: () => void;
  onCreate?: () => void;
  createLabel?: string;
}

function EmptyStateSurveys({ hasFilters, onClearFilters, onCreate, createLabel, ...props }: PresetEmptyStateProps) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon='surveys'
      iconVariant='primary'
      title={hasFilters ? t('emptyState.surveys.titleFiltered') : t('emptyState.surveys.title')}
      description={hasFilters ? t('emptyState.surveys.descriptionFiltered') : t('emptyState.surveys.description')}
      action={
        hasFilters
          ? onClearFilters
            ? { label: t('common.clearFilters'), onClick: onClearFilters, variant: 'outline' }
            : undefined
          : onCreate
          ? { label: createLabel || t('emptyState.surveys.createButton'), onClick: onCreate }
          : undefined
      }
      {...props}
    />
  );
}

function EmptyStateResponses({ hasFilters, onClearFilters, ...props }: PresetEmptyStateProps) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon='responses'
      iconVariant='default'
      title={hasFilters ? t('emptyState.responses.titleFiltered') : t('emptyState.responses.title')}
      description={hasFilters ? t('emptyState.responses.descriptionFiltered') : t('emptyState.responses.description')}
      action={hasFilters && onClearFilters ? { label: t('common.clearFilters'), onClick: onClearFilters, variant: 'outline' } : undefined}
      {...props}
    />
  );
}

function EmptyStateTemplates({ hasFilters, onClearFilters, onCreate, createLabel, ...props }: PresetEmptyStateProps) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon='templates'
      iconVariant='primary'
      title={hasFilters ? t('emptyState.templates.titleFiltered') : t('emptyState.templates.title')}
      description={hasFilters ? t('emptyState.templates.descriptionFiltered') : t('emptyState.templates.description')}
      action={
        hasFilters
          ? onClearFilters
            ? { label: t('common.clearFilters'), onClick: onClearFilters, variant: 'outline' }
            : undefined
          : onCreate
          ? { label: createLabel || t('emptyState.templates.createButton'), onClick: onCreate }
          : undefined
      }
      {...props}
    />
  );
}

function EmptyStateSearch({ query, onClear }: { query?: string; onClear?: () => void }) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon='search'
      iconVariant='muted'
      title={t('emptyState.search.title')}
      description={query ? t('emptyState.search.descriptionWithQuery', { query }) : t('emptyState.search.description')}
      action={onClear ? { label: t('common.clearSearch'), onClick: onClear, variant: 'outline' } : undefined}
      size='sm'
    />
  );
}

function EmptyStateError({ onRetry, title, description }: { onRetry?: () => void; title?: string; description?: string }) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={
        <svg className='h-8 w-8 text-error' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
          <circle cx='12' cy='12' r='10' />
          <line x1='12' y1='8' x2='12' y2='12' />
          <line x1='12' y1='16' x2='12.01' y2='16' />
        </svg>
      }
      iconVariant='default'
      title={title || t('common.failedToLoad')}
      description={description || t('common.somethingWentWrong')}
      action={onRetry ? { label: t('common.tryAgain'), onClick: onRetry } : undefined}
    />
  );
}

export { EmptyState, EmptyStateSurveys, EmptyStateResponses, EmptyStateTemplates, EmptyStateSearch, EmptyStateError, presetIcons };
