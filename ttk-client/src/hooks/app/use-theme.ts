import { useMantineTheme } from '@mantine/core';

export function useTheme() {
  const theme = useMantineTheme();
  const colorScheme = theme.colorScheme;

  return {
    colorScheme: theme.colorScheme,
    theme,
    colors: {
      dialog: {
        footerBg: colorScheme === 'light' ? theme.colors.gray[1] : theme.colors.dark[8],
      },
      preloader: {
        errorBg: colorScheme === 'light' ? theme.colors.primary[5] : theme.colors.dark[8],
        inProgressBg: colorScheme === 'light' ? theme.colors.gray[5] : theme.colors.gray[8],
        statusText: colorScheme === 'light' ? theme.colors.navyBlue[4] : undefined,
      },
      logo: {
        color: colorScheme === 'light' ? theme.colors.navyBlue[5] : undefined,
      },
      nav: {
        anchor: colorScheme === 'light' ? theme.colors.dark[4] : theme.colors.gray[3],
      },
      page: {
        title: colorScheme === 'light' ? theme.colors.navyBlue[5] : theme.colors.gray[4],
        wrapperBg:
          colorScheme === 'light'
            ? // theme.colors.gray[1]
              '#f3f6fc'
            : theme.colors.dark[8],
      },
      breadcrumbs: {
        item: colorScheme === 'light' ? theme.colors.gray[9] : theme.colors.dark[0],
      },
      topRightCorner: {
        item: colorScheme === 'light' ? theme.colors.dark[3] : theme.colors.gray[4],
      },
      dataList: {
        pair: colorScheme === 'light' ? theme.colors.gray[7] : undefined,
        badge: {
          bg: colorScheme === 'light' ? theme.colors.gray[2] : undefined,
          color: colorScheme === 'light' ? theme.colors.gray[6] : undefined,
        },
        bodyCell: {
          color: colorScheme === 'light' ? theme.colors.gray[7] : undefined,
        },
        bodyRow: {
          bg: colorScheme === 'light' ? theme.white : theme.colors.dark[7],
          border: colorScheme === 'light' ? '#DEE2E6' : '#373A40',
        },
        headerCell: {
          color: colorScheme === 'light' ? theme.colors.gray[7] : undefined,
          bg: colorScheme === 'light' ? theme.colors.gray[1] : theme.colors.dark[8],
        },
        headerItem: {
          bg: colorScheme === 'light' ? theme.colors.gray[1] : theme.colors.dark[8],
        },
        icon: theme.colors.teal[5],
      },
      'boxed-container': {
        title: colorScheme === 'light' ? theme.colors.navyBlue[5] : theme.colors.gray[4],
      },
      views: {
        error: {
          bg: colorScheme === 'light' ? theme.colors.gray[1] : theme.colors.dark[8],
          message: {
            color: colorScheme === 'light' ? undefined : theme.colors.dark[5],
            root: theme.colors.red[1],
          },
        },
      },
      accessCard: {
        color: colorScheme === 'light' ? theme.colors.dark[4] : undefined,
        switch: {
          checkIcon: theme.colors.teal[6],
          closeIcon: theme.colors.red[6],
        },
      },
      profileCard: {
        color: colorScheme === 'light' ? theme.colors.dark[4] : undefined,
      },
      userCard: {
        color: colorScheme === 'light' ? theme.colors.dark[4] : undefined,
      },
    },
  };
}
