import { Box } from '@mantine/core';
import Button from '../Button/Button';
import { dialog } from '../Dialog/Dialog';

export function PermissionDialog({ content }: { content: React.ReactNode }) {
  return (
    <>
      <Box>{content}</Box>
      <Button fullWidth mt="md" onClick={() => dialog.close()}>
        Bağla
      </Button>
    </>
  );
}
