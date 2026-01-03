import { useCallback, useState } from 'react';
import { toast } from '@/components/ui';
import { useTranslation } from 'react-i18next';

interface CopyOptions {
  /** Custom success message (overrides default) */
  successMessage?: string;
  /** Custom error message (overrides default) */
  errorMessage?: string;
  /** Duration in ms to keep copied state true (default: 2000) */
  resetDelay?: number;
  /** Show toast notifications (default: true) */
  showToast?: boolean;
}

interface UseCopyToClipboardReturn {
  /** Whether text was recently copied */
  copied: boolean;
  /** Copy text to clipboard with toast feedback */
  copy: (text: string, options?: CopyOptions) => Promise<boolean>;
  /** Reset copied state manually */
  reset: () => void;
}

/**
 * Hook for copying text to clipboard with toast feedback.
 * Consolidates the duplicate clipboard + toast pattern found across the codebase.
 *
 * @example
 * const { copied, copy } = useCopyToClipboard();
 *
 * // Basic usage with default messages
 * await copy(url);
 *
 * // Custom messages
 * await copy(apiKey, {
 *   successMessage: t('settings.keyCopied'),
 *   errorMessage: t('settings.copyFailed')
 * });
 *
 * // Without toast (silent copy)
 * await copy(text, { showToast: false });
 */
export function useCopyToClipboard(): UseCopyToClipboardReturn {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const reset = useCallback(() => {
    setCopied(false);
  }, []);

  const copy = useCallback(
    async (text: string, options: CopyOptions = {}): Promise<boolean> => {
      const { successMessage = t('common.copied'), errorMessage = t('common.copyFailed'), resetDelay = 2000, showToast = true } = options;

      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);

        if (showToast) {
          toast.success(successMessage);
        }

        if (resetDelay > 0) {
          setTimeout(() => setCopied(false), resetDelay);
        }

        return true;
      } catch {
        if (showToast) {
          toast.error(errorMessage);
        }
        return false;
      }
    },
    [t]
  );

  return { copied, copy, reset };
}
