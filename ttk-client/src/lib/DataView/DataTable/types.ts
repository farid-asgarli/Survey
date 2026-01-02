import { DataViewModel } from '../Shared/types';
import { AppIcon } from '@src/components/icons';
import { IconButtonProps } from '@src/components/interface/IconButton/IconButton';
import { DataViewProps } from '../Shared/Container/Container.props';

export type DataTableRootProps = React.ComponentPropsWithoutRef<'div'>;
export type DataTableHeaderItemProps = React.ComponentPropsWithoutRef<'div'>;
export type DataTableHeaderCellProps = React.ComponentPropsWithoutRef<'div'>;
export type DataTableHeaderRowProps = React.ComponentPropsWithoutRef<'div'>;
export type DataTableBodyCellProps = React.ComponentPropsWithoutRef<'div'>;
export type DataTableBodyRowProps = React.ComponentPropsWithoutRef<'div'>;

export type DataTableActions = Pick<IconButtonProps, 'color' | 'onClick' | 'onClickAsync' | 'disabled'> & {
  label: string;
  icon: AppIcon;
};

export interface DataTableContainerProps<TModel extends DataViewModel> extends DataViewProps<TModel> {
  renderListItem: (data: TModel) => {
    items: Array<{
      value: React.ReactNode;
    }>;
    onClick?: (e: React.MouseEvent<HTMLDivElement>, data: TModel) => void;
  };
  header: Array<{
    title?: React.ReactNode;
    width?: number | string | undefined;
  }>;
  actions?: (data: TModel) => Array<DataTableActions>;
  /**
   * Defines how action items should be displayed.
   * @default 'plain'
   */
  actionsPlacement?: 'plain' | 'menu';
}
