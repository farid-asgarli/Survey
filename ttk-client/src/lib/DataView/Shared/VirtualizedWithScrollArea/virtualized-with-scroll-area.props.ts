import { PaperProps } from '@mantine/core';
import { VirtuosoProps } from 'react-virtuoso';

export type VirtualizedViewWithScrollAreaProps<TModel> = {
  virtualListProps: VirtuosoProps<TModel, any>;
  containerProps?: PaperProps;
};
