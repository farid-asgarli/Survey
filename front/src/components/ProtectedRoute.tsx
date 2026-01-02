import { useState, useCallback, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, usePreferencesStore, useNamespaceStore } from '@/stores';
import { useNamespacesList, useUserPreferences } from '@/hooks';
import { AppLoadingScreen, OnboardingWizard, GettingStartedWizard } from '@/components/ui';

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
  const hasCompletedGettingStarted = usePreferencesStore((s) => s.preferences?.onboarding?.hasCompletedGettingStarted);
  const preferencesHydrated = usePreferencesStore((s) => s._hasHydrated);
  const storedUserId = usePreferencesStore((s) => s.userId);
  const hasFetchedFromServer = usePreferencesStore((s) => s.hasFetchedFromServer);

  // Fetch user preferences from server - this ensures we have the correct user's preferences
  const { isLoading: preferencesLoading, isFetched: preferencesFetched } = useUserPreferences();

  // Track if user has dismissed wizards in this session
  const [dismissedOnboarding, setDismissedOnboarding] = useState(false);
  const [dismissedGettingStarted, setDismissedGettingStarted] = useState(false);

  // Determine if we're dealing with a different user's cached preferences
  const isPreferencesForCurrentUser = storedUserId === currentUserId;

  // Check if preferences are ready to make wizard decisions
  const preferencesReady = useMemo(() => {
    if (!preferencesHydrated || !isAuthenticated) return false;
    if (!preferencesFetched || preferencesLoading) return false;
    if (!isPreferencesForCurrentUser || !hasFetchedFromServer) return false;
    return true;
  }, [preferencesHydrated, isAuthenticated, preferencesFetched, preferencesLoading, isPreferencesForCurrentUser, hasFetchedFromServer]);

  // Compute if onboarding wizard should be shown (user preferences setup)
  // IMPORTANT: Only show after preferences have been fetched from server for the current user
  const shouldShowOnboarding = useMemo(() => {
    if (dismissedOnboarding) return false;
    if (!preferencesReady) return false;
    if (!onboardingStatus) return false; // Guard against undefined
    return onboardingStatus === 'not_started' || onboardingStatus === 'in_progress';
  }, [dismissedOnboarding, preferencesReady, onboardingStatus]);

  // Compute if getting started wizard should be shown (survey workflow guide)
  // Shows after onboarding is complete/skipped, and user hasn't completed the guide
  const shouldShowGettingStarted = useMemo(() => {
    if (dismissedGettingStarted) return false;
    if (!preferencesReady) return false;
    // Don't show if onboarding is still pending
    if (onboardingStatus === 'not_started' || onboardingStatus === 'in_progress') return false;
    // Show if onboarding done but getting started not completed
    return !hasCompletedGettingStarted && (onboardingStatus === 'completed' || onboardingStatus === 'skipped');
  }, [dismissedGettingStarted, preferencesReady, onboardingStatus, hasCompletedGettingStarted]);

  const handleOnboardingComplete = useCallback(() => {
    setDismissedOnboarding(true);
  }, []);

  const handleOnboardingSkip = useCallback(() => {
    setDismissedOnboarding(true);
  }, []);

  const handleGettingStartedComplete = useCallback(() => {
    setDismissedGettingStarted(true);
  }, []);

  const handleGettingStartedSkip = useCallback(() => {
    setDismissedGettingStarted(true);
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
      {shouldShowGettingStarted && <GettingStartedWizard onComplete={handleGettingStartedComplete} onSkip={handleGettingStartedSkip} />}
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
