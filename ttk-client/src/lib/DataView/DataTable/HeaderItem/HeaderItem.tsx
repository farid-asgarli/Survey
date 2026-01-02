import { useMantineTheme } from '@mantine/core';
import { DataTableHeaderItemProps } from '../types';
import styles from './HeaderItem.module.scss';
import clsx from 'clsx';
import { merge } from '@src/utils/merge';

export default function HeaderItem(props: DataTableHeaderItemProps) {
  const theme = useMantineTheme();
  return (
    <div
      {...props}
      className={clsx(styles['data-table_header-item'], props.className)}
      style={merge(
        // {
        //   background: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[3],
        // },
        props.style
      )}
    />
  );
}
