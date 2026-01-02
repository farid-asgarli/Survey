import { FilterEntryWithBinding } from '@src/lib/data-management/utility/filter-specification';

export interface DataViewModel {
  id: number;
}

/**
 * `DataListFilterProps` interface delineates the contract for properties associated with the filtering functionality
 * of a data list component. It enables the definition of filter input configurations, action handlers, and state indicators.
 *
 * @typeparam TInputMap Type representing the structure of filter inputs.
 */
export interface DataViewFilterProps<TInputMap> {
  /**
   * A collection of filter inputs, represented by a type `TInputMap`.
   */
  filterInputs?: TInputMap;

  /**
   * Default values for filter form inputs, represented as a key-value pair record. The record's keys correspond to filter input fields,
   * and values represent their default state. This property is optional.
   */
  defaultFormValues?: Record<keyof any, any>;

  /**
   * A handler function triggered upon change of form values. It is responsible for processing and applying the updated filter criteria to the data list.
   *
   * @param values A key-value pair record representing the current state of the form values, indexed by the keys of `TInputMap`.
   * @returns Either a Promise resolving to void or a void result, based on the function implementation.
   */
  onFormValuesChange: (values: Record<keyof TInputMap, any>) => Promise<void> | void;

  /**
   * A flag indicating the loading state of the form, typically used to denote ongoing operations like fetching or processing data.
   * When `true`, it suggests an ongoing operation, and when `false` or `undefined`, it indicates no active operation.
   */
  isLoading?: boolean;

  /**
   * The duration, in milliseconds, representing the debounce delay. This delay occurs between the latest form input change and the
   * invocation of the change handling function, allowing the input value to 'settle' before applying the change.
   */
  debounceDelay: number;
}

export type DataViewFilterCriteria<TModel> = Array<FilterEntryWithBinding<TModel>>;

export interface DataViewFilterReference {
  reset: () => void;
}
