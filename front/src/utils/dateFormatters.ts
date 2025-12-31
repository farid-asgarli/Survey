// Centralized date formatting utilities
// Provides consistent date formatting across the application

/**
 * Format a date string as "Dec 23, 2025"
 */
export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a date string as "Dec 23" (short format without year)
 */
export function formatDateShort(dateStr: string | undefined | null): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date string as "Dec 23, 2025, 3:45 PM"
 */
export function formatDateTime(dateStr: string | undefined | null): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Format a date string as "Dec 23, 3:45 PM" (without year)
 */
export function formatDateTimeShort(dateStr: string | undefined | null): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Format a date string as relative time (e.g., "5m ago", "2h ago", "3d ago")
 * For future dates: "in 5m", "in 2h", "in 3d", "in 2 months"
 * Falls back to formatted date for dates more than 1 year away
 */
export function formatRelativeTime(dateStr: string | undefined | null): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Invalid Date';

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
  if (diffMonths < 12) {
    const months = diffMonths;
    return `${prefix}${months}mo${suffix}`;
  }
  if (diffYears < 5) {
    const years = diffYears;
    const remainingMonths = diffMonths % 12;
    if (remainingMonths > 0) {
      return `${prefix}${years}y ${remainingMonths}mo${suffix}`;
    }
    return `${prefix}${years}y${suffix}`;
  }
  return formatDateTime(dateStr);
}

/**
 * Parse relative time into components for custom UI rendering
 * Returns { prefix, value, unit } for flexible display
 */
export function parseRelativeTime(dateStr: string | undefined | null): { prefix: string; value: string; unit: string } | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;

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

/**
 * Check if a date is in the past
 */
export function isPast(dateStr: string | undefined | null): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  return date.getTime() < Date.now();
}

/**
 * Check if a date is in the future
 */
export function isFuture(dateStr: string | undefined | null): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return false;
  return date.getTime() > Date.now();
}

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
 * Format a number with K/M suffix for large numbers
 * e.g., 1500 -> "1.5K", 2500000 -> "2.5M"
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

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
 * Format a date in long format: "December 24, 2025"
 */
export function formatDateLong(dateStr: string | undefined | null): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
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

export interface DateRangeResult {
  fromDate: string;
  toDate: string;
}

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
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}
