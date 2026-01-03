import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  badge?: ReactNode;
}

/**
 * Consistent page header component for all pages.
 * Based on modern design patterns with:
 * - Large bold title
 * - Subtle description
 * - Optional icon with soft background
 * - Action buttons area
 */
export function PageHeader({ title, description, icon, actions, badge, className, children, ...props }: PageHeaderProps) {
  return (
    <div
      className={cn('flex flex-col gap-4 p-5 md:p-6', 'bg-surface-container-lowest/50', 'border-b border-outline-variant/30', className)}
      {...props}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {icon && (
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center shrink-0',
                'rounded-2xl bg-primary-container/60',
                'border-2 border-primary/20'
              )}
            >
              {icon}
            </div>
          )}
          <div className="space-y-0.5">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">{title}</h1>
              {badge}
            </div>
            {description && <p className="text-sm md:text-base text-on-surface-variant">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 sm:gap-3">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

/**
 * Compact page header for secondary pages or modals.
 */
interface CompactPageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
}

export function CompactPageHeader({ title, subtitle, leading, trailing, className, ...props }: CompactPageHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 md:px-6',
        'bg-surface-container-lowest/50',
        'border-b border-outline-variant/30',
        className
      )}
      {...props}
    >
      {leading}
      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-semibold text-on-surface truncate">{title}</h2>
        {subtitle && <p className="text-sm text-on-surface-variant truncate">{subtitle}</p>}
      </div>
      {trailing}
    </div>
  );
}

/**
 * Section header for dividing content within pages.
 */
interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SectionHeader({ title, description, action, className, ...props }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-4', className)} {...props}>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-on-surface">{title}</h3>
        {description && <p className="text-sm text-on-surface-variant">{description}</p>}
      </div>
      {action}
    </div>
  );
}
