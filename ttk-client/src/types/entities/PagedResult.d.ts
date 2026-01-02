declare interface PagedResult<T> {
  items: Array<T>;
  totalCount: number;
}

declare type UnwrapPagedResult<T> = T extends PagedResult<infer U> ? U : T;

declare type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
