import { useEffect, useCallback, useMemo } from 'react';

/**
 * Modifier keys for keyboard shortcuts
 */
export type ModifierKey = 'ctrl' | 'meta' | 'alt' | 'shift';

/**
 * Configuration for a single keyboard shortcut
 */
export interface KeyboardShortcut {
  /** The key to listen for (e.g., 's', 'z', 'Enter', 'Escape') */
  key: string;
  /** Modifier keys required (ctrl/cmd, alt, shift) */
  modifiers?: ModifierKey[];
  /** The action to execute when the shortcut is triggered */
  action: () => void;
  /** Optional condition to check before executing (return false to skip) */
  enabled?: boolean | (() => boolean);
  /** Whether to prevent default browser behavior (default: true) */
  preventDefault?: boolean;
  /** Whether to stop event propagation (default: false) */
  stopPropagation?: boolean;
  /** Element tags to ignore (default: none for modified keys, ['INPUT', 'TEXTAREA'] for unmodified) */
  ignoreInputs?: boolean;
}

/**
 * Options for the useKeyboardShortcuts hook
 */
export interface UseKeyboardShortcutsOptions {
  /** Whether the shortcuts are enabled (default: true) */
  enabled?: boolean;
  /** Target element to attach listeners to (default: window) */
  target?: 'window' | 'document';
}

/**
 * Checks if the modifier keys match the event
 */
function matchesModifiers(e: KeyboardEvent, modifiers: ModifierKey[] = []): boolean {
  const ctrlOrMeta = modifiers.includes('ctrl') || modifiers.includes('meta');
  const needsAlt = modifiers.includes('alt');
  const needsShift = modifiers.includes('shift');

  // For ctrl/meta, accept either (cross-platform support)
  const hasCtrlOrMeta = e.ctrlKey || e.metaKey;

  if (ctrlOrMeta && !hasCtrlOrMeta) return false;
  if (!ctrlOrMeta && hasCtrlOrMeta) return false;
  if (needsAlt !== e.altKey) return false;
  if (needsShift !== e.shiftKey) return false;

  return true;
}

/**
 * Checks if the event target is an input element
 */
function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName;
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || target.isContentEditable;
}

/**
 * A unified hook for handling keyboard shortcuts across the application.
 *
 * @example
 * ```tsx
 * // Simple save shortcut
 * useKeyboardShortcuts([
 *   { key: 's', modifiers: ['ctrl'], action: handleSave }
 * ]);
 *
 * // Undo/Redo pattern
 * useKeyboardShortcuts([
 *   { key: 'z', modifiers: ['ctrl'], action: handleUndo, enabled: canUndo },
 *   { key: 'z', modifiers: ['ctrl', 'shift'], action: handleRedo, enabled: canRedo },
 *   { key: 'y', modifiers: ['ctrl'], action: handleRedo, enabled: canRedo },
 * ]);
 *
 * // Escape to close
 * useKeyboardShortcuts([
 *   { key: 'Escape', action: handleClose, enabled: isOpen }
 * ]);
 *
 * // Enter to submit (but not in inputs)
 * useKeyboardShortcuts([
 *   { key: 'Enter', action: handleSubmit, ignoreInputs: true }
 * ]);
 * ```
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], options: UseKeyboardShortcutsOptions = {}): void {
  const { enabled = true, target = 'window' } = options;

  // Memoize shortcuts to avoid unnecessary re-renders
  const shortcutsList = useMemo(() => shortcuts, [shortcuts]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      for (const shortcut of shortcutsList) {
        // Check if the key matches (case-insensitive)
        if (e.key.toLowerCase() !== shortcut.key.toLowerCase()) continue;

        // Check modifiers
        if (!matchesModifiers(e, shortcut.modifiers)) continue;

        // Check if shortcut is enabled
        const isEnabled = shortcut.enabled === undefined ? true : typeof shortcut.enabled === 'function' ? shortcut.enabled() : shortcut.enabled;

        if (!isEnabled) continue;

        // Check if we should ignore input elements
        const hasModifiers = shortcut.modifiers && shortcut.modifiers.length > 0;
        const shouldIgnoreInputs = shortcut.ignoreInputs ?? !hasModifiers;

        if (shouldIgnoreInputs && isInputElement(e.target)) continue;

        // Execute the action
        if (shortcut.preventDefault !== false) {
          e.preventDefault();
        }

        if (shortcut.stopPropagation) {
          e.stopPropagation();
        }

        shortcut.action();

        // Only handle one shortcut per keypress
        break;
      }
    },
    [enabled, shortcutsList]
  );

  useEffect(() => {
    const targetElement = target === 'document' ? document : window;
    targetElement.addEventListener('keydown', handleKeyDown as EventListener);
    return () => targetElement.removeEventListener('keydown', handleKeyDown as EventListener);
  }, [handleKeyDown, target]);
}

// ============ Preset Shortcut Builders ============

/**
 * Creates standard save/undo/redo shortcuts
 */
export interface UndoRedoShortcutsConfig {
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean | (() => boolean);
  canRedo?: boolean | (() => boolean);
}

export function createUndoRedoShortcuts(config: UndoRedoShortcutsConfig): KeyboardShortcut[] {
  const shortcuts: KeyboardShortcut[] = [];

  if (config.onSave) {
    shortcuts.push({
      key: 's',
      modifiers: ['ctrl'],
      action: config.onSave,
    });
  }

  if (config.onUndo) {
    shortcuts.push({
      key: 'z',
      modifiers: ['ctrl'],
      action: config.onUndo,
      enabled: config.canUndo,
    });
  }

  if (config.onRedo) {
    // Ctrl+Shift+Z
    shortcuts.push({
      key: 'z',
      modifiers: ['ctrl', 'shift'],
      action: config.onRedo,
      enabled: config.canRedo,
    });
    // Ctrl+Y (alternative)
    shortcuts.push({
      key: 'y',
      modifiers: ['ctrl'],
      action: config.onRedo,
      enabled: config.canRedo,
    });
  }

  return shortcuts;
}

/**
 * Creates escape key shortcut
 */
export function createEscapeShortcut(action: () => void, enabled?: boolean | (() => boolean)): KeyboardShortcut {
  return {
    key: 'Escape',
    action,
    enabled,
    preventDefault: false, // Don't prevent default for Escape
  };
}

/**
 * Creates enter key shortcut (ignores inputs by default)
 */
export function createEnterShortcut(action: () => void, enabled?: boolean | (() => boolean)): KeyboardShortcut {
  return {
    key: 'Enter',
    action,
    enabled,
    ignoreInputs: true,
  };
}

// ============ Convenience Hooks ============

/**
 * Hook for standard undo/redo/save shortcuts (commonly used in editors)
 */
export function useEditorShortcuts(config: UndoRedoShortcutsConfig): void {
  const shortcuts = useMemo(() => createUndoRedoShortcuts(config), [config]);
  useKeyboardShortcuts(shortcuts);
}

/**
 * Hook for escape key to close/exit something
 */
export function useEscapeKey(action: () => void, enabled: boolean = true): void {
  const shortcuts = useMemo(() => [createEscapeShortcut(action, enabled)], [action, enabled]);
  useKeyboardShortcuts(shortcuts);
}
