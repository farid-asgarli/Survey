import { useEffect } from 'react';
import { usePublicSurveyStore } from '@/stores';
import { applySurveyTheme, clearSurveyTheme } from '@/utils/themeApplication';
import { hasProgress } from '@/utils/autoSave';
import type { PublicSurvey } from '@/types/public-survey';

interface UsePublicSurveySetupParams {
  fetchedSurvey: PublicSurvey | undefined;
  shareToken: string | undefined;
  isError: boolean;
  fetchError: unknown;
  onShowResumeDialog: (show: boolean) => void;
}

export function usePublicSurveySetup({ fetchedSurvey, shareToken, isError, fetchError, onShowResumeDialog }: UsePublicSurveySetupParams) {
  const { setSurvey, setShareToken, setError, reset } = usePublicSurveyStore();

  // Initialize store when survey is fetched
  useEffect(() => {
    if (fetchedSurvey) {
      setSurvey(fetchedSurvey);

      // Apply survey theme
      if (fetchedSurvey.theme) {
        applySurveyTheme(fetchedSurvey.theme);
      }

      // Check for saved progress
      if (shareToken && hasProgress(shareToken)) {
        onShowResumeDialog(true);
      }
    }
  }, [fetchedSurvey, setSurvey, shareToken, onShowResumeDialog]);

  useEffect(() => {
    if (shareToken) {
      setShareToken(shareToken);
    }
  }, [shareToken, setShareToken]);

  useEffect(() => {
    if (isError && fetchError) {
      const errorMessage = (fetchError as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Unable to load survey';
      setError(errorMessage);
    }
  }, [isError, fetchError, setError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSurveyTheme();
      reset();
    };
  }, [reset]);
}
