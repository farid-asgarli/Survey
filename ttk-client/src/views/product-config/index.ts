import { inputDecimalProps, limitMax } from '@src/static/input';
import { PaymentTypeOptions } from '@src/static/entities/payment-type';
import { CurrencyOptions } from '@src/static/entities/currency-type';
import { t } from '@src/utils/locale';
import { DepreciationTypeOptions } from '@src/static/entities/depreciation-type';
import { ProductConfigurationTypeOptions } from '@src/static/entities/configuration-type';

export { default } from './root/main-view';

export const DefaultFormInputs = {
  company: {
    type: 'text',
    label: t('CompanyItem'),
    disabled: true,
  },
  productChannel: {
    type: 'text',
    label: t('ProductChannel'),
    disabled: true,
  },
  currency: {
    type: 'text',
    label: t('CurrencyId'),
    disabled: true,
  },
  companyId: {
    type: 'select',
    label: t('CompanyItem'),
  },
  productChannelId: {
    type: 'select',
    label: t('ProductChannelId'),
  },
  currencyId: {
    type: 'select',
    label: t('CurrencyId'),
    inputProps: {
      data: CurrencyOptions,
    },
  },
  minimumContractDurationInMonths: {
    type: 'number',
    label: t('MinimumContractDurationInMonths'),
    rules: {
      validate: {
        lessThanMaxDuration: (value, fields) =>
          parseInt(value) <= parseInt(fields.maximumContractDurationInMonths) || 'Minimal müddət maksimal müddətdən çox ola bilməz',
      },
    },
  },
  maximumContractDurationInMonths: {
    type: 'number',
    label: t('MaximumContractDurationInMonths'),
  },
  minimumAge: {
    type: 'number',
    label: t('MinimumAge'),
    rules: {
      ...limitMax(999, 'Yaş düzgün deyil'),
      validate: {
        lessThanMaxAge: (value, fields) => parseInt(value) <= parseInt(fields.maximumAge) || 'Minimal yaxş maksimal yaşdan çox ola bilməz',
      },
    },
  },
  maximumAge: {
    type: 'number',
    label: t('MaximumAge'),
    rules: { ...limitMax(999, 'Yaş düzgün deyil') },
  },
  companyRate: {
    type: 'number',
    label: t('CompanyRate'),
    rules: { ...limitMax(100) },
    inputProps: {
      ...inputDecimalProps,
    },
  },
  commissionInterest: {
    type: 'number',
    label: t('CommissionInterest'),
    rules: { ...limitMax(100) },
    inputProps: {
      ...inputDecimalProps,
    },
  },
  administrativeCost: {
    type: 'number',
    label: t('AdministrativeCost'),
    rules: { ...limitMax(100) },
    inputProps: {
      ...inputDecimalProps,
    },
  },
  minimumInsuranceCost: {
    type: 'number',
    label: t('MinimumInsuranceCost'),
    inputProps: {
      ...inputDecimalProps,
    },
  },
  maximumInsuranceAmount: {
    type: 'number',
    label: t('MaximumInsuranceAmount'),
    inputProps: {
      ...inputDecimalProps,
    },
  },
  paymentTypeId: {
    type: 'select',
    label: t('PaymentTypeId'),
    inputProps: {
      data: PaymentTypeOptions,
    },
  },
  depreciationTypeId: {
    type: 'select',
    label: t('DepreciationTypeId'),
    inputProps: {
      data: DepreciationTypeOptions,
    },
  },
  configurationTypeId: {
    type: 'select',
    label: t('ConfigurationTypeId'),
    inputProps: {
      data: ProductConfigurationTypeOptions,
    },
  },
} as const;
