import { t } from '@src/utils/locale';

export { default } from './root/main-view';

export const DefaultFormInputs = {
  productChannel: {
    type: 'text',
    label: t('ProductChannel'),
    disabled: true,
  },
  productCondition: {
    type: 'text',
    label: t('ProductConditionId'),
    disabled: true,
  },
  productConfiguration: {
    type: 'text',
    label: t('ProductConfigurationId'),
    disabled: true,
  },
  title: {
    type: 'text',
    label: t('Title'),
  },
  productChannelId: {
    type: 'select',
    label: t('ProductChannelId'),
  },
  productConditionId: {
    type: 'select',
    label: t('ProductConditionId'),
  },
  productConfigurationId: {
    type: 'select',
    label: t('ProductConfigurationId'),
  },
  effectiveDate: {
    type: 'date',
    label: t('EffectiveDate'),
  },
  explanation: {
    type: 'textArea',
    label: t('Explanation'),
    rules: {
      required: undefined,
    },
  },
} as const;
