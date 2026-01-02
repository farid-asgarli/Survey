import { Group, Paper, Stack, Text, Title } from '@mantine/core';
import LazyAvatar from '@src/components/interface/LazyProfileImage/LazyAvatar';
import { useTheme } from '@src/hooks/app/use-theme';

export function UserCard({
  userInitials,
  position,
  email,
  username,
}: {
  userInitials: string[];
  position: string;
  email: string;
  username: string;
}) {
  const { theme, colors } = useTheme();

  return (
    <Paper radius="lg" withBorder py={10} px={15}>
      <Group>
        <LazyAvatar userInitials={userInitials} username={username} />
        <Stack spacing={5}>
          <Title order={4}>{userInitials.join(' ')}</Title>
          <Text color={colors.userCard.color} fz={theme.fontSizes.sm}>
            {position}
          </Text>
        </Stack>
        <Text ml="auto">{email}</Text>
      </Group>
    </Paper>
  );
}
