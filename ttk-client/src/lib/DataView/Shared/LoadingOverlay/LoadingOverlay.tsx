import { Group, Loader, LoadingOverlayProps, LoadingOverlay as MantineLoadingOverlay, Title } from '@mantine/core';

export default function LoadingOverlay(
  props: LoadingOverlayProps & {
    hasFilters?: boolean;
  }
) {
  return (
    <MantineLoadingOverlay
      radius="md"
      loader={
        <Group>
          <Loader size="sm" variant="oval" />
          <Title fw={600} order={3}>
            Nəticələr yüklənir ...
          </Title>
        </Group>
      }
      overlayBlur={1}
      {...props}
    />
  );
}
