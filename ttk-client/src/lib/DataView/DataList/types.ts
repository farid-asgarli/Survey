import { BadgeProps } from '@mantine/core';
import { AppIcon } from '@src/components/icons';
import { IconButtonProps } from '@src/components/interface/IconButton/IconButton';
import { DataViewFilterCriteria, DataViewModel } from '../Shared/types';
import { FilterInputObjectMapping } from '@src/lib/data-management/types/filter-input-object-mapping';

/**
 * This interface represents the properties needed for a container handling a list of data items.
 * It provides control over the rendering of the list, pagination, loading state, filtering, and more.
 *
 * @typeparam TData The type of data that the list is expected to handle.
 */
export interface DataListContainerProps<TData extends DataViewModel> {
  /**
   * An array of data items.
   */
  data?: Array<TData>;
  /**
   * Function to render a list item. This function takes an item of type TData and should return a DataListItemProps object.
   *
   * @param data - The data item to be rendered as a list item.
   */
  renderListItem: (data: TData) => DataListItemProps;
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
  onFilterChange?: (filterCriteria: DataViewFilterCriteria<TData>) => Promise<void> | void;
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

export interface DataListItemProps {
  pairs?: Array<DataListItemPairProps>;
  title?: React.ReactNode;
  icon?: AppIcon;
  badges?: Array<DataListItemBadgeProps | JSX.Element>;
  actions?: Array<DataListItemActionProps>;
  leftSection?: React.ReactNode;
  onTitleClick?: () => any;
}

export interface DataListItemPairProps {
  title: React.ReactNode;
  value: React.ReactNode;
}

export type DataListItemActionProps = Pick<IconButtonProps, 'color' | 'onClick' | 'onClickAsync' | 'disabled'> & {
  label: string;
  icon: AppIcon;
};

export type DataListItemBadgeProps = Pick<BadgeProps, 'color' | 'leftSection' | 'children'>;
