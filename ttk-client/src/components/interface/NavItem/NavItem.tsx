import Ripple from '@src/primitives/Ripple/Ripple';
import styles from './NavItem.module.scss';
import { NavLink } from 'react-router-dom';
import { NavItemProps } from '@src/configs/routing/RoutingUtils';
import clsx from 'clsx';
import { KeyCodes } from '@src/static/keyboard';
import { Icon } from '@src/components/icons';
import { observer } from 'mobx-react-lite';
import { useStore } from '@src/store';
import { Text, Tooltip } from '@mantine/core';
import { router } from '@src/configs/routing/RoutingProvider';
import { useTheme } from '@src/hooks/app/use-theme';

function NavItem({ path, icon, title, expanded }: NavItemProps & { expanded?: boolean }) {
  const { sidebarExpanded } = useStore('misc');
  const { theme, colorScheme } = useTheme();

  return (
    <Ripple>
      {(elements, onClick) => {
        const item = (
          <NavLink
            onKeyDown={(e) => {
              if (e.key === KeyCodes.Space) router.navigate(path);
            }}
            onMouseDown={onClick}
            to={path}
            style={{
              color: colorScheme === 'light' ? theme.colors.dark[3] : theme.colors.gray[3],
            }}
            className={({ isActive }) => clsx(styles['side-menu-item'], expanded && styles.expanded, isActive && styles['active'])}
          >
            <div className={styles.inner}>
              <div className={styles['icon-wrapper']}>{icon && <Icon color="currentColor" name={icon} size="1.4rem" />}</div>
              <Text span className={styles.content}>
                {title}
              </Text>
            </div>
            {elements}
          </NavLink>
        );

        if (sidebarExpanded) return item;

        return (
          <Tooltip
            position="right"
            offset={15}
            openDelay={300}
            transitionProps={{
              transition: 'fade',
            }}
            label={title}
          >
            {item}
          </Tooltip>
        );
      }}
    </Ripple>
  );
}
export default observer(NavItem);
