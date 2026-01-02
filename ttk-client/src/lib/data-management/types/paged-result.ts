export interface PagedResult<T> {
  items: Array<T>;
  totalCount: number;
}

export type UnwrapPagedResult<T> = T extends PagedResult<infer U> ? U : T;
