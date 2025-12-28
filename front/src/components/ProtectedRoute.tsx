import { useState, useCallback, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, usePreferencesStore } from '@/stores';
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

  // Onboarding state - use optional chaining to handle undefined during hydration
  const onboardingStatus = usePreferencesStore((s) => s.preferences?.onboarding?.status);
  const preferencesHydrated = usePreferencesStore((s) => s._hasHydrated);

  // Track if user has dismissed onboarding in this session
  const [dismissedOnboarding, setDismissedOnboarding] = useState(false);

  // Compute if onboarding should be shown (derived state, not effect-driven)
  const shouldShowOnboarding = useMemo(() => {
    if (dismissedOnboarding) return false;
    if (!preferencesHydrated || !isAuthenticated) return false;
    if (!onboardingStatus) return false; // Guard against undefined
    return onboardingStatus === 'not_started' || onboardingStatus === 'in_progress';
  }, [dismissedOnboarding, preferencesHydrated, isAuthenticated, onboardingStatus]);

  const handleOnboardingComplete = useCallback(() => {
    setDismissedOnboarding(true);
  }, []);

  const handleOnboardingSkip = useCallback(() => {
    setDismissedOnboarding(true);
  }, []);

  // Show beautiful loading screen while hydrating persisted state
  if (!hasHydrated || isLoading) {
    return <AppLoadingScreen message="Signing you in" />;
  }

  if (!isAuthenticated) {
    // Save the attempted URL for redirecting after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
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
    return <AppLoadingScreen message="Loading" />;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
