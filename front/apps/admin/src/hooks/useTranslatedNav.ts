import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PAGE_CONFIG, NAV_GROUPS, type PageId, type PageConfig } from '@/config/pageIcons';

/**
 * Translation key mapping for page labels
 */
const PAGE_LABEL_KEYS: Record<PageId, string> = {
  dashboard: 'navigation.dashboard',
  surveys: 'navigation.surveys',
  distributions: 'navigation.distributions',
  responses: 'navigation.responses',
  analytics: 'navigation.analytics',
  templates: 'navigation.templates',
  themes: 'navigation.themes',
  categories: 'navigation.categories',
  'recurring-surveys': 'navigation.recurringSurveys',
  workspaces: 'navigation.workspaces',
  'email-templates': 'navigation.emailTemplates',
  settings: 'navigation.settings',
};

/**
 * Translation key mapping for page descriptions
 */
const PAGE_DESCRIPTION_KEYS: Record<PageId, string> = {
  dashboard: 'dashboard.title',
  surveys: 'surveys.description',
  distributions: 'distributions.description',
  responses: 'responses.description',
  analytics: 'analytics.description',
  templates: 'templates.description',
  themes: 'themes.description',
  categories: 'categories.description',
  'recurring-surveys': 'navigation.recurringSurveys',
  workspaces: 'workspaces.description',
  'email-templates': 'navigation.emailTemplates',
  settings: 'settings.title',
};

export interface TranslatedPageConfig extends Omit<PageConfig, 'label' | 'description'> {
  label: string;
  description: string;
}

/**
 * Hook that returns translated page configuration
 */
export function useTranslatedPageConfig(pageId: PageId): TranslatedPageConfig {
  const { t } = useTranslation();

  return useMemo(() => {
    const config = PAGE_CONFIG[pageId];
    return {
      ...config,
      label: t(PAGE_LABEL_KEYS[pageId]),
      description: t(PAGE_DESCRIPTION_KEYS[pageId]),
    };
  }, [pageId, t]);
}

/**
 * Hook that returns translated navigation items for a group
 */
export function useTranslatedNavItems(group: keyof typeof NAV_GROUPS): TranslatedPageConfig[] {
  const { t } = useTranslation();

  return useMemo(() => {
    return NAV_GROUPS[group].map((id) => {
      const config = PAGE_CONFIG[id];
      return {
        ...config,
        label: t(PAGE_LABEL_KEYS[id]),
        description: t(PAGE_DESCRIPTION_KEYS[id]),
      };
    });
  }, [group, t]);
}

/**
 * Hook to get a translated label for a specific page
 */
export function usePageLabel(pageId: PageId): string {
  const { t } = useTranslation();
  return t(PAGE_LABEL_KEYS[pageId]);
}

/**
 * Get the translation key for a page label (for use outside React components)
 */
export function getPageLabelKey(pageId: PageId): string {
  return PAGE_LABEL_KEYS[pageId];
}
