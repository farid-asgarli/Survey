import { Title } from '@mantine/core';
import { useGetBreadcrumbs } from '@src/hooks/app/use-get-breadcrumbs';
import { observer } from 'mobx-react-lite';
import { useStore } from '@src/store';
import clsx from 'clsx';
import { Breadcrumbs } from './Breadcrumbs/Breadcrumbs';
import Utilities from './Utilities/Utilities';
import styles from './Header.module.scss';
import { useTheme } from '@src/hooks/app/use-theme';

function Header() {
  const breadcrumbs = useGetBreadcrumbs();
  const {
    misc: { sidebarExpanded },
  } = useStore();
  const { theme, colorScheme } = useTheme();

  return (
    <header className={clsx(styles.page_header, sidebarExpanded && styles.collapsed)}>
      <div className={styles.inner}>
        <div className={styles['section-left']}>
          <Breadcrumbs items={breadcrumbs} />
          {breadcrumbs && (
            <Title
              style={{
                color: colorScheme === 'dark' ? theme.colors.gray[4] : theme.colors.navyBlue[5],
              }}
              fz={30}
              order={1}
            >
              {breadcrumbs[breadcrumbs.length - 1].title}
            </Title>
          )}
        </div>
        <Utilities />
      </div>
    </header>
  );
}
export default observer(Header);
