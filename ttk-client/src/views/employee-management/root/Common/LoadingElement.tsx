import styles from './Common.module.scss';
import { Group, Loader, Paper, Stack, Title } from '@mantine/core';

export default function LoadingElement() {
  return (
    <Paper className={styles['no-result_view']}>
      <Stack align="center">
        <Group>
          <Loader size="sm" variant="oval" />
          <Title fw={600} order={3}>
            Yüklənir
          </Title>
        </Group>
      </Stack>
    </Paper>
  );
}
