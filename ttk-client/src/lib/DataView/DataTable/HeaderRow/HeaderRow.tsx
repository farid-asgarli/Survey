import { DataTableHeaderRowProps } from '../types';
import styles from './HeaderRow.module.scss';
import clsx from 'clsx';

export default function HeaderRow(props: DataTableHeaderRowProps) {
  return <div {...props} className={clsx(styles['data-table_header-row'], props.className)} />;
}
