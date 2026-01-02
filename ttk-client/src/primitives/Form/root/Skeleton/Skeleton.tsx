import { Skeleton as MantineSkeleton } from '@mantine/core';
import { Form } from '../..';
import styles from './Skeleton.module.scss';

export default function Skeleton() {
  return (
    <Form.Element>
      <MantineSkeleton animate={false} className={styles.form_skeleton} />
    </Form.Element>
  );
}
