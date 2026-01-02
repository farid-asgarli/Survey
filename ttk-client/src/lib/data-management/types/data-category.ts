import QueryManager from '../store/query-manager';
import { PagedResult, UnwrapPagedResult } from './paged-result';
import QuerySpecification from '../utility/query-specification';

export type ApiQueryFn = (filter?: QuerySpecification<{}> | undefined) => Promise<PagedResult<any>>;

export type DataCategoryEntryModel<Endpoints extends Record<string, ApiQueryFn>> = {
  [P in keyof Endpoints]: UnwrapPagedResult<UnwrapPromise<ReturnType<Endpoints[P]>>>;
};

/**
 * Represents a dictionary managing instances of QueryManager.
 * It allows for the retrieval, creation, and flushing of QueryManager instances
 * based on keys from the DataCategoryEntryModel.
 */
export type QueryManagerDictionary<Endpoints extends Record<string, ApiQueryFn>> = {
  /**
   * The collection of QueryManager instances, indexed by keys from DataCategoryEntryModel.
   * Each entry is either a QueryManager instance or undefined if not yet created.
   */
  collection: Partial<{ [P in keyof DataCategoryEntryModel<Endpoints>]: QueryManager<DataCategoryEntryModel<Endpoints>[P]> | undefined }>;

  /**
   * Retrieves a QueryManager instance for the given key.
   * @param key - The key from DataCategoryEntryModel for which to retrieve the QueryManager.
   * @returns The QueryManager instance if it exists, or undefined if not found.
   */
  get<TKey extends keyof DataCategoryEntryModel<Endpoints>>(key: TKey): QueryManager<DataCategoryEntryModel<Endpoints>[TKey]> | undefined;

  /**
   * Disposes (removes) the QueryManager instance associated with the given key.
   * @param key - The key from DataCategoryEntryModel whose QueryManager is to be disposed.
   */
  disposeEntry<TKey extends keyof DataCategoryEntryModel<Endpoints>>(key: TKey): void;

  /**
   * Destroys the QueryManager collection.
   */
  destroy(): void;

  /**
   * Sets up (creates) a new QueryManager instance for the given key.
   * @param key - The key from DataCategoryEntryModel for which to create the QueryManager.
   * @returns The newly created QueryManager instance.
   */
  setup<TKey extends keyof DataCategoryEntryModel<Endpoints>>(key: TKey): QueryManager<DataCategoryEntryModel<Endpoints>[TKey]>;

  /**
   * Retrieves an existing QueryManager instance for the given key or creates a new one if it doesn't exist.
   * @param key - The key from DataCategoryEntryModel for which to get or create the QueryManager.
   * @returns The existing or newly created QueryManager instance.
   */
  getOrCreate<TKey extends keyof DataCategoryEntryModel<Endpoints>>(key: TKey): QueryManager<DataCategoryEntryModel<Endpoints>[TKey]>;
};
