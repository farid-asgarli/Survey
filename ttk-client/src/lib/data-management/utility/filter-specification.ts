import { FilterEquations } from './filter-equations';
import { LogicalFilterOperators } from './logical-operator';

type FilterEntryInitConstructor<T> = { key: keyof Partial<T> | (string & {}); value: any; eq?: FilterEquations };

export class FilterEntry<T = any> {
  key: keyof Partial<T> | (string & {});
  value: any;
  equation: FilterEquations;
  constructor(obj: FilterEntryInitConstructor<T>) {
    this.key = obj.key;
    this.value = obj.value;
    this.equation = obj.eq ?? FilterEquations.EQUALS;
  }
}

export class FilterEntryWithBinding<T = any> extends FilterEntry<T> {
  __binder?: any;
  constructor(obj: FilterEntryInitConstructor<T> & { binder?: any }) {
    super(obj);
    this.__binder = obj.binder;
  }
}

export class FilterSpecification<T> {
  entries: Array<FilterEntry<T>>;
  logicalOperator: LogicalFilterOperators;

  constructor(init?: { entries?: Array<FilterEntry<T>>; logicalOperator?: LogicalFilterOperators }) {
    this.entries = init?.entries ?? [];
    this.logicalOperator = init?.logicalOperator ?? LogicalFilterOperators.AND_ALSO;
  }
}
