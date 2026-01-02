import { t } from '@src/utils/locale';

export { default } from './root/main-view';

// // TODO companyId
export const DefaultFormInputs = {
  companyId: {
    type: 'select',
    label: t('CompanyName'),
    inputProps: {
      placeholder: 'Axtarış üçün azı 3 simvol daxil edin',
    },
  },
} as const;
