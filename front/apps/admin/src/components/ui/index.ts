// ============================================================================
// Admin UI Components Barrel
// ============================================================================
// This barrel re-exports primitives from @survey/ui-primitives and adds
// admin-specific composed components.
//
// Pattern:
// 1. Re-export everything from ui-primitives (single source of truth)
// 2. Export admin-specific components that use i18n, routing, or services
// ============================================================================

// ============================================================================
// Re-export all primitives from @survey/ui-primitives
// ============================================================================

export * from '@survey/ui-primitives';

// ============================================================================
// Admin-Specific Components
// ============================================================================
// These components are specific to the admin app because they:
// - Use useTranslation() internally (i18n coupled)
// - Use react-router-dom for navigation
// - Use admin stores/services
// - Contain admin-specific branding or business logic

// Authentication
export { AzureAdLoginButton } from './AzureAdLoginButton';

// Navigation
export { Breadcrumbs, useBreadcrumbs, createBreadcrumbsFromPath } from './Breadcrumbs';
export type { BreadcrumbItem } from './Breadcrumbs';
export { ViewModeToggle } from './ViewModeToggle';

// List Page Components
export { ActiveFiltersBar } from './ActiveFiltersBar';
export type { ActiveFilter } from './ActiveFiltersBar';

// Branding
export { Logo, LogoIcon } from './Logo';
export type { LogoProps, LogoVariant, LogoSize } from './Logo';

// App Loading & Offline State
export { AppLoadingScreen, LoadingSpinner, PageTransitionLoader } from './AppLoadingScreen';
export type { AppLoadingScreenProps, LoadingSpinnerProps, LoadingStage } from './AppLoadingScreen';
export { OfflineIndicator, useOnlineStatus, OnlineOnly } from './OfflineIndicator';

// Media Upload
export { ImageUploader } from './ImageUploader';
export type { ImageUploaderProps } from './ImageUploader';

// Internationalization
export { LanguageSwitcher } from './LanguageSwitcher';

// Onboarding Wizards
export { OnboardingWizard } from './OnboardingWizard';
export { GettingStartedWizard } from './GettingStartedWizard';
