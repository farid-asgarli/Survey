import { t } from '@src/utils/locale';
export { default } from './root/main-view';

export const DefaultFormInputs = {
  productChannelId: {
    type: 'select',
    label: t('ProductChannelId'),
  },
  coverages: {
    type: 'multiSelect',
    label: t('Coverages'),
  },
  description: {
    type: 'textArea',
    label: t('Description'),
  },
  explanation: {
    type: 'textArea',
    label: t('Explanation'),
    rules: {
      required: undefined,
    },
  },
} as const;
