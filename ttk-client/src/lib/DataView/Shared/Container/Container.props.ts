import { FilterInputObjectMapping } from '@src/lib/data-management/types/filter-input-object-mapping';
import { DataViewFilterCriteria, DataViewModel } from '../types';

export interface DataViewProps<TModel extends DataViewModel> {
  /**
   * An array of data items.
   */
  data?: Array<TModel>;
  /**
   * The size of the page for pagination. If not specified, the page size will be determined by the component's default.
   */
  pageSize?: number;
  /**
   * A boolean indicating whether the data is currently being loaded. If true, a loading spinner or similar indicator may be displayed.
   */
  isLoading?: boolean;
  /**
   * A filtering configuration, including the inputs used for filtering and any default filter values.
   */
  filtering?: {
    /**
     * A map of the inputs used for filtering.
     */
    inputs: FilterInputObjectMapping;
    /**
     * The default values for the filter inputs. These values will be used to pre-populate the filter inputs on initial render.
     */
    defaultValues?: Record<keyof any, any>;
  };
  /**
   * Function to handle changes in filter criteria.
   *
   * @param filterCriteria - The filter criteria object.
   */
  onFilterChange?: (filterCriteria: DataViewFilterCriteria<TModel>) => Promise<void> | void;
  /**
   * Function to load the next page of data. This function should trigger an API call or other data-fetching operation.
   *
   * @param pageNumber - The page number to be loaded.
   */
  onNextPageLoad?: (pageNumber: number) => Promise<void> | void;
  /**
   * The total count of items in the data source.
   */
  totalCount?: number;
  /**
   * An optional section for additional utility controls, such as buttons or search bars. This can be any React node.
   */
  utilitySection?: React.ReactNode;
}
