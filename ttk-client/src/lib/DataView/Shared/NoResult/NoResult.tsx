import { Group, Paper, Stack, Text, Title } from '@mantine/core';
import styles from './NoResult.module.scss';
import { Icon } from '@src/components/icons';
import { cssVar } from '@src/utils/css';
import Button from '@src/components/interface/Button/Button';

export default function NoResult(props: { visible: boolean; resetFilters?: () => void }) {
  if (!props.visible) return;

  const hasFilters = !!props.resetFilters;
  return (
    <Paper radius="md" className={styles['data-list_no-result']}>
      <Stack align="center">
        <Group>
          <Icon color={cssVar('mantine-color-gray-5')} size={'2rem'} name={hasFilters ? 'SearchOff' : 'DatabaseX'} />
          <Title fw={600} order={3}>
            {hasFilters ? 'Nəticə tapılmadı' : 'Məlumat yoxdur'}
          </Title>
        </Group>
        <Text align="center" fz="sm">
          {hasFilters ? (
            <>
              <br />
              Aşağıdaki düyməyə klikləyərək təyin olunmuş filterləri təmizləyə bilərsiniz.
            </>
          ) : (
            <>
              <br />
              'Yeni' düyməsinə klikləyərək siyahıya məlumat əlavə edə bilərsiniz.
            </>
          )}
        </Text>
        {hasFilters && (
          <Button variant="outline" color="gray" onClick={props.resetFilters} leftIcon={<Icon name="AdjustmentsCancel" />}>
            Filterləri sıfırla
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
