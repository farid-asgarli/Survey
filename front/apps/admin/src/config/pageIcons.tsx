/**
 * Centralized page icon configuration
 *
 * This module provides a single source of truth for page-specific icons
 * used across the application (Navigation Rail, Page Headers, etc.)
 */

import type { ReactElement } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Users,
  Settings,
  Building2,
  FileStack,
  Palette,
  RefreshCw,
  Mail,
  Share2,
  type LucideIcon,
} from 'lucide-react';

/**
 * Page identifiers for type-safe icon access
 */
export type PageId =
  | 'dashboard'
  | 'surveys'
  | 'distributions'
  | 'responses'
  | 'analytics'
  | 'templates'
  | 'themes'
  | 'recurring-surveys'
  | 'workspaces'
  | 'email-templates'
  | 'settings';

/**
 * Page configuration including icon, label, and path
 */
export interface PageConfig {
  id: PageId;
  icon: LucideIcon;
  label: string;
  path: string;
  description?: string;
}

/**
 * Complete page configuration map
 */
export const PAGE_CONFIG: Record<PageId, PageConfig> = {
  dashboard: {
    id: 'dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    path: '/',
    description: 'Overview of your surveys and activity',
  },
  surveys: {
    id: 'surveys',
    icon: ClipboardList,
    label: 'Surveys',
    path: '/surveys',
    description: 'Create and manage your surveys',
  },
  distributions: {
    id: 'distributions',
    icon: Share2,
    label: 'Distribute',
    path: '/distributions',
    description: 'Survey links and email campaigns',
  },
  responses: {
    id: 'responses',
    icon: Users,
    label: 'Responses',
    path: '/responses',
    description: 'View and manage survey responses',
  },
  analytics: {
    id: 'analytics',
    icon: BarChart3,
    label: 'Analytics',
    path: '/analytics',
    description: 'Survey performance insights and response data',
  },
  templates: {
    id: 'templates',
    icon: FileStack,
    label: 'Templates',
    path: '/templates',
    description: 'Start from pre-built survey templates',
  },
  themes: {
    id: 'themes',
    icon: Palette,
    label: 'Themes',
    path: '/themes',
    description: 'Customize the look and feel of your surveys',
  },
  'recurring-surveys': {
    id: 'recurring-surveys',
    icon: RefreshCw,
    label: 'Recurring',
    path: '/recurring-surveys',
    description: 'Schedule surveys to run automatically on a regular basis',
  },
  workspaces: {
    id: 'workspaces',
    icon: Building2,
    label: 'Workspaces',
    path: '/workspaces',
    description: 'Manage your workspaces and team collaboration',
  },
  'email-templates': {
    id: 'email-templates',
    icon: Mail,
    label: 'Email Templates',
    path: '/email-templates',
    description: 'Create and manage reusable email templates for survey distributions',
  },
  settings: {
    id: 'settings',
    icon: Settings,
    label: 'Settings',
    path: '/settings',
    description: 'Application settings and preferences',
  },
};

/**
 * Get page configuration by ID
 */
export function getPageConfig(pageId: PageId): PageConfig {
  return PAGE_CONFIG[pageId];
}

/**
 * Get page icon component by ID
 */
export function getPageIcon(pageId: PageId): LucideIcon {
  return PAGE_CONFIG[pageId].icon;
}

/**
 * Navigation groups for organizing pages in the UI
 */
export const NAV_GROUPS = {
  /** Main navigation - core features */
  main: ['dashboard', 'surveys', 'distributions', 'responses', 'analytics'] as PageId[],
  /** Secondary navigation - settings/config */
  secondary: ['templates', 'themes', 'recurring-surveys', 'email-templates', 'workspaces'] as PageId[],
  /** Bottom navigation items */
  bottom: ['settings'] as PageId[],
} as const;

/**
 * Get navigation items for a specific group
 */
export function getNavItems(group: keyof typeof NAV_GROUPS): PageConfig[] {
  return NAV_GROUPS[group].map((id) => PAGE_CONFIG[id]);
}

/**
 * Helper to render a page icon with consistent styling
 * @param pageId - The page identifier
 * @param className - Additional CSS classes (default: 'h-6 w-6 text-primary')
 */
export function renderPageIcon(pageId: PageId, className = 'h-6 w-6 text-primary'): ReactElement {
  const Icon = getPageIcon(pageId);
  return <Icon className={className} />;
}
