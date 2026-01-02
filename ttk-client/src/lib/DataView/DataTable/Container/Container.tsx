import { DataTableContainerProps } from '../types';
import { DataViewModel } from '../../Shared/types';
import { DataTable } from '..';
import DataContainer from '../../Shared/Container/Container';

export default function DataTableContainer<TModel extends DataViewModel>(props: DataTableContainerProps<TModel>) {
  return (
    <DataContainer
      children={(c, handleNextPageRequest) => (
        <DataTable.InnerList
          handleNextPageRequest={handleNextPageRequest}
          data={props.data}
          header={props.header}
          renderListItem={props.renderListItem}
          actions={props.actions}
        >
          {c}
        </DataTable.InnerList>
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
