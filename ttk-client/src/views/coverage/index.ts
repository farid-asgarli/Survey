import { t } from '@src/utils/locale';

export { default } from './root/main-view';

export const DefaultFormInputs = {
  remoteCoverageIds: {
    type: 'multiSelect',
    label: t('RemoteCoverageIds'),
  },
} as const;
