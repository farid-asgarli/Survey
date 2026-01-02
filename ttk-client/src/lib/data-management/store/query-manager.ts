import { makeAutoObservable, runInAction } from 'mobx';
import Repository from './repository';
import { PagedResult } from '../types/paged-result';
import QuerySpecification from '../utility/query-specification';
import { LogicalFilterOperators } from '../utility/logical-operator';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '../static/pagination-values';
import { DataFetchStatus } from '../types/fetch-status';
import { FilterEntryWithBinding, FilterSpecification } from '../utility/filter-specification';
import { PaginationSpecification } from '../utility/pagination-specification';
import { generateUniqueId } from '@src/utils/uniqueId';

type ModelFilters<TModel> = Array<FilterEntryWithBinding<TModel>>;

/**
 * QueryManager is a class to manage queries and handle data fetching, manipulation, and pagination.
 * @template TMap The map of categories to their corresponding data types.
 */
export default class QueryManager<TModel> {
  constructor(
    repository: Repository<Record<string, TModel>>,
    endpoint: (filter?: QuerySpecification) => Promise<PagedResult<TModel>>,
    category?: string,
    logicalFilterOperator?: LogicalFilterOperators
  ) {
    // Exclude unnecessary fields
    makeAutoObservable(this, {
      _category: false,
      _endpoint: false,
      _repository: false,
    } as Record<string, boolean>);

    this._endpoint = endpoint;
    this._repository = repository;
    this._category = category ?? generateUniqueId();
    this._logicalFilterOperator = logicalFilterOperator ?? LogicalFilterOperators.AND_ALSO;
  }

  private _repository: Repository<Record<string, TModel>>;
  private _category: string;
  private _logicalFilterOperator: LogicalFilterOperators;
  private _endpoint: (filter?: QuerySpecification) => Promise<PagedResult<TModel>>;

  private _filters: ModelFilters<TModel> = [];

  private _pagination: {
    recordCount?: number;
    pageNumber?: number;
  } = {};

  private _dataFetchStatus: Set<DataFetchStatus> = new Set();

  get collection() {
    return this._repository.all(this._category);
  }

  getFilter = (): ModelFilters<TModel> => this._filters;

  getRecordCount = (): number | undefined => this._pagination?.recordCount;

  getPageNumber = (): number | undefined => this._pagination.pageNumber;

  getFetchStatus = (): Set<DataFetchStatus> => this._dataFetchStatus;

  /**
   * @param filter The filter object to update.
   */
  updateFilter = (filter: ModelFilters<TModel>) => (this._filters = filter);
  /**
   * @param count The count value or function to update the record count.
   */
  updateRecordCount = (count: number | ((prevCount: number | undefined) => number | undefined)) => {
    if (typeof count === 'function') this._pagination.recordCount = count(this._pagination.recordCount);
    else this._pagination.recordCount = count;
  };
  /**
   * @param pageNumber The page number value or function to update the page number.
   */
  updatePageNumber = (pageNumber: number | ((prevPageNumber: number | undefined) => number | undefined)) => {
    if (typeof pageNumber === 'function') this._pagination.pageNumber = pageNumber(this._pagination.pageNumber);
    else this._pagination.pageNumber = pageNumber;
  };

  updateLogicalOperator = (op: LogicalFilterOperators) => (this._logicalFilterOperator = op);

  startFetchStatus = (status: DataFetchStatus) => {
    if (this._dataFetchStatus) {
      this._dataFetchStatus = new Set(this._dataFetchStatus).add(status);
    } else this._dataFetchStatus = new Set([status]);
  };

  stopFetchStatus = (status: DataFetchStatus) => {
    if (this._dataFetchStatus) {
      const instanceCopy = new Set(this._dataFetchStatus);
      instanceCopy.delete(status);
      this._dataFetchStatus = instanceCopy;
    }
  };

  resetFilter = () => this.updateFilter([]);

  resetPageNumber = () => this.updatePageNumber(DEFAULT_PAGE_NUMBER);

  dispose = () => {
    this.resetFilter();
    this.resetPageNumber();
    this._repository.dispose(this._category);
  };

  /**
   * Fetches the default data.
   * @param spec The filter specification.
   */
  fetchDefault = async (param?: { pagination?: PaginationSpecification; filter?: FilterSpecification<TModel> }) => {
    try {
      this.startFetchStatus('list');

      const _filterSpec = param?.filter ?? new FilterSpecification({ logicalOperator: this._logicalFilterOperator });
      const _paginationSpec = param?.pagination ?? new PaginationSpecification();

      const { items, totalCount } = await this._endpoint(new QuerySpecification({ filter: _filterSpec, pagination: _paginationSpec }));

      runInAction(() => {
        this._repository.set(this._category, items);
        this.updateRecordCount(totalCount);
        this.resetFilter();
        this.resetPageNumber();
        if (_paginationSpec?.number) this.updatePageNumber(_paginationSpec?.number);
        if (_filterSpec?.entries) this.updateFilter(_filterSpec.entries as Array<FilterEntryWithBinding<TModel>>);
      });
    } finally {
      this.stopFetchStatus('list');
    }
  };

  /**
   * Fetches data only if it does not already exist in the manager.
   */
  fetchIfNotExists = async () => {
    if (!this._repository.exists(this._category)) await this.fetchDefault();
  };

  /**
   * Fetches the next page of data.
   */
  fetchNextPage = async () => {
    const filter = this.getFilter();
    const pageNumber = this.getPageNumber();
    const prevTotalCount = this.getRecordCount();

    if (pageNumber) {
      const calculatedCount = pageNumber * DEFAULT_PAGE_SIZE;
      const nextPageNumber = pageNumber + 1;
      if (prevTotalCount !== undefined && calculatedCount < prevTotalCount) {
        const { items, totalCount: currentTotalCount } = await this._endpoint(
          new QuerySpecification({
            pagination: {
              number: nextPageNumber,
              size: DEFAULT_PAGE_SIZE,
            },
            filter: {
              logicalOperator: this._logicalFilterOperator,
              entries: filter,
            },
          })
        );
        this.updatePageNumber(nextPageNumber);
        this._repository.addRange(this._category, items);
        if (currentTotalCount !== prevTotalCount) this.updateRecordCount(currentTotalCount);
      }
    }
  };

  /**
   * Fetches data based on the provided filters.
   * @param filter The filters to apply.
   */
  fetchFilters = async (filter: ModelFilters<TModel>, logicalFilterOperator?: LogicalFilterOperators) => {
    const { items, totalCount } = await this._endpoint(
      new QuerySpecification({
        pagination: {
          number: DEFAULT_PAGE_NUMBER,
          size: DEFAULT_PAGE_SIZE,
        },
        filter: {
          logicalOperator: logicalFilterOperator ?? this._logicalFilterOperator,
          entries: filter,
        },
      })
    );
    if (logicalFilterOperator && this._logicalFilterOperator !== logicalFilterOperator) this.updateLogicalOperator(logicalFilterOperator);
    this.resetPageNumber();
    this.updateFilter(filter);
    this.updateRecordCount(totalCount);
    this._repository.set(this._category, items);
  };

  /**
   * Reloads data, optionally keeping the current page number.
   * @param keepPageNumber Whether to keep the current page number when reloading data.
   */
  fetchReload = async (keepPageNumber = false) => {
    const filter = this.getFilter();
    const pageNumber = this.getPageNumber();
    const prevTotalCount = this.getRecordCount();

    if (pageNumber) {
      const calculatedCount = pageNumber * DEFAULT_PAGE_SIZE;

      let filterSpec: QuerySpecification;

      if (keepPageNumber)
        filterSpec = new QuerySpecification({
          pagination: {
            number: DEFAULT_PAGE_NUMBER,
            size: calculatedCount,
          },
          filter: {
            logicalOperator: this._logicalFilterOperator,
            entries: filter,
          },
        });
      else {
        filterSpec = new QuerySpecification({
          pagination: {
            number: DEFAULT_PAGE_NUMBER,
            size: DEFAULT_PAGE_SIZE,
          },
          filter: {
            entries: filter,
            logicalOperator: this._logicalFilterOperator,
          },
        });
        this.updatePageNumber(DEFAULT_PAGE_NUMBER);
      }
      try {
        this.startFetchStatus('list');
        const { items, totalCount: currentTotalCount } = await this._endpoint(filterSpec);

        this._repository.set(this._category, items);

        if (currentTotalCount !== prevTotalCount) this.updateRecordCount(currentTotalCount);
      } finally {
        this.stopFetchStatus('list');
      }
    } else
      await this.fetchDefault({
        filter: new FilterSpecification({ entries: filter, logicalOperator: this._logicalFilterOperator }),
      });
  };

  /**
   * Adds data by applying the provided function and re-fetches the default data.
   * @param apply The function to apply to add the data.
   */
  add = async (apply: () => Promise<any> | any) => {
    try {
      this.startFetchStatus('create');
      await apply();
      this.fetchReload();
    } finally {
      this.stopFetchStatus('create');
    }
  };

  /**
   * Updates data by applying the provided function and re-fetches the default data.
   * @param apply The function to apply to update the data.
   */
  update = async (apply: () => Promise<any> | any) => {
    try {
      this.startFetchStatus('update');
      await apply();
      this.fetchReload();
    } finally {
      this.stopFetchStatus('update');
    }
  };

  mutate = (predicate: (item: TModel) => boolean, mutation: (item: TModel) => void) =>
    this._repository.mutate(this._category, predicate, mutation);

  /**
   * Removes data by applying the provided function and updating the record count.
   * @param apply The function to apply to remove the data.
   * @param predicate A predicate function to determine which items to remove.
   */
  remove(predicate: (item: TModel) => boolean, apply: () => Promise<any> | any): Promise<void>;
  remove(item: TModel, apply: () => Promise<any> | any): Promise<void>;

  async remove(predicate: ((item: TModel) => boolean) | TModel, apply: () => Promise<any> | any): Promise<void> {
    try {
      this.startFetchStatus('remove');
      await apply();
      this._repository.remove(
        this._category,
        typeof predicate === 'function' ? (predicate as (item: TModel) => boolean) : (it) => it === predicate
      );
      this.updateRecordCount((prev) => (prev !== undefined && prev > 0 ? prev - 1 : undefined));
    } finally {
      this.stopFetchStatus('remove');
    }
  }

  /**
   * Sets the values for repository.
   * @param collection - The values to assign to the repository.
   */
  set = (collection: Array<TModel>) => this._repository.set(this._category, collection);
}
