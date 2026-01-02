import { Checkbox, Grid, Group, Paper, Stack, Text, Title } from '@mantine/core';
import LazyAvatar from '@src/components/interface/LazyProfileImage/LazyAvatar';
import { useTheme } from '@src/hooks/app/use-theme';
import { getIf } from '@src/utils/get-if';

interface ProfileCardProps {
  email: string;
  username: string;
  fullName: string;
  userInitials: string[];
  positionName: string;
  hasBorder?: boolean;
  isChecked: boolean;
  onSelect: (val: boolean) => void;
  disabled?: boolean;
}

export function ProfileCard(props: ProfileCardProps) {
  const { colors, theme } = useTheme();

  async function onAccessUpdate(e: React.ChangeEvent<HTMLInputElement>) {
    const isChecked = e.currentTarget.checked;

    props.onSelect?.(isChecked);
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
        <Grid.Col span={1}>
          <Stack>
            <LazyAvatar
              avatarProps={{
                size: 50,
              }}
              eagerLoad
              username={props.username}
              userInitials={props.userInitials}
            />
          </Stack>
        </Grid.Col>
        <Grid.Col span={5}>
          <Stack spacing={0}>
            <Title order={4} truncate>
              {props.fullName}
            </Title>
            <Text fz={theme.fontSizes.sm} color={colors.profileCard.color}>
              {props.email}
            </Text>
          </Stack>
        </Grid.Col>
        <Grid.Col span={4}>
          <Text fz={theme.fontSizes.sm} color={colors.profileCard.color}>
            {props.positionName}
          </Text>
        </Grid.Col>
        <Grid.Col span={2}>
          <Group position="center">
            <Checkbox
              styles={{
                input: {
                  cursor: 'pointer',
                },
              }}
              radius="md"
              size="md"
              onChange={onAccessUpdate}
              checked={props.isChecked}
            />
          </Group>
        </Grid.Col>
      </Grid>
      {/* </label> */}
    </Paper>
  );
}
