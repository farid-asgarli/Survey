import { Icon } from '@src/components/icons';
import styles from './ListItem.module.scss';
import { Badge, Box, Paper, Text, Tooltip } from '@mantine/core';
import IconButton from '@src/components/interface/IconButton/IconButton';
import clsx from 'clsx';
import React from 'react';
import { DataListItemPairProps, DataListItemProps } from '../types';
import { useTheme } from '@src/hooks/app/use-theme';

function Pair(props: DataListItemPairProps) {
  const { colorScheme, theme } = useTheme();

  return (
    <div className={styles.pair}>
      <span className={styles['pair-title']}>{props.title}</span>
      <Text
        style={{
          color: colorScheme === 'light' ? theme.colors.gray[7] : undefined,
        }}
        span
        className={styles['pair-value']}
      >
        {props.value}
      </Text>
    </div>
  );
}

export default function ListItem({
  itemProps,
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & { itemProps: DataListItemProps }) {
  const { colorScheme, theme } = useTheme();

  return (
    <Paper radius="lg" className={clsx(styles['data-list_item'], className)} {...props}>
      <div className={styles.inner}>
        {itemProps.icon && <Icon color={theme.colors.teal[5]} className={styles['media-icon']} size="1.3rem" name={itemProps.icon} />}
        {itemProps.leftSection && <Box mr={theme.spacing.sm}>{itemProps.leftSection}</Box>}
        <div className={styles['inner-left']}>
          <div className={styles.section}>
            {itemProps.title && (
              <div className={styles['section-top']}>
                <h5 onClick={itemProps.onTitleClick} className={clsx(styles.title, { [styles.clickable]: !!itemProps.onTitleClick })}>
                  {itemProps.title}
                </h5>
              </div>
            )}
            <div className={styles['section-mid']}>
              {itemProps.pairs?.map((it, i) => (
                <Pair key={i} {...it} />
              ))}
            </div>
            <div className={styles['section-bottom']}>
              {itemProps.badges?.map((it, i) => {
                if (React.isValidElement(it))
                  return React.cloneElement(it, {
                    key: i,
                  });
                return (
                  <Badge
                    key={i}
                    color="gray"
                    styles={{
                      root: {
                        background: colorScheme === 'light' ? theme.colors.gray[2] : undefined,
                      },
                      inner: {
                        color: colorScheme === 'light' ? theme.colors.gray[6] : undefined,
                      },
                    }}
                    variant="filled"
                    {...it}
                  />
                );
              })}
            </div>
          </div>
        </div>
        <div className={styles['inner-right']}>
          {itemProps.actions?.map(({ icon, label, ...it }, i) => (
            <Tooltip key={i} offset={10} label={label}>
              <Box>
                <IconButton title={label} variant="light" size="lg" {...it}>
                  <Icon name={icon} />
                </IconButton>
              </Box>
            </Tooltip>
          ))}
        </div>
      </div>
    </Paper>
  );
}
