import { MantineProviderProps } from '@mantine/core';
import Environment from '@src/static/env';
import { createPalette } from '@src/utils/theming';

const defaultSelectTransition = { transition: 'pop', duration: 200, timingFunction: 'ease' };

const baseColor = Environment.APP_ACCENT_COLOR;

export const ExtendedColorPalette = {
  primary: createPalette(baseColor),
  navyBlue: createPalette('#1b254b'),
};

// // TODO Command center (Ctrl + K)
export const MantineThemeConfig: Omit<MantineProviderProps, 'children'> = {
  withCSSVariables: true,
  withGlobalStyles: true,
  theme: {
    components: {
      Alert: {
        defaultProps: {
          radius: 'md',
        },
      },
      Text: {
        defaultProps: {
          ff: 'inherit',
        },
      },
      DatePickerInput: {
        defaultProps: {
          popoverProps: {
            withinPortal: true,
            radius: 'lg',
            transitionProps: {
              transition: 'pop',
            },
          },
        },
      },
      Select: {
        defaultProps: {
          transitionProps: defaultSelectTransition,
          data: [],
        },
      },
      MultiSelect: {
        defaultProps: {
          transitionProps: defaultSelectTransition,
          data: [],
        },
      },
      Button: {
        defaultProps: {
          radius: 'lg',
        },
      },
      Input: {
        defaultProps: {
          radius: 'md',
          variant: 'filled',
        },
        styles: (theme) => ({
          input: {
            borderColor: theme.colorScheme === 'light' ? theme.colors.gray[4] : undefined,
          },
        }),
      },
    },
    colors: ExtendedColorPalette,
    primaryColor: 'primary',
  },
};
