/**
 * Date/Time Formatter Utilities
 *
 * This file contains all date/time formatting utilities:
 *
 * 1. Preference-aware formatting functions (formatDateWithPrefs, formatDateTimeWithPrefs, etc.)
 *    - These respect user's regional settings (date format, time format, timezone)
 *    - Use the useDateTimeFormatter hook for easy access in components
 *
 * 2. Utility functions (formatDateForInput, getToday, formatDuration, etc.)
 *    - These are NOT preference-dependent and are useful for date manipulation
 *
 * Date formats supported:
 * - MM/DD/YYYY: 01/03/2026
 * - DD/MM/YYYY: 03/01/2026
 * - YYYY-MM-DD: 2026-01-03
 *
 * Time formats supported:
 * - 12h: 3:30 PM
 * - 24h: 15:30
 *
 * @see useDateTimeFormatter hook for preference-aware date/time formatting in components
 */

import type { DateFormatOption, TimeFormatOption } from '@/types';

// ============================================================================
// Types
// ============================================================================

export interface DateTimeFormatOptions {
  /** User's preferred date format */
  dateFormat: DateFormatOption;
  /** User's preferred time format */
  timeFormat: TimeFormatOption;
  /** User's preferred timezone (IANA timezone name) */
  timezone: string;
}

export interface FormatOptions {
  /** Include year in date output */
  includeYear?: boolean;
  /** Include time in output */
  includeTime?: boolean;
  /** Include seconds in time output */
  includeSeconds?: boolean;
}

export interface DateRangeResult {
  fromDate: string;
  toDate: string;
}

export interface ParsedRelativeTime {
  prefix: string;
  value: string;
  unit: string;
}

// ============================================================================
// Core Formatting Functions
// ============================================================================

/**
 * Parse a date string into a Date object
 */
function parseDate(dateStr: string | undefined | null): Date | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Get date parts in user's timezone
 */
function getDateParts(
  date: Date,
  timezone: string
): { year: number; month: number; day: number; hour: number; minute: number; second: number; hour12: number; ampm: string } {
  // Use Intl.DateTimeFormat to get parts in the target timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const partsMap: Record<string, string> = {};
  for (const part of parts) {
    partsMap[part.type] = part.value;
  }

  const hour = parseInt(partsMap.hour, 10);
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const ampm = hour < 12 ? 'AM' : 'PM';

  return {
    year: parseInt(partsMap.year, 10),
    month: parseInt(partsMap.month, 10),
    day: parseInt(partsMap.day, 10),
    hour,
    minute: parseInt(partsMap.minute, 10),
    second: parseInt(partsMap.second, 10),
    hour12,
    ampm,
  };
}

/**
 * Format date according to user's preference
 */
function formatDatePart(parts: { year: number; month: number; day: number }, dateFormat: DateFormatOption, includeYear: boolean = true): string {
  const { year, month, day } = parts;
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  const yyyy = String(year);

  if (!includeYear) {
    switch (dateFormat) {
      case 'MM/DD/YYYY':
        return `${mm}/${dd}`;
      case 'DD/MM/YYYY':
        return `${dd}/${mm}`;
      case 'YYYY-MM-DD':
        return `${mm}-${dd}`;
    }
  }

  switch (dateFormat) {
    case 'MM/DD/YYYY':
      return `${mm}/${dd}/${yyyy}`;
    case 'DD/MM/YYYY':
      return `${dd}/${mm}/${yyyy}`;
    case 'YYYY-MM-DD':
      return `${yyyy}-${mm}-${dd}`;
  }
}

/**
 * Format time according to user's preference
 */
function formatTimePart(
  parts: { hour: number; minute: number; second: number; hour12: number; ampm: string },
  timeFormat: TimeFormatOption,
  includeSeconds: boolean = false
): string {
  const { hour, minute, second, hour12, ampm } = parts;
  const mm = String(minute).padStart(2, '0');
  const ss = String(second).padStart(2, '0');

  if (timeFormat === '12h') {
    const h = String(hour12);
    return includeSeconds ? `${h}:${mm}:${ss} ${ampm}` : `${h}:${mm} ${ampm}`;
  } else {
    const hh = String(hour).padStart(2, '0');
    return includeSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Format a date string according to user preferences
 *
 * @example
 * // With MM/DD/YYYY format
 * formatDateWithPrefs('2026-01-03T15:30:00Z', { dateFormat: 'MM/DD/YYYY', ... })
 * // Returns: "01/03/2026"
 *
 * @example
 * // With DD/MM/YYYY format
 * formatDateWithPrefs('2026-01-03T15:30:00Z', { dateFormat: 'DD/MM/YYYY', ... })
 * // Returns: "03/01/2026"
 */
export function formatDateWithPrefs(
  dateStr: string | undefined | null,
  prefs: DateTimeFormatOptions,
  options: Pick<FormatOptions, 'includeYear'> = {}
): string {
  const date = parseDate(dateStr);
  if (!date) return '-';

  const { includeYear = true } = options;
  const parts = getDateParts(date, prefs.timezone);

  return formatDatePart(parts, prefs.dateFormat, includeYear);
}

/**
 * Format a time string according to user preferences
 *
 * @example
 * // With 12h format
 * formatTimeWithPrefs('2026-01-03T15:30:00Z', { timeFormat: '12h', ... })
 * // Returns: "3:30 PM"
 *
 * @example
 * // With 24h format
 * formatTimeWithPrefs('2026-01-03T15:30:00Z', { timeFormat: '24h', ... })
 * // Returns: "15:30"
 */
export function formatTimeWithPrefs(
  dateStr: string | undefined | null,
  prefs: DateTimeFormatOptions,
  options: Pick<FormatOptions, 'includeSeconds'> = {}
): string {
  const date = parseDate(dateStr);
  if (!date) return '-';

  const { includeSeconds = false } = options;
  const parts = getDateParts(date, prefs.timezone);

  return formatTimePart(parts, prefs.timeFormat, includeSeconds);
}

/**
 * Format a date and time string according to user preferences
 *
 * @example
 * // With MM/DD/YYYY and 12h format
 * formatDateTimeWithPrefs('2026-01-03T15:30:00Z', { dateFormat: 'MM/DD/YYYY', timeFormat: '12h', ... })
 * // Returns: "01/03/2026, 3:30 PM"
 */
export function formatDateTimeWithPrefs(dateStr: string | undefined | null, prefs: DateTimeFormatOptions, options: FormatOptions = {}): string {
  const date = parseDate(dateStr);
  if (!date) return '-';

  const { includeYear = true, includeSeconds = false } = options;
  const parts = getDateParts(date, prefs.timezone);

  const datePart = formatDatePart(parts, prefs.dateFormat, includeYear);
  const timePart = formatTimePart(parts, prefs.timeFormat, includeSeconds);

  return `${datePart}, ${timePart}`;
}

/**
 * Format a date/time in short format (without year)
 *
 * @example
 * formatDateTimeShortWithPrefs('2026-01-03T15:30:00Z', prefs)
 * // Returns: "01/03, 3:30 PM" (for MM/DD/YYYY + 12h)
 */
export function formatDateTimeShortWithPrefs(dateStr: string | undefined | null, prefs: DateTimeFormatOptions): string {
  return formatDateTimeWithPrefs(dateStr, prefs, { includeYear: false });
}

/**
 * Format relative time with optional fallback to absolute date
 *
 * @example
 * formatRelativeTimeWithPrefs('2026-01-03T15:30:00Z', prefs)
 * // Returns: "2h ago" or "in 5m" or absolute date for old dates
 */
export function formatRelativeTimeWithPrefs(dateStr: string | undefined | null, prefs: DateTimeFormatOptions): string {
  const date = parseDate(dateStr);
  if (!date) return '-';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const isFuture = diffMs < 0;
  const absDiffMs = Math.abs(diffMs);

  const diffMinutes = Math.floor(absDiffMs / (1000 * 60));
  const diffHours = Math.floor(absDiffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  const suffix = isFuture ? '' : ' ago';
  const prefix = isFuture ? 'in ' : '';

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${prefix}${diffMinutes}m${suffix}`;
  if (diffHours < 24) return `${prefix}${diffHours}h${suffix}`;
  if (diffDays < 7) return `${prefix}${diffDays}d${suffix}`;
  if (diffDays < 30) return `${prefix}${Math.floor(diffDays / 7)}w${suffix}`;
  if (diffMonths < 12) return `${prefix}${diffMonths}mo${suffix}`;
  if (diffYears < 5) {
    const remainingMonths = diffMonths % 12;
    if (remainingMonths > 0) {
      return `${prefix}${diffYears}y ${remainingMonths}mo${suffix}`;
    }
    return `${prefix}${diffYears}y${suffix}`;
  }

  // For very old dates, fall back to absolute format
  return formatDateTimeWithPrefs(dateStr, prefs);
}

/**
 * Format a date for display in a human-readable "Month Day, Year" style
 * while still respecting timezone
 *
 * @example
 * formatDateLongWithPrefs('2026-01-03T15:30:00Z', prefs)
 * // Returns: "January 3, 2026"
 */
export function formatDateLongWithPrefs(dateStr: string | undefined | null, prefs: DateTimeFormatOptions): string {
  const date = parseDate(dateStr);
  if (!date) return '-';

  // Use Intl for locale-aware month name
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: prefs.timezone,
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return formatter.format(date);
}

/**
 * Format a date for display in a short "Mon Day" style
 *
 * @example
 * formatDateShortWithPrefs('2026-01-03T15:30:00Z', prefs)
 * // Returns: "Jan 3"
 */
export function formatDateShortWithPrefs(dateStr: string | undefined | null, prefs: DateTimeFormatOptions): string {
  const date = parseDate(dateStr);
  if (!date) return '-';

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: prefs.timezone,
    month: 'short',
    day: 'numeric',
  });

  return formatter.format(date);
}

// ============================================================================
// Utility Functions (not preference-dependent but timezone-aware)
// ============================================================================

/**
 * Convert a date to a specific timezone and return as ISO string parts
 */
export function getDateInTimezone(dateStr: string | undefined | null, timezone: string): Date | null {
  const date = parseDate(dateStr);
  if (!date) return null;

  // Get parts in the target timezone
  const parts = getDateParts(date, timezone);

  // Create a new date that represents the same moment in UTC
  // This is useful for comparisons
  return new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
}

/**
 * Check if two dates are the same day in a specific timezone
 */
export function isSameDayInTimezone(dateStr1: string | undefined | null, dateStr2: string | undefined | null, timezone: string): boolean {
  const date1 = parseDate(dateStr1);
  const date2 = parseDate(dateStr2);

  if (!date1 || !date2) return false;

  const parts1 = getDateParts(date1, timezone);
  const parts2 = getDateParts(date2, timezone);

  return parts1.year === parts2.year && parts1.month === parts2.month && parts1.day === parts2.day;
}

/**
 * Get "Today" or "Yesterday" or formatted date based on user's timezone
 */
export function formatDateContextual(dateStr: string | undefined | null, prefs: DateTimeFormatOptions): string {
  const date = parseDate(dateStr);
  if (!date) return '-';

  const now = new Date();
  const nowParts = getDateParts(now, prefs.timezone);
  const dateParts = getDateParts(date, prefs.timezone);

  // Same day
  if (nowParts.year === dateParts.year && nowParts.month === dateParts.month && nowParts.day === dateParts.day) {
    return 'Today';
  }

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayParts = getDateParts(yesterday, prefs.timezone);

  if (yesterdayParts.year === dateParts.year && yesterdayParts.month === dateParts.month && yesterdayParts.day === dateParts.day) {
    return 'Yesterday';
  }

  // Within last 7 days - show day name
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 0 && diffDays < 7) {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: prefs.timezone,
      weekday: 'long',
    });
    return formatter.format(date);
  }

  // Otherwise show full date
  return formatDateWithPrefs(dateStr, prefs);
}

/**
 * Format contextual date with time
 *
 * @example
 * formatDateTimeContextual('2026-01-03T15:30:00Z', prefs)
 * // Returns: "Today, 3:30 PM" or "Yesterday, 3:30 PM" or "01/03/2026, 3:30 PM"
 */
export function formatDateTimeContextual(dateStr: string | undefined | null, prefs: DateTimeFormatOptions): string {
  const datePart = formatDateContextual(dateStr, prefs);
  if (datePart === '-') return '-';

  const timePart = formatTimeWithPrefs(dateStr, prefs);
  return `${datePart}, ${timePart}`;
}

// ============================================================================
// Relative Time Parsing
// ============================================================================

/**
 * Parse relative time into components for custom UI rendering
 * Returns { prefix, value, unit } for flexible display
 */
export function parseRelativeTime(dateStr: string | undefined | null): ParsedRelativeTime | null {
  const date = parseDate(dateStr);
  if (!date) return null;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const isFuture = diffMs < 0;
  const absDiffMs = Math.abs(diffMs);

  const diffMinutes = Math.floor(absDiffMs / (1000 * 60));
  const diffHours = Math.floor(absDiffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  const prefix = isFuture ? 'in' : '';
  const suffix = isFuture ? '' : 'ago';

  if (diffMinutes < 1) return { prefix: '', value: 'now', unit: '' };
  if (diffMinutes < 60) return { prefix, value: String(diffMinutes), unit: `min${suffix ? ' ' + suffix : ''}` };
  if (diffHours < 24) return { prefix, value: String(diffHours), unit: `hr${diffHours !== 1 ? 's' : ''}${suffix ? ' ' + suffix : ''}` };
  if (diffDays < 7) return { prefix, value: String(diffDays), unit: `day${diffDays !== 1 ? 's' : ''}${suffix ? ' ' + suffix : ''}` };
  if (diffDays < 30) return { prefix, value: String(diffWeeks), unit: `wk${diffWeeks !== 1 ? 's' : ''}${suffix ? ' ' + suffix : ''}` };
  if (diffMonths < 12) return { prefix, value: String(diffMonths), unit: `mo${suffix ? ' ' + suffix : ''}` };
  if (diffYears < 5) return { prefix, value: String(diffYears), unit: `yr${diffYears !== 1 ? 's' : ''}${suffix ? ' ' + suffix : ''}` };
  return null;
}

// ============================================================================
// Date Comparison Utilities
// ============================================================================

/**
 * Check if a date is in the past
 */
export function isPast(dateStr: string | undefined | null): boolean {
  const date = parseDate(dateStr);
  if (!date) return false;
  return date.getTime() < Date.now();
}

/**
 * Check if a date is in the future
 */
export function isFuture(dateStr: string | undefined | null): boolean {
  const date = parseDate(dateStr);
  if (!date) return false;
  return date.getTime() > Date.now();
}

// ============================================================================
// Duration Formatting Utilities
// ============================================================================

/**
 * Format a duration in seconds to a human-readable string
 * e.g., 45 -> "45s", 90 -> "1m 30s", 3700 -> "1h 1m"
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format duration between two date strings
 * Returns "In progress" if completedAt is not provided
 */
export function formatDurationBetween(startedAt: string, completedAt?: string): string {
  if (!completedAt) return 'In progress';

  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  const seconds = Math.floor((end - start) / 1000);

  return formatDuration(seconds);
}

/**
 * Format a duration in milliseconds to a human-readable string
 * e.g., 500 -> "<1s", 5000 -> "5s", 65000 -> "1m"
 */
export function formatDurationMs(ms: number): string {
  if (ms < 1000) return '<1s';
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3600000) return `${Math.round(ms / 60000)}m`;
  return `${Math.round(ms / 3600000)}h`;
}

// ============================================================================
// Number Formatting Utilities
// ============================================================================

/**
 * Format a number with K/M suffix for large numbers
 * e.g., 1500 -> "1.5K", 2500000 -> "2.5M"
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

// ============================================================================
// Date Input Formatting
// ============================================================================

/**
 * Format a date string to YYYY-MM-DD format for date inputs
 */
export function formatDateForInput(dateStr: string | undefined | null): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toISOString().split('T')[0];
  } catch {
    return '';
  }
}

// ============================================================================
// Date Manipulation Utilities
// ============================================================================

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get a date string (YYYY-MM-DD) for a number of days from today
 * Positive values = future, negative values = past
 */
export function getDaysFromToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * Get yesterday's date in YYYY-MM-DD format
 */
export function getYesterday(): string {
  return getDaysFromToday(-1);
}

/**
 * Get tomorrow's date in YYYY-MM-DD format
 */
export function getTomorrow(): string {
  return getDaysFromToday(1);
}

/**
 * Get a date string (YYYY-MM-DD) for a number of days ago
 * @param days - number of days in the past
 */
export function getDaysAgo(days: number): string {
  return getDaysFromToday(-days);
}

/**
 * Get a date string for a number of months ago/ahead
 * Positive values = future, negative values = past
 */
export function getMonthsFromToday(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
}

/**
 * Get first day of current month in YYYY-MM-DD format
 */
export function getFirstDayOfMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
}

/**
 * Get first day of a specific month relative to current month
 * @param monthOffset - 0 for current month, -1 for last month, etc.
 */
export function getFirstDayOfMonthOffset(monthOffset: number): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + monthOffset, 1).toISOString().split('T')[0];
}

/**
 * Get last day of a specific month relative to current month
 * @param monthOffset - 0 for current month, -1 for last month, etc.
 */
export function getLastDayOfMonthOffset(monthOffset: number): string {
  const now = new Date();
  // Day 0 of next month = last day of specified month
  return new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 0).toISOString().split('T')[0];
}

/**
 * Get the user's timezone
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Get current hour (0-23)
 */
export function getCurrentHour(): number {
  return new Date().getHours();
}

/**
 * Get current timestamp as ISO string
 */
export function getCurrentISOTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Convert a date string to ISO timestamp
 */
export function toISOTimestamp(dateStr: string): string {
  return new Date(dateStr).toISOString();
}

/**
 * Generate a filename-safe date string for exports
 * @param prefix - optional prefix for the filename
 * @param extension - file extension (without dot)
 */
export function generateDateFilename(prefix: string, extension: string): string {
  return `${prefix}_${getToday()}.${extension}`;
}

// ============================================================================
// Date Range Utilities
// ============================================================================

/**
 * Get date range for last N days (including today)
 */
export function getLastNDaysRange(days: number): DateRangeResult {
  return {
    fromDate: getDaysAgo(days),
    toDate: getToday(),
  };
}

/**
 * Get date range for current month
 */
export function getCurrentMonthRange(): DateRangeResult {
  return {
    fromDate: getFirstDayOfMonth(),
    toDate: getToday(),
  };
}

/**
 * Get date range for previous month
 */
export function getPreviousMonthRange(): DateRangeResult {
  return {
    fromDate: getFirstDayOfMonthOffset(-1),
    toDate: getLastDayOfMonthOffset(-1),
  };
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate time format (HH:mm or HH:mm:ss)
 */
export function isValidTimeFormat(time: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/.test(time);
}

/**
 * Check if a date string is valid
 */
export function isValidDate(dateStr: string | undefined | null): boolean {
  return parseDate(dateStr) !== null;
}
