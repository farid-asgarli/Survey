import { t } from '@src/utils/locale';

export { default } from './root/main-view';

export const DefaultFormInputs = {
  companyId: {
    type: 'select',
    label: t('CompanyId'),
  },
  name: { type: 'text', label: t('ProductChannelName') },
  channelNumber: { type: 'number', inputProps: { precision: undefined }, label: t('ChannelNumber') },
} as const;
