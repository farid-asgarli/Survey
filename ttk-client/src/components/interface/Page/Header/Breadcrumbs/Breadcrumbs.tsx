import styles from './Breadcrumbs.module.scss';
import { BreadcrumbItem } from '@src/configs/routing/RoutingUtils';
import { NavLink } from 'react-router-dom';
import { Text } from '@mantine/core';
import { useTheme } from '@src/hooks/app/use-theme';

export function Breadcrumbs({ items }: { items: Array<BreadcrumbItem> | null }) {
  const { theme, colorScheme } = useTheme();
  if (!items) return null;

  return (
    <ul className={styles.page_header_breadcrumbs}>
      {items.map((it, i) => (
        <li key={i} className={styles.item} color={colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[9]}>
          {items.length - 1 === i ? (
            <Text span className={styles['item-current']}>
              {it.title}
            </Text>
          ) : (
            <NavLink className={styles['item-link']} to={it.path} children={it.title} />
          )}
          {i !== items.length - 1 && (
            <Text span role="presentation" className={styles['item-divider']}>
              /
            </Text>
          )}
        </li>
      ))}
    </ul>
  );
}
