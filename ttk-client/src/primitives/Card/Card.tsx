import clsx from 'clsx';
import styles from './Card.module.scss';
import { Paper, Title } from '@mantine/core';
import { useTheme } from '@src/hooks/app/use-theme';

export interface CardProps extends JSX.CommonHTMLProps<'children'> {
  title?: React.ReactNode;
  header?: React.ReactNode;
  fullSize?: boolean;
}

export default function Card({ title, children, className, header, fullSize, ...props }: CardProps) {
  const { colorScheme, theme } = useTheme();

  return (
    <Paper radius="lg" className={clsx(styles.card, fullSize && styles['full-size'], className)} {...props}>
      {(title || header) && (
        <div className={styles['header']}>
          {title && (
            <Title
              className={styles['header-title']}
              ff="inherit"
              style={{
                color: colorScheme === 'dark' ? theme.colors.gray[4] : theme.colors.navyBlue[5],
                fontSize: theme.fontSizes.xl,
              }}
              order={1}
            >
              {title}
            </Title>
          )}
          {header}
        </div>
      )}
      <div className={styles.body}>{children}</div>
    </Paper>
  );
}
