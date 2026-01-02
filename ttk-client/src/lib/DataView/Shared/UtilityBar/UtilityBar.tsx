import { Divider } from '@mantine/core';
import styles from './UtilityBar.module.scss';

export default function UtilityBar(props: { dataCount?: number; right?: React.ReactNode }) {
  return (
    <div className={styles['list-utility-bar']}>
      <div className={styles.inner}>
        {!!props.dataCount && <span className={styles['data-info']}>{props.dataCount} nəticə</span>}
        <Divider w="100%" my={28} size="xs" />
        {props.right}
      </div>
    </div>
  );
}
