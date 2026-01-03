import { create } from 'zustand';

interface EnvironmentState {
  apiUrl: string;
  appName: string;
  version: string;
  isLoading: boolean;
  isInitialized: boolean;
}

interface EnvironmentActions {
  fetchEnvironmentData: () => Promise<void>;
  setEnvironmentData: (data: Partial<EnvironmentState>) => void;
}

type EnvironmentStore = EnvironmentState & EnvironmentActions;

export const useEnvironmentStore = create<EnvironmentStore>((set) => ({
  // Initial state
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  appName: 'Inquiro',
  version: '1.0.0',
  isLoading: false,
  isInitialized: false,

  fetchEnvironmentData: async () => {
    set({ isLoading: true });
    try {
      // In a real app, you might fetch this from an API endpoint
      // For now, we'll use environment variables
      set({
        apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
        appName: import.meta.env.VITE_APP_NAME || 'Inquiro',
        version: import.meta.env.VITE_APP_VERSION || '1.0.0',
        isInitialized: true,
      });
    } catch (error) {
      console.error('Failed to fetch environment data:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  setEnvironmentData: (data) => {
    set((state) => ({ ...state, ...data }));
  },
}));

// Selector hooks
export const useApiUrl = () => useEnvironmentStore((s) => s.apiUrl);
export const useAppName = () => useEnvironmentStore((s) => s.appName);
export const useAppVersion = () => useEnvironmentStore((s) => s.version);
