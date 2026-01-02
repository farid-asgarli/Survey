import { useStore } from '@src/store';
import { observer } from 'mobx-react-lite';
import { AvatarProps, Avatar as MantineAvatar, Text } from '@mantine/core';
import Environment from '@src/static/env';
import { EmptyStr } from '@src/static/string';

function Avatar(props: import('@mantine/utils').PolymorphicComponentProps<'a', AvatarProps>) {
  const { appUser } = useStore('user');
  return (
    <MantineAvatar
      component="a"
      target="_blank"
      href={Environment.PROFILE_URI}
      alt={appUser?.fullName}
      src={appUser?.imageUrl}
      color="cyan"
      radius="xl"
      {...props}
    >
      <Text color="primary">
        {appUser?.fullName
          ?.split(' ')
          .map((it) => it?.[0])
          .join(EmptyStr)}
      </Text>
    </MantineAvatar>
  );
}
export default observer(Avatar);
