import AppLogo from '../Logo/AppLogo';
import NavItem from '../NavItem/NavItem';
import clsx from 'clsx';
import styles from './Aside.module.scss';
import { observer } from 'mobx-react-lite';
import { useStore } from '@src/store';
import Avatar from '../Avatar/Avatar';
import { Text, useMantineColorScheme, useMantineTheme } from '@mantine/core';

// // TODO Fix bounce when side menu expands/collapses
function Aside() {
  const {
    misc: { sidebarExpanded },
    user: { appUser },
    routing: { navItems },
  } = useStore();

  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  const textColor = colorScheme === 'light' ? theme.colors.dark[4] : undefined;

  return (
    <aside
      style={{
        background: colorScheme === 'light' ? theme.white : undefined,
      }}
      className={clsx(styles.aside, sidebarExpanded && styles.expanded)}
    >
      <div className={styles['section-top']}>
        <AppLogo
          style={{
            color: colorScheme === 'light' ? theme.colors.dark[4] : theme.colors.gray[4],
          }}
          expanded={sidebarExpanded}
        />
      </div>
      <div className={styles['section-mid']}>
        <nav className={styles.menu}>
          {navItems.map((it, i) => (
            <NavItem expanded={sidebarExpanded} key={i} {...it} />
          ))}
        </nav>
      </div>
      <div className={styles['section-bottom']}>
        <div className={styles['profile-box']}>
          <Avatar size={48} />
          <div className={styles['profile-content']}>
            <Text
              style={{
                color: textColor,
              }}
              span
              className={styles['profile-name']}
              title={appUser?.fullName}
            >
              {appUser?.fullName}
            </Text>
            <Text
              style={{
                color: textColor,
              }}
              span
              className={styles['profile-description']}
            >
              {appUser?.position}
            </Text>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default observer(Aside);
