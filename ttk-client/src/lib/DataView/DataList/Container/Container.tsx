import { Fragment } from 'react';
import { DataList } from '..';
import { DataListContainerProps } from '../types';
import { DataViewModel } from '../../Shared/types';
import DataContainer from '../../Shared/Container/Container';

export default function DataListContainer<TData extends DataViewModel>(props: DataListContainerProps<TData>) {
  return (
    <DataContainer
      children={(c, handleNextPageRequest) => (
        <Fragment>
          <DataList.InnerList handleNextPageRequest={handleNextPageRequest} renderListItem={props.renderListItem} data={props.data} />
          {c}
        </Fragment>
      )}
      data={props.data}
      filtering={props.filtering}
      isLoading={props.isLoading}
      onNextPageLoad={props.onNextPageLoad}
      pageSize={props.pageSize}
      totalCount={props.totalCount}
      utilitySection={props.utilitySection}
      onFilterChange={props.onFilterChange}
    />
  );
}
