import { BoxProps, CardSectionProps } from '@mantine/core';
import { AppIcon } from '@src/components/icons';

export interface DetailedViewItemProps {
  title?: React.ReactNode;
  value?: React.ReactNode;
  icon?: AppIcon;
  rootProps?: import('@mantine/utils').PolymorphicComponentProps<'div', CardSectionProps>;
}

interface GroupedViewProps {
  title?: React.ReactNode;
  items: Array<DetailedViewItemProps>;
}

interface SegmentedViewProps {
  title?: React.ReactNode;
  groups: Array<GroupedViewProps>;
}

export interface DetailedViewContainerProps {
  segments?: Array<SegmentedViewProps>;
  groups?: Array<GroupedViewProps>;
}

export interface DetailedViewGroupProps {
  title: React.ReactNode;
  items: Array<DetailedViewItemProps>;
  rootProps?: import('@mantine/utils').PolymorphicComponentProps<'div', BoxProps>;
}
