type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

type MergeObjects<T extends (object | undefined | null)[]> = {
  [K in keyof UnionToIntersection<NonNullable<T[number]>>]: UnionToIntersection<NonNullable<T[number]>>[K];
};

export function merge<T extends (object | undefined | null)[]>(...objects: T): MergeObjects<T> {
  return objects.reduce((prev, curr) => Object.assign(prev as MergeObjects<T>, curr ?? {}), {}) as MergeObjects<T>;
}
