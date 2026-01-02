import clsx from 'clsx';
import styles from './Wrapper.module.css';
import { Box, BoxProps } from '@mantine/core';

import { useTheme } from '@src/hooks/app/use-theme';

export default function Wrapper({ style, ...props }: import('@mantine/utils').PolymorphicComponentProps<'div', BoxProps>) {
  const { colorScheme, theme } = useTheme();
  return (
    <Box
      style={{
        ...style,
        background: colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[1],
      }}
      className={clsx(styles.page_wrapper, props.className)}
      {...props}
    />
  );
}
