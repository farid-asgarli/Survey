import { Kbd, Paper, Tooltip, useMantineColorScheme } from '@mantine/core';
import { spotlight } from '@mantine/spotlight';
import { AppIcon, Icon } from '@src/components/icons';
import Avatar from '@src/components/interface/Avatar/Avatar';
import IconButton from '@src/components/interface/IconButton/IconButton';
import { useStore } from '@src/store';
import { Notifications } from '@src/utils/notification';
import React from 'react';
import styles from './Utilities.module.scss';
import { useTheme } from '@src/hooks/app/use-theme';

export default function Utilities() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const { theme } = useTheme();

  const navActions: Array<{ icon: AppIcon; title: React.ReactNode; id?: string; action?: () => void }> = [
    { icon: 'Menu', title: 'Menyu', action: () => updateSidebarExpansion(!sidebarExpanded) },
    { icon: 'Search', title: 'Axtar (Ctrl+K)', action: () => launchCommandCenter() },
    // {
    //   icon: 'Bell',
    //   title: 'Bildirişlər',
    // },
    {
      icon: colorScheme === 'dark' ? 'Sun' : 'HalfMoon',
      title: (colorScheme === 'dark' ? 'İşıq' : 'Qaranlıq') + ' rejimi',
      action: () => toggleColorScheme(),
    },
  ];

  const {
    misc: { sidebarExpanded, updateSidebarExpansion },
  } = useStore();

  function launchCommandCenter() {
    Notifications.info(
      <div style={{ marginTop: 10, lineHeight: 2 }}>
        <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> &nbsp; qısa yolundan istifadə etməklə də axtarışı aça bilərsiniz.
      </div>,
      { autoClose: 5000 }
    );
    spotlight.open();
  }

  return (
    <Paper className={styles.page_header_utilities}>
      <nav className={styles['button-nav-list']}>
        {navActions.map((it, i) => (
          <li key={i} id={it.id} className={styles['button-nav-list-item']}>
            <Tooltip
              label={it.title}
              withArrow
              position="bottom"
              offset={20}
              openDelay={1000}
              transitionProps={{
                transition: 'fade',
              }}
            >
              <IconButton
                onClick={it.action}
                style={{
                  color: colorScheme === 'dark' ? theme.colors.gray[4] : theme.colors.dark[3],
                }}
                variant="subtle"
              >
                <Icon size={'1rem'} name={it.icon} />
              </IconButton>
            </Tooltip>
          </li>
        ))}
      </nav>
      <Avatar />
    </Paper>
  );
}
