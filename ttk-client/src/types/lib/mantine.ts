import { MantineSize } from '@mantine/core';

export type MantineComponentSize = MantineSize | `compact-${MantineSize}` | (string & {});
