import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '../static/pagination-values';

export class PaginationSpecification {
  number?: number;
  size?: number;

  constructor(init?: { number?: number; size?: number }) {
    if (init) {
      this.number = init?.number;
      this.size = init?.size;
    } else {
      this.number = DEFAULT_PAGE_NUMBER;
      this.size = DEFAULT_PAGE_SIZE;
    }
  }
}
