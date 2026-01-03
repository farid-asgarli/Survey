// Template utilities and category definitions

import { MessageSquare, Users, FlaskConical, CalendarDays, GraduationCap, Megaphone, HeartPulse, FolderOpen, type LucideIcon } from 'lucide-react';
import type { TemplateCategory } from '@/types';

export interface CategoryInfo {
  value: TemplateCategory | 'all';
  label: string;
  icon: LucideIcon;
  color: string;
}

export const TEMPLATE_CATEGORIES: CategoryInfo[] = [
  { value: 'all', label: 'All Categories', icon: FolderOpen, color: 'text-on-surface-variant' },
  { value: 'feedback', label: 'Feedback', icon: MessageSquare, color: 'text-primary' },
  { value: 'hr', label: 'HR & Culture', icon: Users, color: 'text-secondary' },
  { value: 'research', label: 'Research', icon: FlaskConical, color: 'text-tertiary' },
  { value: 'events', label: 'Events', icon: CalendarDays, color: 'text-warning' },
  { value: 'education', label: 'Education', icon: GraduationCap, color: 'text-info' },
  { value: 'marketing', label: 'Marketing', icon: Megaphone, color: 'text-error' },
  { value: 'healthcare', label: 'Healthcare', icon: HeartPulse, color: 'text-success' },
  { value: 'other', label: 'Other', icon: FolderOpen, color: 'text-on-surface-variant' },
];

export function getCategoryInfo(category: TemplateCategory | 'all'): CategoryInfo {
  return TEMPLATE_CATEGORIES.find((c) => c.value === category) || TEMPLATE_CATEGORIES[0];
}

export function getCategoryOptions() {
  return TEMPLATE_CATEGORIES.filter((c) => c.value !== 'all').map((c) => ({
    value: c.value,
    label: c.label,
  }));
}

export function formatQuestionCount(count: number): string {
  return count === 1 ? '1 question' : `${count} questions`;
}

export function formatUsageCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k uses`;
  }
  return count === 1 ? '1 use' : `${count} uses`;
}
