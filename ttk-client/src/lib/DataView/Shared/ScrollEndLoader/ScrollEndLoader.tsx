import { Center, Loader } from '@mantine/core';

export default function ScrollEndLoader(props: { visible: boolean }) {
  if (!props.visible) return null;
  return (
    <Center inline>
      <Loader my={10} variant="dots" />
    </Center>
  );
}
