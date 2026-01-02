import { useRouteError } from 'react-router-dom';
import styles from './Error.module.scss';
import { Alert, Code, Paper, Text } from '@mantine/core';
import { Icon } from '@src/components/icons';
import AppLogo from '@src/components/interface/Logo/AppLogo';
import Environment from '@src/static/env';
import { AppIllustrations } from '@src/components/illustrations';
import { useTheme } from '@src/hooks/app/use-theme';
import clsx from 'clsx';

export default function Error() {
  const { colorScheme, theme } = useTheme();

  const error = useRouteError();

  return (
    <Paper
      style={{
        background: colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[1],
      }}
      className={styles.error_boundary}
    >
      <div className={styles.inner}>
        <div className={styles.left}>
          <div className={styles['logo-wrapper']}>
            <AppLogo
              style={{
                color: colorScheme === 'light' ? theme.colors.navyBlue[5] : undefined,
              }}
              width={120}
              className={styles.logo}
            />
          </div>
          <div className={styles['title-wrapper']}>
            <h1
              className={clsx(styles.title, 'colored')}
              dangerouslySetInnerHTML={{
                __html: Environment.APP_DESCRIPTION,
              }}
            />
            <h1 className={styles.title}>Paneli</h1>
          </div>
          <Alert
            w="80%"
            icon={
              <Icon
                size={50}
                style={{
                  marginTop: 5,
                }}
                name="AlertCircle"
              />
            }
            title="Proqram daxili xəta"
            color="red.6"
            styles={{
              label: {
                fontSize: theme.fontSizes.md,
              },
              message: {
                fontSize: theme.fontSizes.sm,
                color: colorScheme === 'dark' ? theme.colors.dark[5] : undefined,
              },
              root: {
                background: theme.colors.red[1],
              },
            }}
          >
            <Text>
              <Text mb={15}>Xəta baş verdi. Zəhmət olmasa administratorla əlaqə saxlayın. Məzmun:</Text>
              <Code>{(error as Error)?.message}</Code>
            </Text>
          </Alert>
        </div>
        <div className={styles.right}>
          <AppIllustrations.Warning width="70%" height="70%" />
        </div>
      </div>
    </Paper>
  );
}
