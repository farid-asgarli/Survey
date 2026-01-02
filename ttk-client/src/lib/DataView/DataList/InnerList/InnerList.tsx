import { DataListContainerProps } from '../types';
import { Virtuoso } from 'react-virtuoso';
import { DataList } from '..';
import clsx from 'clsx';
import { DataViewModel } from '../../Shared/types';

interface InnerListProps<TData extends DataViewModel> extends Pick<DataListContainerProps<TData>, 'data' | 'renderListItem'> {
  handleNextPageRequest(lastItemIndex: number): Promise<void>;
}

export default function InnerList<TData extends DataViewModel>(props: InnerListProps<TData>) {
  if (!props.data) return null;
  return (
    <Virtuoso
      data={props.data}
      computeItemKey={(index) => props.data![index].id}
      itemContent={(index, item) => (
        <DataList.ListItem key={index} className={clsx({ first: index === 0 })} itemProps={props.renderListItem(item)} />
      )}
      endReached={props.handleNextPageRequest}
      totalCount={props.data.length}
      overscan={5}
    />
  );
}
