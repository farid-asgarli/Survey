import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthTokens } from '@/types';

// Token expiration check interval (1 minute)
const TOKEN_CHECK_INTERVAL = 60 * 1000;
// Warning time before expiration (5 minutes)
const EXPIRATION_WARNING_TIME = 5 * 60 * 1000;

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;
  _tokenExpirationTimer: ReturnType<typeof setTimeout> | null;
  _tokenCheckTimer: ReturnType<typeof setInterval> | null;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens | null) => void;
  login: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setHasHydrated: (state: boolean) => void;
  checkTokenExpiration: () => { isExpired: boolean; isExpiringSoon: boolean; expiresIn: number };
  startTokenExpirationCheck: () => void;
  stopTokenExpirationCheck: () => void;
  clearTokens: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: true,
      _hasHydrated: false,
      _tokenExpirationTimer: null,
      _tokenCheckTimer: null,

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state, isLoading: false });
        // Start token expiration check when hydrated
        if (state && get().isAuthenticated) {
          get().startTokenExpirationCheck();
        }
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      setTokens: (tokens) => {
        set({ tokens });
        if (tokens) {
          get().startTokenExpirationCheck();
        }
      },

      login: (user, tokens) => {
        set({ user, tokens, isAuthenticated: true, isLoading: false });
        get().startTokenExpirationCheck();
      },

      logout: () => {
        get().stopTokenExpirationCheck();
        set({ user: null, tokens: null, isAuthenticated: false });
        // Clear remember me data on explicit logout
        localStorage.removeItem('survey_remember_me');
        localStorage.removeItem('survey_saved_email');
      },

      clearTokens: () => {
        get().stopTokenExpirationCheck();
        set({ tokens: null, isAuthenticated: false });
      },

      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },

      checkTokenExpiration: () => {
        const { tokens } = get();
        if (!tokens?.expiresAt) {
          return { isExpired: true, isExpiringSoon: true, expiresIn: 0 };
        }

        const expiresAt = new Date(tokens.expiresAt).getTime();
        const now = Date.now();
        const expiresIn = expiresAt - now;

        return {
          isExpired: expiresIn <= 0,
          isExpiringSoon: expiresIn > 0 && expiresIn <= EXPIRATION_WARNING_TIME,
          expiresIn,
        };
      },

      startTokenExpirationCheck: () => {
        const { _tokenCheckTimer } = get();

        // Clear existing timer if any
        if (_tokenCheckTimer) {
          clearInterval(_tokenCheckTimer);
        }

        // Set up periodic check
        const timer = setInterval(() => {
          const { isExpired } = get().checkTokenExpiration();
          if (isExpired) {
            console.log('[Auth] Token expired, logging out...');
            get().logout();
          }
        }, TOKEN_CHECK_INTERVAL);

        set({ _tokenCheckTimer: timer });

        // Check immediately
        const { isExpired } = get().checkTokenExpiration();
        if (isExpired) {
          get().logout();
        }
      },

      stopTokenExpirationCheck: () => {
        const { _tokenCheckTimer, _tokenExpirationTimer } = get();
        if (_tokenCheckTimer) {
          clearInterval(_tokenCheckTimer);
        }
        if (_tokenExpirationTimer) {
          clearTimeout(_tokenExpirationTimer);
        }
        set({ _tokenCheckTimer: null, _tokenExpirationTimer: null });
      },
    }),
    {
      name: 'survey-auth',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Check if token is expired before restoring session
          const { tokens } = state;
          if (tokens?.expiresAt) {
            const expiresAt = new Date(tokens.expiresAt).getTime();
            if (Date.now() >= expiresAt) {
              // Token is expired, clear the session
              console.log('[Auth] Token expired on rehydration, clearing session...');
              state.user = null;
              state.tokens = null;
              state.isAuthenticated = false;
            }
          }
          state.setHasHydrated(true);
        }
      },
    }
  )
);

// Selector hooks for better performance
export const useUser = () => useAuthStore((s) => s.user);
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);
export const useAuthTokens = () => useAuthStore((s) => s.tokens);
export const useAuthLoading = () => useAuthStore((s) => s.isLoading);

// Utility to get access token for API calls
export const getAccessToken = (): string | null => {
  return useAuthStore.getState().tokens?.accessToken ?? null;
};

// Utility to check if token is valid
export const isTokenValid = (): boolean => {
  const { isExpired } = useAuthStore.getState().checkTokenExpiration();
  return !isExpired;
};

// Utility to get token expiration status
export const getTokenExpirationStatus = () => {
  return useAuthStore.getState().checkTokenExpiration();
};

// Hook for token expiration warning
export const useTokenExpirationWarning = () => {
  const tokens = useAuthStore((s) => s.tokens);
  const checkExpiration = useAuthStore((s) => s.checkTokenExpiration);

  if (!tokens?.expiresAt) {
    return { showWarning: false, expiresIn: 0 };
  }

  const { isExpiringSoon, expiresIn } = checkExpiration();
  return {
    showWarning: isExpiringSoon,
    expiresIn: Math.max(0, Math.floor(expiresIn / 1000)), // in seconds
  };
};
