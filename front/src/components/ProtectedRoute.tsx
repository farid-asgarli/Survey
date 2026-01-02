import { useState, useCallback, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, usePreferencesStore, useNamespaceStore } from '@/stores';
import { useNamespacesList, useUserPreferences } from '@/hooks';
import { AppLoadingScreen, OnboardingWizard } from '@/components/ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const currentUserId = useAuthStore((s) => s.user?.id);

  // Namespace state - wait for namespaces to load before rendering protected content
  const namespaceHydrated = useNamespaceStore((s) => s._hasHydrated);
  const activeNamespace = useNamespaceStore((s) => s.activeNamespace);

  // Fetch namespaces when authenticated - this will auto-select the first one if none is active
  const { isLoading: namespacesLoading, isFetched: namespacesFetched } = useNamespacesList();

  // Preferences state - track if preferences belong to current user
  const onboardingStatus = usePreferencesStore((s) => s.preferences?.onboarding?.status);
  const preferencesHydrated = usePreferencesStore((s) => s._hasHydrated);
  const storedUserId = usePreferencesStore((s) => s.userId);
  const hasFetchedFromServer = usePreferencesStore((s) => s.hasFetchedFromServer);

  // Fetch user preferences from server - this ensures we have the correct user's preferences
  const { isLoading: preferencesLoading, isFetched: preferencesFetched } = useUserPreferences();

  // Track if user has dismissed onboarding in this session
  const [dismissedOnboarding, setDismissedOnboarding] = useState(false);

  // Determine if we're dealing with a different user's cached preferences
  const isPreferencesForCurrentUser = storedUserId === currentUserId;

  // Compute if onboarding should be shown (derived state, not effect-driven)
  // IMPORTANT: Only show onboarding after preferences have been fetched from server for the current user
  const shouldShowOnboarding = useMemo(() => {
    if (dismissedOnboarding) return false;
    if (!preferencesHydrated || !isAuthenticated) return false;

    // Wait until preferences are fetched from server and belong to current user
    // This prevents showing wrong onboarding state from a previous user's cached data
    if (!preferencesFetched || preferencesLoading) return false;
    if (!isPreferencesForCurrentUser || !hasFetchedFromServer) return false;

    if (!onboardingStatus) return false; // Guard against undefined
    return onboardingStatus === 'not_started' || onboardingStatus === 'in_progress';
  }, [
    dismissedOnboarding,
    preferencesHydrated,
    isAuthenticated,
    onboardingStatus,
    preferencesFetched,
    preferencesLoading,
    isPreferencesForCurrentUser,
    hasFetchedFromServer,
  ]);

  const handleOnboardingComplete = useCallback(() => {
    setDismissedOnboarding(true);
  }, []);

  const handleOnboardingSkip = useCallback(() => {
    setDismissedOnboarding(true);
  }, []);

  // Show beautiful loading screen while hydrating persisted state
  if (!hasHydrated || isLoading) {
    return <AppLoadingScreen message='Signing you in' />;
  }

  if (!isAuthenticated) {
    // Save the attempted URL for redirecting after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Wait for namespaces to be loaded and an active namespace to be set
  // This prevents API calls from failing due to missing namespace context
  if (!namespaceHydrated || (namespacesLoading && !namespacesFetched) || (!activeNamespace && namespacesLoading)) {
    return <AppLoadingScreen message='Loading workspace' />;
  }

  // Wait for preferences to be fetched for current user before rendering content
  // This ensures onboarding decision is made with correct data
  if (!preferencesFetched || (preferencesLoading && !hasFetchedFromServer)) {
    return <AppLoadingScreen message='Loading preferences' />;
  }

  return (
    <>
      {children}
      {shouldShowOnboarding && <OnboardingWizard onComplete={handleOnboardingComplete} onSkip={handleOnboardingSkip} />}
    </>
  );
}

interface PublicOnlyRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function PublicOnlyRoute({ children, redirectTo = '/' }: PublicOnlyRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  // Show beautiful loading screen while hydrating persisted state
  if (!hasHydrated || isLoading) {
    return <AppLoadingScreen message='Loading' />;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
