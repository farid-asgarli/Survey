import { Tuple, DefaultMantineColor } from '@mantine/core';
import { ExtendedColorPalette } from './ThemeConfig';

type ExtendedCustomColors = keyof typeof ExtendedColorPalette | DefaultMantineColor;

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<ExtendedCustomColors, Tuple<string, 10>>;
  }
}
