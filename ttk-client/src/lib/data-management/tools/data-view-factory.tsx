import { DataListContainerProps, DataListItemProps } from '@src/lib/DataView/DataList/types';
import { DEFAULT_PAGE_SIZE } from '../static/pagination-values';
import { DataViewFilterCriteria, DataViewModel } from '@src/lib/DataView/Shared/types';
import { FilterInputObjectMapping } from '../types/filter-input-object-mapping';
import { hasValue } from '@src/utils/valueCheck';
import QueryManager from '../store/query-manager';
import DataListContainer from '@src/lib/DataView/DataList/Container/Container';
import { DataTableActions, DataTableContainerProps } from '@src/lib/DataView/DataTable/types';
import DataTableContainer from '@src/lib/DataView/DataTable/Container/Container';

export class InitDataView<TModel extends DataViewModel> {
  protected _obj: DataListContainerProps<TModel> = {} as DataListContainerProps<TModel>;
  static prepareDefaultValues<TModel extends DataViewModel>(qm: QueryManager<TModel>) {
    const records: Record<string, any> = {};
    const filters = qm.getFilter();
    for (const f of filters) {
      records[f.__binder ?? f.key] = f.value;
    }
    return records;
  }
  withData(init: {
    data?: Array<TModel>;
    pageSize?: number;
    totalCount?: number;
    onNextPageLoad?: (pageNumber: number) => Promise<any> | void;
  }) {
    this._obj['data'] = init.data;
    this._obj['pageSize'] = init.pageSize ?? DEFAULT_PAGE_SIZE;
    this._obj['totalCount'] = init.totalCount;
    this._obj['onNextPageLoad'] = init.onNextPageLoad;
    return this;
  }
  withFiltering(init: {
    inputs: FilterInputObjectMapping;
    defaultValues?: Record<keyof any, any>;
    onFilterChange?: (filterCriteria: DataViewFilterCriteria<TModel>) => Promise<void> | void;
  }) {
    if (!this._obj['filtering'])
      this._obj['filtering'] = {
        inputs: init.inputs,
      };
    else this._obj['filtering']['inputs'] = init.inputs;

    if (init.defaultValues) this._obj['filtering']['defaultValues'] = init.defaultValues;
    if (init.onFilterChange) this._obj['onFilterChange'] = init.onFilterChange;

    return this;
  }
  withUiElements(init: { isLoading?: boolean; utilitySection?: React.ReactNode }) {
    if (hasValue(init.isLoading)) this._obj.isLoading = init.isLoading;

    this._obj.utilitySection = init.utilitySection;

    return this;
  }
  withQMBindings(qm: QueryManager<TModel>) {
    this._obj['isLoading'] = qm.getFetchStatus().has('list');
    this._obj['data'] = qm.collection;
    this._obj['totalCount'] = qm.getRecordCount();
    this._obj['onFilterChange'] = qm.fetchFilters;
    this._obj['onNextPageLoad'] = qm.fetchNextPage;

    const defaultValues = (function () {
      const records: Record<string, any> = {};
      const filters = qm.getFilter();
      for (const f of filters) {
        records[f.__binder ?? f.key] = f.value;
      }
      return records;
    })();
    if (this._obj['filtering']) this._obj['filtering']['defaultValues'] = defaultValues;
    else
      this._obj['filtering'] = {
        defaultValues,
        inputs: {},
      };

    return this;
  }
}

export class InitDataViewCardList<TModel extends DataViewModel> extends InitDataView<TModel> {
  withListItem(pred: (data: TModel) => DataListItemProps) {
    (this._obj as DataListContainerProps<TModel>)['renderListItem'] = pred;
    return this;
  }
  render() {
    return <DataListContainer {...(this._obj as DataListContainerProps<TModel>)} />;
  }
}

export class InitDataViewTabularList<TModel extends DataViewModel> extends InitDataView<TModel> {
  withListItem(pred: DataTableContainerProps<TModel>['renderListItem']) {
    (this._obj as DataTableContainerProps<TModel>)['renderListItem'] = pred;
    return this;
  }

  withHeader(val: DataTableContainerProps<TModel>['header']) {
    (this._obj as DataTableContainerProps<TModel>)['header'] = val;
    return this;
  }

  withContextMenu(init: {
    actions?: (data: TModel) => Array<DataTableActions>;
    /**
     * Defines how action items should be displayed.
     * @default 'plain'
     */
    actionsPlacement?: 'plain' | 'menu';
  }) {
    (this._obj as DataTableContainerProps<TModel>)['actions'] = init.actions;
    (this._obj as DataTableContainerProps<TModel>)['actionsPlacement'] = init.actionsPlacement;
    return this;
  }

  render() {
    return <DataTableContainer {...(this._obj as DataTableContainerProps<TModel>)} />;
  }
}
