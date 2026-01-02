import { Group, Title } from '@mantine/core';
import { Paper, Stack } from '@mantine/core';
import { Icon } from '@src/components/icons';
import { cssVar } from '@src/utils/css';
import styles from './Common.module.scss';

export default function NoResultElement() {
  return (
    <Paper radius="md" className={styles['no-result_view']}>
      <Stack align="center">
        <Group>
          <Icon color={cssVar('mantine-color-gray-5')} size="2rem" name="SearchOff" />
          <Title fw={600} order={3}>
            Nəticə tapılmadı
          </Title>
        </Group>
      </Stack>
    </Paper>
  );
}
