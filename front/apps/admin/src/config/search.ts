// Centralized Search Configuration
// Icons, labels, and colors for search result types

import type { LucideIcon } from 'lucide-react';
import { Send, FileText } from 'lucide-react';
import { getPageIcon } from './pageIcons';

// ============ Types ============
export type SearchResultType = 'survey' | 'template' | 'theme' | 'distribution' | 'response';

export interface SearchTypeConfig {
  icon: LucideIcon;
  label: string;
  /** Background/text color classes for icon container */
  colors: string;
  /** Slightly different opacity for different contexts */
  colorsSubtle: string;
}

// ============ Configuration ============
export const searchTypeConfig: Record<SearchResultType, SearchTypeConfig> = {
  survey: {
    icon: getPageIcon('surveys'),
    label: 'Survey',
    colors: 'bg-primary-container/60 text-on-primary-container',
    colorsSubtle: 'bg-primary-container/40 text-on-primary-container',
  },
  template: {
    icon: getPageIcon('templates'),
    label: 'Template',
    colors: 'bg-secondary-container/60 text-on-secondary-container',
    colorsSubtle: 'bg-secondary-container/40 text-on-secondary-container',
  },
  theme: {
    icon: getPageIcon('themes'),
    label: 'Theme',
    colors: 'bg-tertiary-container/60 text-on-tertiary-container',
    colorsSubtle: 'bg-tertiary-container/40 text-on-tertiary-container',
  },
  distribution: {
    icon: Send,
    label: 'Distribution',
    colors: 'bg-info-container/60 text-on-info-container',
    colorsSubtle: 'bg-info-container/40 text-on-info-container',
  },
  response: {
    icon: getPageIcon('responses'),
    label: 'Response',
    colors: 'bg-success-container/60 text-on-success-container',
    colorsSubtle: 'bg-success-container/40 text-on-success-container',
  },
};

// Default config for unknown types
export const defaultSearchTypeConfig: SearchTypeConfig = {
  icon: FileText,
  label: 'Item',
  colors: 'bg-surface-container-high text-on-surface-variant',
  colorsSubtle: 'bg-surface-container text-on-surface-variant',
};

// ============ Helper Functions ============

/**
 * Get search type configuration
 */
export function getSearchTypeConfig(type: string): SearchTypeConfig {
  return searchTypeConfig[type as SearchResultType] || defaultSearchTypeConfig;
}

/**
 * Get search type icon
 */
export function getSearchTypeIcon(type: string): LucideIcon {
  return getSearchTypeConfig(type).icon;
}

/**
 * Get search type label
 */
export function getSearchTypeLabel(type: string): string {
  return getSearchTypeConfig(type).label;
}

/**
 * Get search type colors
 */
export function getSearchTypeColors(type: string, subtle = false): string {
  const config = getSearchTypeConfig(type);
  return subtle ? config.colorsSubtle : config.colors;
}
