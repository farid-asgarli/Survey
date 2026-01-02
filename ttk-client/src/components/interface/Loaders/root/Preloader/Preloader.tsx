import styles from './Preloader.module.scss';
import Particles, { ParticlesRef } from './particles';
import AppLogo from '@src/components/interface/Logo/AppLogo';
import clsx from 'clsx';
import Button from '@src/components/interface/Button/Button';
import { EmptyStr } from '@src/static/string';
import { Loaders } from '@src/components/interface/Loaders';
import { Icon } from '@src/components/icons';
import Environment from '@src/static/env';
import { Paper, Text, Transition } from '@mantine/core';
import { useEffect, useRef } from 'react';
import { useTheme } from '@src/hooks/app/use-theme';

interface PreloaderProps {
  htmlProps?: JSX.IntrinsicElements['div'];
  visible?: boolean;
  fetchStatus?: { result: 'success' | 'error'; message: string; retry?: boolean };
  onRetryButtonClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
}

export default function Preloader({ fetchStatus, htmlProps, onRetryButtonClick, visible }: PreloaderProps) {
  const particlesRef = useRef<ParticlesRef | null>(null);
  const { theme, colorScheme } = useTheme();

  useEffect(() => {
    if (!visible) particlesRef.current?.dispose();
  }, [visible]);

  function assignPreloaderColor() {
    if (fetchStatus?.result !== 'error') return colorScheme === 'light' ? theme.colors.primary[5] : theme.colors.dark[8];
    return colorScheme === 'light' ? theme.colors.gray[5] : theme.colors.gray[8];
  }

  const leftPane = (
    <div
      style={{
        background: assignPreloaderColor(),
      }}
      className={styles['left-pane']}
    >
      <Paper className={styles.card}>
        <div className={styles['card-inner']}>
          <div className={styles['top-panel']}>
            <div className={styles['logo-wrapper']}>
              <AppLogo
                style={{
                  color: colorScheme === 'light' ? theme.colors.navyBlue[5] : undefined,
                }}
                width={120}
                className={styles.logo}
              />
            </div>
          </div>
          <div className={styles['mid-panel']}>
            <div className={styles['title-wrapper']}>
              <h1 className={clsx(styles.title, styles.colored)} dangerouslySetInnerHTML={{ __html: Environment.APP_DESCRIPTION }} />
              <h1 className={styles.title}>Paneli</h1>
            </div>
          </div>
          <div className={styles['bottom-panel']}>
            {fetchStatus?.result === 'error' && fetchStatus.retry && (
              <Button onClick={onRetryButtonClick} leftIcon={<Icon name="Reload" />} className={styles['error-button']}>
                Yenidən cəhd edin
              </Button>
            )}
            <Text
              className={clsx(styles['status-indicator'], fetchStatus?.result === 'error' && styles.danger)}
              style={{
                color: colorScheme === 'light' ? theme.colors.navyBlue[4] : undefined,
              }}
              dangerouslySetInnerHTML={{
                __html: fetchStatus?.message ?? EmptyStr,
              }}
            />
            {fetchStatus?.result !== 'error' && <Loaders.DotsLoader />}
          </div>
        </div>
      </Paper>
    </div>
  );

  const rightPane = (
    <div className={styles['right-pane']}>
      <Particles
        ref={particlesRef}
        options={{
          background: {
            color: {
              value: assignPreloaderColor(),
            },
          },
        }}
      />
    </div>
  );

  return (
    <Transition mounted={!!visible} transition="fade" duration={400} timingFunction="ease">
      {(style) => (
        <div
          {...htmlProps}
          style={{ background: assignPreloaderColor(), ...htmlProps?.style, ...style }}
          className={clsx(styles.preloader, htmlProps?.className)}
        >
          {leftPane}
          {rightPane}
        </div>
      )}
    </Transition>
  );
}
