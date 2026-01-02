import { DataTableBodyRowProps } from '../types';
import clsx from 'clsx';
import { Box } from '@mantine/core';
import styles from './BodyRow.module.scss';

export default function BodyRow(props: DataTableBodyRowProps) {
  return (
    <Box
      {...props}
      className={clsx(styles['data-table_body-row'], props.className)}
      sx={(theme) => ({ borderRadius: theme.radius.lg, background: theme.colorScheme === 'light' ? theme.white : theme.colors.dark[7] })}
    />
  );
}
