import { Group } from '@mantine/core';
import { Icon } from '@src/components/icons';

export const MenuItems = {
  view: (
    <Group>
      <Icon color="var(--mantine-color-indigo-5)" name="View" /> Baxış
    </Group>
  ),
  edit: (
    <Group>
      <Icon color="var(--mantine-color-orange-5)" name="Pencil" /> Düzəliş
    </Group>
  ),
  remove: (
    <Group>
      <Icon color="var(--mantine-color-red-5)" name="Trash" /> Sil
    </Group>
  ),
};
