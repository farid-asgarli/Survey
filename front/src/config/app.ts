/**
 * Application Constants
 * Centralized configuration for app-wide settings
 */

export const APP_CONFIG = {
  /** Application name */
  name: 'Inquiro',

  /** Application version */
  version: '1.0.0',

  /** Application description */
  description: 'Create, distribute, and analyze surveys with powerful tools',

  /** Logo paths */
  logos: {
    icon: '/images/logos/logo-icon.svg',
    dark: '/images/logos/logo-dark.svg',
    light: '/images/logos/logo-light.svg',
  },

  /** Favicon path */
  favicon: '/images/logos/logo-icon.svg',
} as const;

// Type-safe exports
export type AppConfig = typeof APP_CONFIG;
export const APP_NAME = APP_CONFIG.name;
export const APP_VERSION = APP_CONFIG.version;
