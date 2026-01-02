import clsx from 'clsx';
import { useLocation } from 'react-router-dom';
import styles from './Body.module.scss';

export default function Body({ className, ...props }: JSX.IntrinsicElements['div']) {
  const { pathname } = useLocation();
  return <div key={pathname} className={clsx(styles.page_body, className)} {...props}></div>;
}
