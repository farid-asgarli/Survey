import { Grid, Group, Loader, Paper, Switch, Text, Title, rem } from '@mantine/core';
import { Icon } from '@src/components/icons';
import { useTheme } from '@src/hooks/app/use-theme';
import { getIf } from '@src/utils/get-if';
import { useState } from 'react';

interface AccessCardProps {
  normalizedName: string;
  description: string;
  hasBorder?: boolean;
  isChecked: boolean;
  onUpdate: (val: boolean) => Promise<void>;
  disabled?: boolean;
}

export function AccessCard(props: AccessCardProps) {
  const { theme, colors } = useTheme();
  const [progressing, setIsProgressing] = useState(false);

  async function onAccessUpdate(e: React.ChangeEvent<HTMLInputElement>) {
    const isChecked = e.currentTarget.checked;

    try {
      setIsProgressing(true);
      await props.onUpdate?.(isChecked);
    } finally {
      setIsProgressing(false);
    }
  }

  return (
    <Paper
      radius={0}
      px={10}
      py={15}
      style={{
        borderBottom: getIf(!!props.hasBorder, '0.0625rem solid #dee2e6'),
        opacity: getIf(!!props.disabled, 0.5),
      }}
    >
      {/* <label htmlFor={title} style={{ cursor: 'pointer' }}> */}
      <Grid align="center">
        <Grid.Col span={5}>
          <Title order={6} truncate>
            {props.normalizedName}
          </Title>
        </Grid.Col>
        <Grid.Col span={5}>
          <Text fz={theme.fontSizes.sm} color={colors.accessCard.color}>
            {props.description}
          </Text>
        </Grid.Col>
        <Grid.Col span={2}>
          <Group position="center">
            <Switch
              disabled={props.disabled}
              id={props.normalizedName}
              checked={props.isChecked}
              onChange={onAccessUpdate}
              color="teal"
              size="md"
              styles={{
                track: {
                  cursor: 'pointer',
                },
              }}
              thumbIcon={
                progressing ? (
                  <Loader size={16} variant="oval" />
                ) : props.isChecked ? (
                  <Icon name="Check" style={{ width: rem(12), height: rem(12) }} color={colors.accessCard.switch.checkIcon} />
                ) : (
                  <Icon name="Close" style={{ width: rem(12), height: rem(12) }} color={colors.accessCard.switch.closeIcon} />
                )
              }
            />
          </Group>
        </Grid.Col>
      </Grid>
      {/* </label> */}
    </Paper>
  );
}
