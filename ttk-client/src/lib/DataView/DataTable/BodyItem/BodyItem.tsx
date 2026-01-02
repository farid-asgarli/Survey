import { DataTableRootProps } from '../types';
import styles from './BodyItem.module.scss';
import clsx from 'clsx';

export default function BodyItem(props: DataTableRootProps) {
  return <div {...props} className={clsx(styles['data-table_body-item'], props.className)} />;
}
