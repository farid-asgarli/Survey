import { PaginationSpecification } from '../utility/pagination-specification';
import { FilterSpecification } from '../utility/filter-specification';

export default class QuerySpecification<T = any> {
  pagination?: PaginationSpecification;
  filter?: FilterSpecification<T>;

  constructor(spec?: { pagination?: PaginationSpecification; filter?: FilterSpecification<T> }) {
    this.pagination = spec?.pagination;
    this.filter = spec?.filter;
  }
}
