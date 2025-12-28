// Shared constants for DevTest sections
import type { ColorPalette, ThemeMode } from '@/stores/themeStore';
import { Sun, Moon, Monitor } from 'lucide-react';
import type { SelectOption } from '@/components/ui';

// Color palette options
export const colorPalettes: { id: ColorPalette; label: string; colors: string[] }[] = [
  { id: 'purple', label: 'Lavender', colors: ['#7c5cff', '#ede8ff', '#2a1065'] },
  { id: 'blue', label: 'Ocean', colors: ['#1976d2', '#d1e4ff', '#001d36'] },
  { id: 'green', label: 'Forest', colors: ['#2e7d32', '#d8f5dc', '#002106'] },
  { id: 'orange', label: 'Sunset', colors: ['#e65100', '#ffe4cc', '#2d1400'] },
  { id: 'pink', label: 'Rose', colors: ['#c2185b', '#ffd6e7', '#3e0018'] },
  { id: 'teal', label: 'Aqua', colors: ['#00796b', '#d0f4ef', '#002019'] },
];

// Theme mode options
export const themeModes: { id: ThemeMode; label: string; icon: typeof Sun; desc: string }[] = [
  { id: 'light', label: 'Light', icon: Sun, desc: 'Always light' },
  { id: 'dark', label: 'Dark', icon: Moon, desc: 'Always dark' },
  { id: 'system', label: 'System', icon: Monitor, desc: 'Match system' },
];

// Sample select options
export const countryOptions: SelectOption[] = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
  { value: 'br', label: 'Brazil' },
];

export const priorityOptions: SelectOption[] = [
  { value: 'low', label: 'Low Priority' },
  { value: 'medium', label: 'Medium Priority' },
  { value: 'high', label: 'High Priority' },
  { value: 'urgent', label: 'Urgent' },
];

export const categoryOptions: SelectOption[] = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'support', label: 'Technical Support' },
  { value: 'billing', label: 'Billing & Payments' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'other', label: 'Other' },
];
