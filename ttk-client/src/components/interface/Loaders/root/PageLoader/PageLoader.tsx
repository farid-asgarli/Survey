import { Group, Loader, LoaderProps, Title } from '@mantine/core';
import styles from './PageLoader.module.css';
import clsx from 'clsx';

interface PageLoaderProps extends JSX.CommonHTMLProps<'title'> {
  loaderProps?: LoaderProps;
}

export default function PageLoader({ className, loaderProps, title = 'Modul yüklənir ...', ...props }: PageLoaderProps) {
  return (
    <div className={clsx(styles.page_loader, className)} {...props}>
      <Group>
        <Title order={4}>{title}</Title>
        <Loader size="sm" variant="oval" {...loaderProps} />
      </Group>
    </div>
  );
}
