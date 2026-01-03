// Breadcrumbs - Navigation breadcrumb component

import { Fragment, type ReactNode } from 'react';
import { Link, useMatches } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  separator?: ReactNode;
}

// Default separator
const DefaultSeparator = () => <ChevronRight className='h-4 w-4 text-on-surface-variant/50 shrink-0' />;

export function Breadcrumbs({ items = [], className, showHome = true, separator = <DefaultSeparator /> }: BreadcrumbsProps) {
  const { t } = useTranslation();
  // Build breadcrumb items
  const allItems: BreadcrumbItem[] = [];

  if (showHome) {
    allItems.push({
      label: t('navigation.dashboard'),
      href: '/',
      icon: <Home className='h-4 w-4' />,
    });
  }

  allItems.push(...items);

  if (allItems.length === 0) return null;

  return (
    <nav aria-label={t('common.breadcrumb')} className={cn('flex items-center', className)}>
      <ol className='flex items-center gap-1.5 text-sm'>
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;

          return (
            <Fragment key={index}>
              <li className='flex items-center'>
                {item.href && !isLast ? (
                  <Link
                    to={item.href}
                    className={cn(
                      'flex items-center gap-1.5 px-2 py-1 rounded-lg',
                      'text-on-surface-variant hover:text-on-surface',
                      'hover:bg-surface-container-high transition-all duration-150',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30'
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <span
                    className={cn('flex items-center gap-1.5 px-2 py-1', isLast ? 'text-on-surface font-medium' : 'text-on-surface-variant')}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.icon}
                    <span className='truncate max-w-50'>{item.label}</span>
                  </span>
                )}
              </li>
              {!isLast && <li aria-hidden='true'>{separator}</li>}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

// Hook to generate breadcrumbs from current route
interface RouteHandle {
  breadcrumb?: string | ((params: Record<string, string | undefined>) => string);
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const matches = useMatches();

  // Generate breadcrumbs from route matches
  const breadcrumbs: BreadcrumbItem[] = [];

  matches.forEach((match) => {
    const handle = match.handle as RouteHandle | undefined;

    if (handle?.breadcrumb) {
      const label = typeof handle.breadcrumb === 'function' ? handle.breadcrumb(match.params as Record<string, string | undefined>) : handle.breadcrumb;

      breadcrumbs.push({
        label,
        href: match.pathname,
      });
    }
  });

  return breadcrumbs;
}

// Helper function to create breadcrumbs from path segments
export function createBreadcrumbsFromPath(pathname: string, labelMap?: Record<string, string>): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];
  let currentPath = '';

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;

    // Check if this looks like an ID (UUID or similar)
    const isId = /^[0-9a-f-]{36}$/i.test(segment) || /^\d+$/.test(segment);

    // Get label from map or format segment
    let label = labelMap?.[segment] || labelMap?.[currentPath];

    if (!label && !isId) {
      // Format segment as label (capitalize, replace hyphens)
      label = segment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    if (label) {
      items.push({
        label,
        href: isLast ? undefined : currentPath,
      });
    }
  });

  return items;
}
