import Transition from '@src/components/interface/Transition/Transition';
import styles from './ProgressBar.module.scss';
import clsx from 'clsx';

interface ProgressBarProps extends React.ComponentProps<'div'> {
  visible?: boolean;
}

export default function ProgressBar({ visible = true, className, children, ...props }: ProgressBarProps) {
  return (
    <Transition visible={visible}>
      <div className={clsx(styles.progress_bar, className)} {...props}>
        <div className={styles.animator} />
      </div>
    </Transition>
  );
}
