import { DataTableHeaderCellProps } from '../types';
import clsx from 'clsx';
import styles from './HeaderCell.module.scss';
import { Box } from '@mantine/core';

export default function HeaderCell({ children, ...props }: DataTableHeaderCellProps) {
  return (
    <Box
      {...props}
      className={clsx(styles['data-table_header-cell'], props.className)}
      sx={(theme) => ({
        color: theme.colorScheme === 'dark' ? theme.colors.gray[5] : theme.colors.dark[4],
        fontSize: theme.fontSizes.md,
        padding: theme.spacing.xs,
        fontWeight: 500,
        background: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[2],
      })}
    >
      <div className={styles.content}>{children}</div>
    </Box>
  );
}
