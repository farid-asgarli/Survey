// User Preferences Store - Syncs with backend and applies settings globally

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { FONT_SIZE_SCALES } from '@/config/accessibility';
import type {
  UserPreferences,
  AccessibilitySettings,
  RegionalSettings,
  NotificationSettings,
  DashboardSettings,
  SurveyBuilderSettings,
  OnboardingSettings,
  OnboardingStatus,
  ThemeMode,
  ColorPalette,
  FontSizeScale,
  DateFormatOption,
  TimeFormatOption,
  DecimalSeparator,
  ThousandsSeparator,
  SupportedLanguage,
  ViewMode,
  SortField,
  SortOrder,
  QuestionNumberingStyle,
  PageBreakBehavior,
  HomeWidget,
} from '@/types';
import i18n from '@/i18n';

// Default values
const defaultAccessibility: AccessibilitySettings = {
  highContrastMode: false,
  reducedMotion: false,
  screenReaderOptimized: false,
  fontSizeScale: 'medium',
  dyslexiaFriendlyFont: false,
};

const defaultRegional: RegionalSettings = {
  language: 'en',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  decimalSeparator: 'dot',
  thousandsSeparator: 'comma',
};

const defaultNotifications: NotificationSettings = {
  emailNotifications: true,
  responseAlerts: true,
  weeklyDigest: false,
  marketingEmails: false,
  completionAlerts: true,
  distributionReports: true,
};

const defaultDashboard: DashboardSettings = {
  defaultViewMode: 'grid',
  itemsPerPage: 12,
  sidebarCollapsed: false,
  defaultSortField: 'updatedAt',
  defaultSortOrder: 'desc',
  homeWidgets: ['stats', 'recent', 'quick-actions'],
  pinnedSurveyIds: [],
};

const defaultSurveyBuilder: SurveyBuilderSettings = {
  defaultQuestionRequired: true,
  defaultThemeId: null,
  defaultWelcomeMessage: '',
  defaultThankYouMessage: '',
  autoSaveInterval: 30,
  questionNumberingStyle: 'numbers',
  showQuestionDescriptions: true,
  defaultPageBreakBehavior: 'auto',
};

const defaultOnboarding: OnboardingSettings = {
  status: 'not_started',
  completedAt: null,
  currentStep: 0,
  hasSeenWelcomeTour: false,
  hasCompletedProfileSetup: false,
  hasCreatedFirstSurvey: false,
  // Getting Started Guide
  hasCompletedGettingStarted: false,
  gettingStartedStep: 0,
  gettingStartedCompletedAt: null,
};

const defaultPreferences: UserPreferences = {
  themeMode: 'system',
  colorPalette: 'purple',
  accessibility: defaultAccessibility,
  regional: defaultRegional,
  notifications: defaultNotifications,
  dashboard: defaultDashboard,
  surveyBuilder: defaultSurveyBuilder,
  onboarding: defaultOnboarding,
};

// Re-export from config for backward compatibility
export { FONT_SIZE_SCALES } from '@/config';

// Available timezones (common ones)
export const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Baku',
  'Australia/Sydney',
  'Pacific/Auckland',
] as const;

interface PreferencesState {
  preferences: UserPreferences;
  /** The user ID these preferences belong to - used to detect user changes */
  userId: string | null;
  /** Whether preferences have been fetched from the server for the current user */
  hasFetchedFromServer: boolean;
  isLoading: boolean;
  isSaving: boolean;
  lastSyncedAt: string | null;
  _hasHydrated: boolean;
}

interface PreferencesActions {
  // Initialization
  setPreferences: (preferences: UserPreferences, userId?: string) => void;
  resetToDefaults: () => void;
  setHasHydrated: (state: boolean) => void;
  /** Clear preferences when user logs out - resets to defaults and clears userId */
  clearForLogout: () => void;
  /** Mark that preferences have been fetched from server */
  setHasFetchedFromServer: (fetched: boolean) => void;

  // Appearance
  setThemeMode: (mode: ThemeMode) => void;
  setColorPalette: (palette: ColorPalette) => void;

  // Accessibility
  setAccessibility: (settings: Partial<AccessibilitySettings>) => void;
  setHighContrastMode: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setScreenReaderOptimized: (enabled: boolean) => void;
  setFontSizeScale: (scale: FontSizeScale) => void;
  setDyslexiaFriendlyFont: (enabled: boolean) => void;

  // Regional
  setRegional: (settings: Partial<RegionalSettings>) => void;
  setLanguage: (language: SupportedLanguage) => void;
  setDateFormat: (format: DateFormatOption) => void;
  setTimeFormat: (format: TimeFormatOption) => void;
  setTimezone: (timezone: string) => void;
  setDecimalSeparator: (separator: DecimalSeparator) => void;
  setThousandsSeparator: (separator: ThousandsSeparator) => void;

  // Notifications
  setNotifications: (settings: Partial<NotificationSettings>) => void;
  setEmailNotifications: (enabled: boolean) => void;
  setResponseAlerts: (enabled: boolean) => void;
  setWeeklyDigest: (enabled: boolean) => void;
  setMarketingEmails: (enabled: boolean) => void;
  setCompletionAlerts: (enabled: boolean) => void;
  setDistributionReports: (enabled: boolean) => void;

  // Dashboard & UI
  setDashboard: (settings: Partial<DashboardSettings>) => void;
  setDefaultViewMode: (mode: ViewMode) => void;
  setItemsPerPage: (count: number) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setDefaultSortField: (field: SortField) => void;
  setDefaultSortOrder: (order: SortOrder) => void;
  setHomeWidgets: (widgets: HomeWidget[]) => void;
  setPinnedSurveyIds: (ids: string[]) => void;
  togglePinnedSurvey: (surveyId: string) => void;

  // Survey Builder
  setSurveyBuilder: (settings: Partial<SurveyBuilderSettings>) => void;
  setDefaultQuestionRequired: (required: boolean) => void;
  setDefaultThemeId: (themeId: string | null) => void;
  setDefaultWelcomeMessage: (message: string) => void;
  setDefaultThankYouMessage: (message: string) => void;
  setAutoSaveInterval: (seconds: number) => void;
  setQuestionNumberingStyle: (style: QuestionNumberingStyle) => void;
  setShowQuestionDescriptions: (show: boolean) => void;
  setDefaultPageBreakBehavior: (behavior: PageBreakBehavior) => void;

  // Onboarding
  setOnboarding: (settings: Partial<OnboardingSettings>) => void;
  setOnboardingStatus: (status: OnboardingStatus) => void;
  setOnboardingCurrentStep: (step: number) => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
  markWelcomeTourSeen: () => void;
  markProfileSetupCompleted: () => void;
  markFirstSurveyCreated: () => void;
  shouldShowOnboarding: () => boolean;

  // Getting Started Guide
  setGettingStartedCurrentStep: (step: number) => void;
  completeGettingStarted: () => void;
  skipGettingStarted: () => void;
  resetGettingStarted: () => void;
  shouldShowGettingStarted: () => boolean;

  // Sync state
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setLastSyncedAt: (timestamp: string) => void;
}

type PreferencesStore = PreferencesState & PreferencesActions;

// Apply theme to document
const applyThemeToDocument = (themeMode: ThemeMode, colorPalette: ColorPalette) => {
  if (typeof document === 'undefined') return;

  // Compute isDark
  let isDark = false;
  if (themeMode === 'dark') {
    isDark = true;
  } else if (themeMode === 'system') {
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  document.documentElement.setAttribute('data-palette', colorPalette);
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');

  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Apply accessibility settings to document
const applyAccessibilityToDocument = (settings: AccessibilitySettings) => {
  if (typeof document === 'undefined') return;

  const html = document.documentElement;

  // High contrast mode
  html.setAttribute('data-high-contrast', settings.highContrastMode ? 'true' : 'false');
  if (settings.highContrastMode) {
    html.classList.add('high-contrast');
  } else {
    html.classList.remove('high-contrast');
  }

  // Reduced motion
  html.setAttribute('data-reduced-motion', settings.reducedMotion ? 'true' : 'false');
  if (settings.reducedMotion) {
    html.classList.add('reduce-motion');
  } else {
    html.classList.remove('reduce-motion');
  }

  // Screen reader optimizations
  html.setAttribute('data-screen-reader', settings.screenReaderOptimized ? 'true' : 'false');

  // Font size scale
  const scale = FONT_SIZE_SCALES[settings.fontSizeScale];
  html.style.setProperty('--font-size-scale', scale.toString());
  html.style.fontSize = `${scale * 100}%`;

  // Dyslexia-friendly font
  html.setAttribute('data-dyslexia-font', settings.dyslexiaFriendlyFont ? 'true' : 'false');
  if (settings.dyslexiaFriendlyFont) {
    html.classList.add('dyslexia-font');
  } else {
    html.classList.remove('dyslexia-font');
  }
};

// Apply language setting
const applyLanguage = (language: SupportedLanguage) => {
  if (typeof document === 'undefined') return;

  document.documentElement.lang = language;
  i18n.changeLanguage(language);
  localStorage.setItem('survey_language', language);
};

export const usePreferencesStore = create<PreferencesStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        preferences: defaultPreferences,
        userId: null,
        hasFetchedFromServer: false,
        isLoading: false,
        isSaving: false,
        lastSyncedAt: null,
        _hasHydrated: false,

        // Initialization
        setPreferences: (preferences, userId) => {
          set({
            preferences,
            lastSyncedAt: new Date().toISOString(),
            hasFetchedFromServer: true,
            // Update userId if provided
            ...(userId !== undefined && { userId }),
          });
          // Apply all settings
          applyThemeToDocument(preferences.themeMode, preferences.colorPalette);
          applyAccessibilityToDocument(preferences.accessibility);
          applyLanguage(preferences.regional.language);
        },

        resetToDefaults: () => {
          set({ preferences: defaultPreferences, hasFetchedFromServer: false });
          applyThemeToDocument(defaultPreferences.themeMode, defaultPreferences.colorPalette);
          applyAccessibilityToDocument(defaultPreferences.accessibility);
          applyLanguage(defaultPreferences.regional.language);
        },

        clearForLogout: () => {
          set({
            preferences: defaultPreferences,
            userId: null,
            hasFetchedFromServer: false,
            lastSyncedAt: null,
          });
          applyThemeToDocument(defaultPreferences.themeMode, defaultPreferences.colorPalette);
          applyAccessibilityToDocument(defaultPreferences.accessibility);
          applyLanguage(defaultPreferences.regional.language);
        },

        setHasFetchedFromServer: (fetched) => {
          set({ hasFetchedFromServer: fetched });
        },

        setHasHydrated: (state) => {
          set({ _hasHydrated: state });
        },

        // Appearance
        setThemeMode: (mode) => {
          set((state) => ({
            preferences: { ...state.preferences, themeMode: mode },
          }));
          applyThemeToDocument(mode, get().preferences.colorPalette);
        },

        setColorPalette: (palette) => {
          set((state) => ({
            preferences: { ...state.preferences, colorPalette: palette },
          }));
          applyThemeToDocument(get().preferences.themeMode, palette);
        },

        // Accessibility
        setAccessibility: (settings) => {
          const newSettings = { ...get().preferences.accessibility, ...settings };
          set((state) => ({
            preferences: { ...state.preferences, accessibility: newSettings },
          }));
          applyAccessibilityToDocument(newSettings);
        },

        setHighContrastMode: (enabled) => {
          get().setAccessibility({ highContrastMode: enabled });
        },

        setReducedMotion: (enabled) => {
          get().setAccessibility({ reducedMotion: enabled });
        },

        setScreenReaderOptimized: (enabled) => {
          get().setAccessibility({ screenReaderOptimized: enabled });
        },

        setFontSizeScale: (scale) => {
          get().setAccessibility({ fontSizeScale: scale });
        },

        setDyslexiaFriendlyFont: (enabled) => {
          get().setAccessibility({ dyslexiaFriendlyFont: enabled });
        },

        // Regional
        setRegional: (settings) => {
          const newSettings = { ...get().preferences.regional, ...settings };
          set((state) => ({
            preferences: { ...state.preferences, regional: newSettings },
          }));
          if (settings.language) {
            applyLanguage(settings.language);
          }
        },

        setLanguage: (language) => {
          get().setRegional({ language });
        },

        setDateFormat: (format) => {
          get().setRegional({ dateFormat: format });
        },

        setTimeFormat: (format) => {
          get().setRegional({ timeFormat: format });
        },

        setTimezone: (timezone) => {
          get().setRegional({ timezone });
        },

        setDecimalSeparator: (separator) => {
          get().setRegional({ decimalSeparator: separator });
        },

        setThousandsSeparator: (separator) => {
          get().setRegional({ thousandsSeparator: separator });
        },

        // Notifications
        setNotifications: (settings) => {
          set((state) => ({
            preferences: {
              ...state.preferences,
              notifications: { ...state.preferences.notifications, ...settings },
            },
          }));
        },

        setEmailNotifications: (enabled) => {
          get().setNotifications({ emailNotifications: enabled });
        },

        setResponseAlerts: (enabled) => {
          get().setNotifications({ responseAlerts: enabled });
        },

        setWeeklyDigest: (enabled) => {
          get().setNotifications({ weeklyDigest: enabled });
        },

        setMarketingEmails: (enabled) => {
          get().setNotifications({ marketingEmails: enabled });
        },

        setCompletionAlerts: (enabled) => {
          get().setNotifications({ completionAlerts: enabled });
        },

        setDistributionReports: (enabled) => {
          get().setNotifications({ distributionReports: enabled });
        },

        // Dashboard & UI
        setDashboard: (settings) => {
          set((state) => ({
            preferences: {
              ...state.preferences,
              dashboard: { ...state.preferences.dashboard, ...settings },
            },
          }));
        },

        setDefaultViewMode: (mode) => {
          get().setDashboard({ defaultViewMode: mode });
        },

        setItemsPerPage: (count) => {
          get().setDashboard({ itemsPerPage: count });
        },

        setSidebarCollapsed: (collapsed) => {
          get().setDashboard({ sidebarCollapsed: collapsed });
        },

        setDefaultSortField: (field) => {
          get().setDashboard({ defaultSortField: field });
        },

        setDefaultSortOrder: (order) => {
          get().setDashboard({ defaultSortOrder: order });
        },

        setHomeWidgets: (widgets) => {
          get().setDashboard({ homeWidgets: widgets });
        },

        setPinnedSurveyIds: (ids) => {
          get().setDashboard({ pinnedSurveyIds: ids });
        },

        togglePinnedSurvey: (surveyId) => {
          const current = get().preferences.dashboard.pinnedSurveyIds;
          const updated = current.includes(surveyId) ? current.filter((id) => id !== surveyId) : [...current, surveyId];
          get().setDashboard({ pinnedSurveyIds: updated });
        },

        // Survey Builder
        setSurveyBuilder: (settings) => {
          set((state) => ({
            preferences: {
              ...state.preferences,
              surveyBuilder: { ...state.preferences.surveyBuilder, ...settings },
            },
          }));
        },

        setDefaultQuestionRequired: (required) => {
          get().setSurveyBuilder({ defaultQuestionRequired: required });
        },

        setDefaultThemeId: (themeId) => {
          get().setSurveyBuilder({ defaultThemeId: themeId });
        },

        setDefaultWelcomeMessage: (message) => {
          get().setSurveyBuilder({ defaultWelcomeMessage: message });
        },

        setDefaultThankYouMessage: (message) => {
          get().setSurveyBuilder({ defaultThankYouMessage: message });
        },

        setAutoSaveInterval: (seconds) => {
          get().setSurveyBuilder({ autoSaveInterval: seconds });
        },

        setQuestionNumberingStyle: (style) => {
          get().setSurveyBuilder({ questionNumberingStyle: style });
        },

        setShowQuestionDescriptions: (show) => {
          get().setSurveyBuilder({ showQuestionDescriptions: show });
        },

        setDefaultPageBreakBehavior: (behavior) => {
          get().setSurveyBuilder({ defaultPageBreakBehavior: behavior });
        },

        // Onboarding
        setOnboarding: (settings) => {
          set((state) => ({
            preferences: {
              ...state.preferences,
              onboarding: { ...state.preferences.onboarding, ...settings },
            },
          }));
        },

        setOnboardingStatus: (status) => {
          get().setOnboarding({ status });
        },

        setOnboardingCurrentStep: (step) => {
          const currentStatus = get().preferences.onboarding.status;
          const updates: Partial<OnboardingSettings> = { currentStep: step };
          // Transition to 'in_progress' if starting from 'not_started' or resuming from 'skipped'
          if ((currentStatus === 'not_started' || currentStatus === 'skipped') && step > 0) {
            updates.status = 'in_progress';
          }
          get().setOnboarding(updates);
        },

        completeOnboarding: () => {
          get().setOnboarding({
            status: 'completed',
            completedAt: new Date().toISOString(),
            hasSeenWelcomeTour: true,
            hasCompletedProfileSetup: true,
          });
        },

        skipOnboarding: () => {
          get().setOnboarding({
            status: 'skipped',
            completedAt: new Date().toISOString(),
          });
        },

        resetOnboarding: () => {
          get().setOnboarding({
            status: 'not_started',
            completedAt: null,
            currentStep: 0,
            hasSeenWelcomeTour: false,
            hasCompletedProfileSetup: false,
          });
        },

        markWelcomeTourSeen: () => {
          get().setOnboarding({ hasSeenWelcomeTour: true });
        },

        markProfileSetupCompleted: () => {
          get().setOnboarding({ hasCompletedProfileSetup: true });
        },

        markFirstSurveyCreated: () => {
          get().setOnboarding({ hasCreatedFirstSurvey: true });
        },

        shouldShowOnboarding: () => {
          const { status } = get().preferences.onboarding;
          return status === 'not_started' || status === 'in_progress';
        },

        // Getting Started Guide
        setGettingStartedCurrentStep: (step) => {
          get().setOnboarding({ gettingStartedStep: step });
        },

        completeGettingStarted: () => {
          get().setOnboarding({
            hasCompletedGettingStarted: true,
            gettingStartedCompletedAt: new Date().toISOString(),
          });
        },

        skipGettingStarted: () => {
          get().setOnboarding({
            hasCompletedGettingStarted: true,
            gettingStartedCompletedAt: new Date().toISOString(),
          });
        },

        resetGettingStarted: () => {
          get().setOnboarding({
            hasCompletedGettingStarted: false,
            gettingStartedStep: 0,
            gettingStartedCompletedAt: null,
          });
        },

        shouldShowGettingStarted: () => {
          const { hasCompletedGettingStarted, status } = get().preferences.onboarding;
          // Show getting started if onboarding is complete/skipped but getting started hasn't been done
          return !hasCompletedGettingStarted && (status === 'completed' || status === 'skipped');
        },

        // Sync state
        setLoading: (loading) => set({ isLoading: loading }),
        setSaving: (saving) => set({ isSaving: saving }),
        setLastSyncedAt: (timestamp) => set({ lastSyncedAt: timestamp }),
      }),
      {
        name: 'survey-user-preferences',
        partialize: (state) => ({
          preferences: state.preferences,
          userId: state.userId,
          hasFetchedFromServer: state.hasFetchedFromServer,
          lastSyncedAt: state.lastSyncedAt,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.setHasHydrated(true);
            // Apply settings after rehydration
            applyThemeToDocument(state.preferences.themeMode, state.preferences.colorPalette);
            applyAccessibilityToDocument(state.preferences.accessibility);
            applyLanguage(state.preferences.regional.language);
          }
        },
      }
    )
  )
);

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const state = usePreferencesStore.getState();
    if (state.preferences.themeMode === 'system') {
      applyThemeToDocument('system', state.preferences.colorPalette);
    }
  });

  // Listen for reduced motion preference changes
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    const state = usePreferencesStore.getState();
    // If user hasn't explicitly set reduced motion, follow system preference
    if (!state.preferences.accessibility.reducedMotion && e.matches) {
      // Optionally auto-enable - for now we just apply current state
      applyAccessibilityToDocument(state.preferences.accessibility);
    }
  });
}

// Export default values for use in components
export { defaultPreferences, defaultAccessibility, defaultRegional, defaultNotifications, defaultDashboard, defaultSurveyBuilder };
