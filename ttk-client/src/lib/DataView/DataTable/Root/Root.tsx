import { DataTableRootProps } from '../types';
import styles from './Root.module.scss';
import clsx from 'clsx';

export default function Root(props: DataTableRootProps) {
  return <div {...props} className={clsx(styles['data-table_root'], props.className)} />;
}
