import { DataListItemActionProps } from '@src/lib/DataView/DataList/types';
import { t } from '@src/utils/locale';

type ActionTypes =
  | 'Adjust'
  | 'Edit'
  | 'View'
  | 'Remove'
  | 'Print'
  | 'Cancel'
  | 'TerminateOnCustomerDemand'
  | 'TerminateOnCompanyDemand'
  | 'Documents'
  | 'Download'
  | 'Sign';

export const Actions: {
  [P in ActionTypes]: DataListItemActionProps;
} & {
  Item(type: ActionTypes, props?: Partial<DataListItemActionProps>): DataListItemActionProps;
} = {
  Adjust: {
    icon: 'Adjustments',
    label: 'Tənzimlə',
    color: 'teal',
  },
  Edit: {
    icon: 'Pencil',
    label: 'Düzəliş',
    color: 'orange',
  },
  Remove: {
    icon: 'Trash',
    label: 'Sil',
    color: 'red',
  },
  View: {
    icon: 'View',
    label: 'Baxış',
    color: 'indigo',
  },
  Print: {
    icon: 'Print',
    label: 'Çap et',
    color: 'cyan.8',
  },
  Cancel: {
    icon: 'SquareRounded',
    label: 'Ləğv et',
    color: 'orange',
  },
  TerminateOnCompanyDemand: {
    icon: 'HomeCancel',
    label: t('TerminateOnCompanyDemand'),
    color: 'red.4',
  },
  TerminateOnCustomerDemand: {
    icon: 'UserCancel',
    label: t('TerminateOnCustomerDemand'),
    color: 'red.8',
  },
  Documents: {
    icon: 'Document',
    label: 'Sənədlər',
    color: 'teal.8',
  },
  Download: {
    icon: 'Download',
    label: 'Yüklə',
    color: 'lime.9',
  },
  Sign: {
    icon: 'PencilCheck',
    label: 'ASAN Təsdiq',
    color: 'blue.3',
  },
  Item: function (type: ActionTypes, props?: Partial<DataListItemActionProps>) {
    return { ...this[type], ...props };
  },
};
