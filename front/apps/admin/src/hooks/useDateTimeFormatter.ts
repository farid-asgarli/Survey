/**
 * useDateTimeFormatter Hook
 *
 * Provides preference-aware date/time formatting functions that automatically
 * read from the user's preferences store.
 *
 * Usage:
 * ```tsx
 * const { formatDate, formatDateTime, formatRelativeTime } = useDateTimeFormatter();
 *
 * // In JSX
 * <span>{formatDate(survey.createdAt)}</span>
 * <span>{formatDateTime(response.submittedAt)}</span>
 * <span>{formatRelativeTime(survey.updatedAt)}</span>
 * ```
 */

import { useMemo, useCallback } from 'react';
import { usePreferencesStore } from '@/stores';
import type { DateTimeFormatOptions, FormatOptions } from '@/utils/dateTimeFormatter';
import {
  formatDateWithPrefs,
  formatTimeWithPrefs,
  formatDateTimeWithPrefs,
  formatDateTimeShortWithPrefs,
  formatRelativeTimeWithPrefs,
  formatDateLongWithPrefs,
  formatDateShortWithPrefs,
  formatDateContextual,
  formatDateTimeContextual,
  isSameDayInTimezone,
  getDateInTimezone,
} from '@/utils/dateTimeFormatter';

export interface DateTimeFormatterFunctions {
  /**
   * Format date according to user's date format preference
   * @example "01/03/2026" or "03/01/2026" or "2026-01-03"
   */
  formatDate: (dateStr: string | undefined | null, options?: Pick<FormatOptions, 'includeYear'>) => string;

  /**
   * Format time according to user's time format preference
   * @example "3:30 PM" or "15:30"
   */
  formatTime: (dateStr: string | undefined | null, options?: Pick<FormatOptions, 'includeSeconds'>) => string;

  /**
   * Format date and time according to user's preferences
   * @example "01/03/2026, 3:30 PM" or "03/01/2026, 15:30"
   */
  formatDateTime: (dateStr: string | undefined | null, options?: FormatOptions) => string;

  /**
   * Format date and time without year
   * @example "01/03, 3:30 PM"
   */
  formatDateTimeShort: (dateStr: string | undefined | null) => string;

  /**
   * Format as relative time (e.g., "2h ago", "in 5m")
   * Falls back to absolute date for old dates
   */
  formatRelativeTime: (dateStr: string | undefined | null) => string;

  /**
   * Format date in long format: "January 3, 2026"
   */
  formatDateLong: (dateStr: string | undefined | null) => string;

  /**
   * Format date in short format: "Jan 3"
   */
  formatDateShort: (dateStr: string | undefined | null) => string;

  /**
   * Format contextual date: "Today", "Yesterday", "Monday", or full date
   */
  formatContextual: (dateStr: string | undefined | null) => string;

  /**
   * Format contextual date with time: "Today, 3:30 PM"
   */
  formatDateTimeContextual: (dateStr: string | undefined | null) => string;

  /**
   * Check if two dates are the same day in user's timezone
   */
  isSameDay: (dateStr1: string | undefined | null, dateStr2: string | undefined | null) => boolean;

  /**
   * Get date in user's timezone
   */
  getDateInTimezone: (dateStr: string | undefined | null) => Date | null;

  /**
   * The current preferences being used (for debugging/display)
   */
  preferences: DateTimeFormatOptions;
}

/**
 * Hook that provides date/time formatting functions respecting user preferences.
 *
 * All formatting functions are memoized and only recalculate when preferences change.
 */
export function useDateTimeFormatter(): DateTimeFormatterFunctions {
  // Get preferences from store
  const dateFormat = usePreferencesStore((s) => s.preferences.regional.dateFormat);
  const timeFormat = usePreferencesStore((s) => s.preferences.regional.timeFormat);
  const timezone = usePreferencesStore((s) => s.preferences.regional.timezone);

  // Memoize the preferences object
  const prefs = useMemo<DateTimeFormatOptions>(
    () => ({
      dateFormat,
      timeFormat,
      timezone,
    }),
    [dateFormat, timeFormat, timezone]
  );

  // Memoize formatter functions
  const formatDate = useCallback(
    (dateStr: string | undefined | null, options?: Pick<FormatOptions, 'includeYear'>) => formatDateWithPrefs(dateStr, prefs, options),
    [prefs]
  );

  const formatTime = useCallback(
    (dateStr: string | undefined | null, options?: Pick<FormatOptions, 'includeSeconds'>) => formatTimeWithPrefs(dateStr, prefs, options),
    [prefs]
  );

  const formatDateTime = useCallback(
    (dateStr: string | undefined | null, options?: FormatOptions) => formatDateTimeWithPrefs(dateStr, prefs, options),
    [prefs]
  );

  const formatDateTimeShort = useCallback((dateStr: string | undefined | null) => formatDateTimeShortWithPrefs(dateStr, prefs), [prefs]);

  const formatRelativeTime = useCallback((dateStr: string | undefined | null) => formatRelativeTimeWithPrefs(dateStr, prefs), [prefs]);

  const formatDateLong = useCallback((dateStr: string | undefined | null) => formatDateLongWithPrefs(dateStr, prefs), [prefs]);

  const formatDateShort = useCallback((dateStr: string | undefined | null) => formatDateShortWithPrefs(dateStr, prefs), [prefs]);

  const formatContextual = useCallback((dateStr: string | undefined | null) => formatDateContextual(dateStr, prefs), [prefs]);

  const formatDateTimeContextualFn = useCallback((dateStr: string | undefined | null) => formatDateTimeContextual(dateStr, prefs), [prefs]);

  const isSameDay = useCallback(
    (dateStr1: string | undefined | null, dateStr2: string | undefined | null) => isSameDayInTimezone(dateStr1, dateStr2, prefs.timezone),
    [prefs.timezone]
  );

  const getDateInTimezoneFn = useCallback((dateStr: string | undefined | null) => getDateInTimezone(dateStr, prefs.timezone), [prefs.timezone]);

  return useMemo(
    () => ({
      formatDate,
      formatTime,
      formatDateTime,
      formatDateTimeShort,
      formatRelativeTime,
      formatDateLong,
      formatDateShort,
      formatContextual,
      formatDateTimeContextual: formatDateTimeContextualFn,
      isSameDay,
      getDateInTimezone: getDateInTimezoneFn,
      preferences: prefs,
    }),
    [
      formatDate,
      formatTime,
      formatDateTime,
      formatDateTimeShort,
      formatRelativeTime,
      formatDateLong,
      formatDateShort,
      formatContextual,
      formatDateTimeContextualFn,
      isSameDay,
      getDateInTimezoneFn,
      prefs,
    ]
  );
}

/**
 * Get the preferences object for use outside of React components.
 * This reads directly from the store - useful for non-component contexts.
 *
 * NOTE: This does NOT trigger re-renders when preferences change.
 * For components, always use the useDateTimeFormatter hook.
 */
export function getDateTimePreferences(): DateTimeFormatOptions {
  const state = usePreferencesStore.getState();
  return {
    dateFormat: state.preferences.regional.dateFormat,
    timeFormat: state.preferences.regional.timeFormat,
    timezone: state.preferences.regional.timezone,
  };
}
