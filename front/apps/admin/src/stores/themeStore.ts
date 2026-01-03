import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ColorPalette =
  | 'purple'
  | 'blue'
  | 'green'
  | 'orange'
  | 'pink'
  | 'teal'
  | 'amber'
  | 'indigo'
  | 'coral'
  | 'midnight'
  | 'monochrome'
  | 'slate';
export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  colorPalette: ColorPalette;
  themeMode: ThemeMode;
  isDark: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;
}

interface ThemeActions {
  setColorPalette: (palette: ColorPalette) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setHasHydrated: (state: boolean) => void;
}

type ThemeStore = ThemeState & ThemeActions;

// Helper to compute isDark from themeMode
const computeIsDark = (mode: ThemeMode): boolean => {
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

// Apply theme to document
const applyThemeToDocument = (state: Pick<ThemeState, 'colorPalette' | 'isDark'>) => {
  if (typeof document === 'undefined') return;

  document.documentElement.setAttribute('data-palette', state.colorPalette);
  document.documentElement.setAttribute('data-theme', state.isDark ? 'dark' : 'light');

  if (state.isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // Initial state
      colorPalette: 'purple',
      themeMode: 'system',
      isDark: typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false,
      isLoading: false,
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      setColorPalette: (palette) => {
        set({ colorPalette: palette });
        applyThemeToDocument({ ...get(), colorPalette: palette });
      },

      setThemeMode: (mode) => {
        const isDark = computeIsDark(mode);
        set({ themeMode: mode, isDark });
        applyThemeToDocument({ ...get(), isDark });
      },
    }),
    {
      name: 'survey-theme',
      partialize: (state) => ({
        colorPalette: state.colorPalette,
        themeMode: state.themeMode,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
          // Compute isDark from persisted themeMode
          const isDark = computeIsDark(state.themeMode);
          state.isDark = isDark;
          // Apply theme immediately after rehydration
          applyThemeToDocument({ ...state, isDark });
        }
      },
    }
  )
);

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const state = useThemeStore.getState();
    if (state.themeMode === 'system') {
      useThemeStore.setState({ isDark: e.matches });
      applyThemeToDocument({ ...state, isDark: e.matches });
    }
  });
}

// Selector hooks for better performance
export const useColorPalette = () => useThemeStore((s) => s.colorPalette);
export const useThemeMode = () => useThemeStore((s) => s.themeMode);
export const useIsDark = () => useThemeStore((s) => s.isDark);
export const useThemeLoading = () => useThemeStore((s) => s.isLoading);
