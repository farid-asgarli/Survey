import Repository from '../store/repository';
import QueryManager from '../store/query-manager';
import { ApiQueryFn, DataCategoryEntryModel, QueryManagerDictionary } from '../types/data-category';
import React, { createContext, useContext } from 'react';

export function setupDataContextProvider<Endpoints extends Record<string, ApiQueryFn>>(dataCategoryEndpoints: Endpoints) {
  type ApiDataEntryModel = DataCategoryEntryModel<typeof dataCategoryEndpoints>;

  const DataCategories = (function () {
    const obj = {} as {
      [P in keyof ApiDataEntryModel]: P;
    };

    for (const key in dataCategoryEndpoints) obj[key] = key;

    return obj;
  })();

  const repository = new Repository<ApiDataEntryModel>();

  const queryManager: QueryManagerDictionary<typeof dataCategoryEndpoints> = {
    get(key: keyof ApiDataEntryModel) {
      return this.collection[key];
    },
    disposeEntry(key: keyof ApiDataEntryModel) {
      if (this.collection[key]) {
        this.collection[key]?.dispose();
        this.collection[key] = undefined;
      }
    },
    setup(key: keyof ApiDataEntryModel) {
      this.collection[key] = new QueryManager(repository, dataCategoryEndpoints[key], key.toString());
      return this.collection[key]!;
    },
    getOrCreate(key: keyof ApiDataEntryModel) {
      return this.get(key) ?? this.setup(key);
    },
    destroy() {
      this.collection = {};
    },
    collection: {},
  };

  const QueryContext = createContext(queryManager);

  function DataContextProvider({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryContext.Provider,
      {
        value: queryManager,
      },
      children
    );
  }

  function useDataContext(): QueryManagerDictionary<typeof dataCategoryEndpoints>;
  function useDataContext<TKey extends keyof ApiDataEntryModel>(category: TKey): QueryManager<ApiDataEntryModel[TKey]>;
  function useDataContext<TKey extends keyof ApiDataEntryModel>(category?: TKey) {
    const qc = useContext(QueryContext);

    if (category) return qc.getOrCreate(category);
    return qc;
  }

  return { queryManager, DataCategories, DataContextProvider, useDataContext };
}
