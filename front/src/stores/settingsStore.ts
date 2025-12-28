// Settings Store for user preferences

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getCurrentISOTimestamp } from '@/utils';

// ============ Notification Settings ============
export interface NotificationSettings {
  emailNotifications: boolean;
  responseAlerts: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
  completionAlerts: boolean;
  distributionReports: boolean;
}

const defaultNotificationSettings: NotificationSettings = {
  emailNotifications: true,
  responseAlerts: true,
  weeklyDigest: false,
  marketingEmails: false,
  completionAlerts: true,
  distributionReports: true,
};

// ============ API Key ============
export interface ApiKey {
  id: string;
  name: string;
  key: string; // Masked key (e.g., "sk_live_****xxxx")
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
  scopes: ApiKeyScope[];
}

export type ApiKeyScope = 'surveys:read' | 'surveys:write' | 'responses:read' | 'responses:write' | 'analytics:read';

export const API_KEY_SCOPES: { id: ApiKeyScope; label: string; description: string }[] = [
  { id: 'surveys:read', label: 'Read Surveys', description: 'View survey details and questions' },
  { id: 'surveys:write', label: 'Write Surveys', description: 'Create, edit, and delete surveys' },
  { id: 'responses:read', label: 'Read Responses', description: 'View survey responses' },
  { id: 'responses:write', label: 'Write Responses', description: 'Submit responses via API' },
  { id: 'analytics:read', label: 'Read Analytics', description: 'Access survey analytics data' },
];

// ============ Two-Factor Authentication ============
export interface TwoFactorSettings {
  enabled: boolean;
  method?: 'authenticator' | 'sms' | 'email';
  verifiedAt?: string;
  backupCodesRemaining?: number;
}

// ============ Store State & Actions ============
interface SettingsState {
  // Notification settings
  notifications: NotificationSettings;

  // API keys (stored client-side for demo, should be server-side in production)
  apiKeys: ApiKey[];

  // 2FA settings
  twoFactor: TwoFactorSettings;

  // Loading states
  isLoading: boolean;
  isSaving: boolean;

  // Hydration
  _hasHydrated: boolean;
}

interface SettingsActions {
  // Notification actions
  setNotificationSetting: <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => void;
  setAllNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  resetNotificationSettings: () => void;

  // API key actions
  addApiKey: (key: { name: string; scopes: ApiKeyScope[]; expiresAt?: string }) => string;
  removeApiKey: (id: string) => void;
  updateApiKeyLastUsed: (id: string) => void;

  // 2FA actions
  enableTwoFactor: (method: TwoFactorSettings['method']) => void;
  disableTwoFactor: () => void;
  setBackupCodesRemaining: (count: number) => void;

  // Hydration
  setHasHydrated: (state: boolean) => void;
}

type SettingsStore = SettingsState & SettingsActions;

// Generate a mock API key for demo purposes
const generateMockApiKey = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'sk_live_';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
};

// Mask an API key for display
export const maskApiKey = (key: string): string => {
  if (key.length <= 12) return key;
  return key.slice(0, 8) + '****' + key.slice(-4);
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      // Initial state
      notifications: defaultNotificationSettings,
      apiKeys: [],
      twoFactor: {
        enabled: false,
      },
      isLoading: false,
      isSaving: false,
      _hasHydrated: false,

      // Hydration
      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      // Notification actions
      setNotificationSetting: (key, value) => {
        set((state) => ({
          notifications: {
            ...state.notifications,
            [key]: value,
          },
        }));
      },

      setAllNotificationSettings: (settings) => {
        set((state) => ({
          notifications: {
            ...state.notifications,
            ...settings,
          },
        }));
      },

      resetNotificationSettings: () => {
        set({ notifications: defaultNotificationSettings });
      },

      // API key actions
      addApiKey: (keyData) => {
        const id = crypto.randomUUID();
        const fullKey = generateMockApiKey();

        const newKey: ApiKey = {
          id,
          name: keyData.name,
          key: fullKey,
          createdAt: getCurrentISOTimestamp(),
          lastUsedAt: undefined,
          expiresAt: keyData.expiresAt,
          scopes: keyData.scopes,
        };

        set((state) => ({
          apiKeys: [...state.apiKeys, newKey],
        }));

        // Return the full key (only shown once)
        return fullKey;
      },

      removeApiKey: (id) => {
        set((state) => ({
          apiKeys: state.apiKeys.filter((key) => key.id !== id),
        }));
      },

      updateApiKeyLastUsed: (id) => {
        set((state) => ({
          apiKeys: state.apiKeys.map((key) => (key.id === id ? { ...key, lastUsedAt: getCurrentISOTimestamp() } : key)),
        }));
      },

      // 2FA actions
      enableTwoFactor: (method) => {
        set({
          twoFactor: {
            enabled: true,
            method,
            verifiedAt: getCurrentISOTimestamp(),
            backupCodesRemaining: 10,
          },
        });
      },

      disableTwoFactor: () => {
        set({
          twoFactor: {
            enabled: false,
          },
        });
      },

      setBackupCodesRemaining: (count) => {
        set((state) => ({
          twoFactor: {
            ...state.twoFactor,
            backupCodesRemaining: count,
          },
        }));
      },
    }),
    {
      name: 'survey-settings',
      partialize: (state) => ({
        notifications: state.notifications,
        apiKeys: state.apiKeys.map((key) => ({
          ...key,
          key: maskApiKey(key.key), // Store masked version only
        })),
        twoFactor: state.twoFactor,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
