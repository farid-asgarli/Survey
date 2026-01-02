import { DataTableBodyCellProps } from '../types';
import clsx from 'clsx';
import styles from './BodyCell.module.scss';
import { Box } from '@mantine/core';

export default function BodyCell({ children, ...props }: DataTableBodyCellProps) {
  return (
    <Box
      {...props}
      className={clsx(styles['data-table_body-cell'], props.className)}
      sx={(theme) => ({
        color: theme.colorScheme === 'light' ? theme.colors.gray[7] : undefined,
        fontSize: theme.fontSizes.sm,
        padding: theme.spacing.xs,
        fontWeight: 500,
      })}
    >
      <div className={styles.content}>{children}</div>
    </Box>
  );
}
