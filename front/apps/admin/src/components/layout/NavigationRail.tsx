import { type HTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface NavigationRailProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function NavigationRail({ className, children, ...props }: NavigationRailProps) {
  return (
    <nav
      className={cn(
        'flex h-full w-22 flex-col items-center gap-1 py-4 px-3',
        'bg-surface-container-lowest',
        'border-r border-outline-variant/25',
        'overflow-y-auto overflow-x-hidden',
        className
      )}
      {...props}
    >
      {children}
    </nav>
  );
}

interface NavigationRailItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon: ReactNode;
  label?: string;
  badge?: number | string;
}

export function NavigationRailItem({ active, icon, label, badge, className, ...props }: NavigationRailItemProps) {
  return (
    <button
      className={cn(
        'group flex w-full flex-col items-center gap-1 py-2 px-1 rounded-2xl',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'relative flex h-9 w-16 items-center justify-center rounded-full',
          'transition-all duration-200',
          active
            ? 'bg-primary-container text-on-primary-container'
            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
        )}
      >
        {icon}
        {badge !== undefined && (
          <span
            className={cn(
              'absolute -top-1 -right-0.5 flex items-center justify-center',
              'min-w-4.5 h-4.5 px-1 rounded-full',
              'bg-error text-on-error text-[10px] font-bold'
            )}
          >
            {typeof badge === 'number' && badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      {label && (
        <span
          className={cn(
            'text-[11px] font-medium transition-colors text-center leading-tight',
            active ? 'text-on-surface font-semibold' : 'text-on-surface-variant group-hover:text-on-surface'
          )}
        >
          {label}
        </span>
      )}
    </button>
  );
}

// Mobile bottom navigation bar
interface NavigationBarProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function NavigationBar({ className, children, ...props }: NavigationBarProps) {
  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'flex h-18 items-center justify-around px-4 pb-2',
        'bg-surface-container-lowest/95 backdrop-blur-lg',
        'border-t border-outline-variant/20',
        'md:hidden',
        className
      )}
      {...props}
    >
      {children}
    </nav>
  );
}

interface NavigationBarItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon: ReactNode;
  label: string;
  badge?: number | string;
}

export function NavigationBarItem({ active, icon, label, badge, className, ...props }: NavigationBarItemProps) {
  return (
    <button
      className={cn(
        'flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-16',
        'transition-all duration-200',
        'focus-visible:outline-none',
        className
      )}
      {...props}
    >
      <div className="relative">
        <div
          className={cn(
            'flex h-8 w-16 items-center justify-center rounded-full',
            'transition-all duration-200',
            active ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant'
          )}
        >
          {icon}
        </div>
        {badge !== undefined && (
          <span
            className={cn(
              'absolute -top-0.5 right-1 flex items-center justify-center',
              'min-w-4 h-4 px-1 rounded-full',
              'bg-error text-on-error text-[10px] font-bold'
            )}
          >
            {typeof badge === 'number' && badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      <span className={cn('text-[11px] font-medium', active ? 'text-on-surface' : 'text-on-surface-variant')}>{label}</span>
    </button>
  );
}
