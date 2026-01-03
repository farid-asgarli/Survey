// Centralized Question Editor Style Options
// Rating styles, Yes/No styles, and scale options for question editors

import type { LucideIcon } from 'lucide-react';
import { Star, Heart, ThumbsUp, Smile, Hash, Type, ToggleLeft, Check } from 'lucide-react';
import { RatingStyle, YesNoStyle } from '@/types/enums';

// ============ Types ============
export interface StyleOption<T> {
  value: T;
  label: string;
  icon: LucideIcon;
}

// ============ Rating Style Options ============
export const RATING_STYLE_OPTIONS: StyleOption<RatingStyle>[] = [
  { value: RatingStyle.Stars, label: 'Stars', icon: Star },
  { value: RatingStyle.Hearts, label: 'Hearts', icon: Heart },
  { value: RatingStyle.Thumbs, label: 'Thumbs', icon: ThumbsUp },
  { value: RatingStyle.Smileys, label: 'Smileys', icon: Smile },
  { value: RatingStyle.Numbers, label: 'Numbers', icon: Hash },
];

// ============ Yes/No Style Options ============
export const YES_NO_STYLE_OPTIONS: StyleOption<YesNoStyle>[] = [
  { value: YesNoStyle.Text, label: 'Text', icon: Type },
  { value: YesNoStyle.Thumbs, label: 'Thumbs', icon: ThumbsUp },
  { value: YesNoStyle.Toggle, label: 'Toggle', icon: ToggleLeft },
  { value: YesNoStyle.CheckX, label: 'Check/X', icon: Check },
];

// ============ Rating Scale Options ============
export const RATING_SCALE_OPTIONS = [3, 4, 5, 7, 10] as const;
export type RatingScaleValue = (typeof RATING_SCALE_OPTIONS)[number];

// ============ Helper Functions ============

/**
 * Get rating style option by value
 */
export function getRatingStyleOption(value: RatingStyle): StyleOption<RatingStyle> | undefined {
  return RATING_STYLE_OPTIONS.find((option) => option.value === value);
}

/**
 * Get yes/no style option by value
 */
export function getYesNoStyleOption(value: YesNoStyle): StyleOption<YesNoStyle> | undefined {
  return YES_NO_STYLE_OPTIONS.find((option) => option.value === value);
}

/**
 * Get rating style icon
 */
export function getRatingStyleIcon(value: RatingStyle): LucideIcon {
  return getRatingStyleOption(value)?.icon ?? Star;
}

/**
 * Get yes/no style icon
 */
export function getYesNoStyleIcon(value: YesNoStyle): LucideIcon {
  return getYesNoStyleOption(value)?.icon ?? Type;
}
