// Keyboard shortcuts management

import { create } from 'zustand';
import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  id: string;
  keys: string[]; // e.g., ['Ctrl', 'K'] or ['Meta', 'K']
  description: string;
  category: 'navigation' | 'actions' | 'editor' | 'general';
  handler: () => void;
  enabled?: boolean;
}

interface ShortcutsState {
  shortcuts: Map<string, KeyboardShortcut>;
  isHelpOpen: boolean;

  // Actions
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (id: string) => void;
  toggleHelp: () => void;
  openHelp: () => void;
  closeHelp: () => void;
}

// Helper to check if a key event matches a shortcut
function matchesShortcut(event: KeyboardEvent, keys: string[]): boolean {
  const pressedKeys: string[] = [];

  if (event.ctrlKey || event.metaKey) pressedKeys.push('mod');
  if (event.altKey) pressedKeys.push('alt');
  if (event.shiftKey) pressedKeys.push('shift');

  // Add the actual key (lowercase)
  const key = event.key.toLowerCase();
  if (!['control', 'meta', 'alt', 'shift'].includes(key)) {
    pressedKeys.push(key);
  }

  // Normalize both for comparison
  const normalizedPressed = pressedKeys.sort().join('+');
  const normalizedExpected = keys
    .map((k) => k.toLowerCase().replace('ctrl', 'mod').replace('cmd', 'mod'))
    .sort()
    .join('+');

  return normalizedPressed === normalizedExpected;
}

export const useShortcutsStore = create<ShortcutsState>()((set, get) => ({
  shortcuts: new Map(),
  isHelpOpen: false,

  registerShortcut: (shortcut) => {
    const { shortcuts } = get();
    const newShortcuts = new Map(shortcuts);
    newShortcuts.set(shortcut.id, shortcut);
    set({ shortcuts: newShortcuts });
  },

  unregisterShortcut: (id) => {
    const { shortcuts } = get();
    const newShortcuts = new Map(shortcuts);
    newShortcuts.delete(id);
    set({ shortcuts: newShortcuts });
  },

  toggleHelp: () => set((state) => ({ isHelpOpen: !state.isHelpOpen })),
  openHelp: () => set({ isHelpOpen: true }),
  closeHelp: () => set({ isHelpOpen: false }),
}));

// Hook to register keyboard shortcuts
export function useKeyboardShortcut(
  id: string,
  keys: string[],
  handler: () => void,
  options: {
    description?: string;
    category?: KeyboardShortcut['category'];
    enabled?: boolean;
  } = {}
) {
  const { registerShortcut, unregisterShortcut } = useShortcutsStore();
  const { description = '', category = 'general', enabled = true } = options;

  // Memoize keys string for stable dependency
  const keysString = keys.join(',');

  useEffect(() => {
    registerShortcut({
      id,
      keys,
      description,
      category,
      handler,
      enabled,
    });

    return () => {
      unregisterShortcut(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, keysString, description, category, enabled, registerShortcut, unregisterShortcut]);
}

// Global keyboard listener hook
export function useGlobalKeyboardListener() {
  const shortcuts = useShortcutsStore((state) => state.shortcuts);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable || target.closest('[role="textbox"]');

      // Allow some shortcuts even in inputs (like Cmd+K for search)
      const allowInInput = ['mod+k', 'mod+/', 'escape'].some((shortcut) => {
        const keys = shortcut.split('+');
        return matchesShortcut(event, keys);
      });

      if (isInput && !allowInInput) return;

      // Find and execute matching shortcut
      for (const shortcut of shortcuts.values()) {
        if (shortcut.enabled !== false && matchesShortcut(event, shortcut.keys)) {
          event.preventDefault();
          event.stopPropagation();
          shortcut.handler();
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Helper function to format shortcut keys for display
export function formatShortcutKeys(keys: string[]): string {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  return keys
    .map((key) => {
      const k = key.toLowerCase();
      if (k === 'mod' || k === 'ctrl' || k === 'cmd') {
        return isMac ? '⌘' : 'Ctrl';
      }
      if (k === 'alt') return isMac ? '⌥' : 'Alt';
      if (k === 'shift') return '⇧';
      if (k === 'enter') return '↵';
      if (k === 'escape') return 'Esc';
      if (k === 'arrowup') return '↑';
      if (k === 'arrowdown') return '↓';
      if (k === 'arrowleft') return '←';
      if (k === 'arrowright') return '→';
      if (k === 'backspace') return '⌫';
      if (k === 'delete') return '⌦';
      if (k === 'space') return 'Space';
      if (k === 'tab') return 'Tab';
      return key.toUpperCase();
    })
    .join(isMac ? '' : '+');
}

// Predefined shortcuts for easy reference
export const SHORTCUTS = {
  SEARCH: ['Mod', 'K'],
  SEARCH_ALT: ['Mod', '/'],
  NEW_SURVEY: ['Mod', 'N'],
  SAVE: ['Mod', 'S'],
  UNDO: ['Mod', 'Z'],
  REDO: ['Mod', 'Shift', 'Z'],
  HELP: ['Mod', '?'],
  ESCAPE: ['Escape'],
  GO_HOME: ['G', 'H'],
  GO_SURVEYS: ['G', 'S'],
  GO_TEMPLATES: ['G', 'T'],
  GO_SETTINGS: ['G', ','],
} as const;
