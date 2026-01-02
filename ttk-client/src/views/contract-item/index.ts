import { t } from '@src/utils/locale';
import { DocumentTypeOptions } from '@src/static/entities/document-types';

export { default } from './root/main-view';

export const DefaultFormInputs = {
  bankCode: {
    type: 'text',
    label: t('BankCode'),
  },
  loanTime: {
    type: 'number',
    label: t('LoanTime'),
  },
  loanAmount: {
    type: 'number',
    label: t('LoanAmount'),
  },
  channelNumber: {
    type: 'number',
    label: t('ChannelNumber'),
  },
  'customer.firstName': {
    type: 'text',
    label: t('FirstName'),
  },
  'customer.lastName': {
    type: 'text',
    label: t('LastName'),
  },
  'customer.paternalName': {
    type: 'text',
    label: t('PaternalName'),
  },
  'customer.dateOfBirth': {
    type: 'date',
    label: t('DateOfBirth'),
  },
  'customer.pinCode': {
    type: 'text',
    label: t('PinCode'),
  },
  'customer.currentAddress': {
    type: 'text',
    label: t('CurrentAddress'),
  },
  'customer.registeredAddress': {
    type: 'text',
    label: t('RegisteredAddress'),
  },
  'customer.gender': {
    type: 'text',
    label: t('Gender'),
  },
  'customer.mobilePhoneNumber': {
    type: 'text',
    label: t('MobilePhoneNumber'),
  },
  'customer.homePhoneNumber': {
    type: 'text',
    label: t('HomePhoneNumber'),
  },
  'customer.email': {
    type: 'text',
    label: t('Email'),
    rules: {
      required: undefined,
    },
  },
  'customer.documentId': {
    type: 'select',
    label: t('DocumentId'),
    inputProps: {
      data: DocumentTypeOptions,
    },
  },
} as const;

export const TerminationDetailsFormInputs = (accountNumberInputType: 'select' | 'text' = 'select') =>
  ({
    customerBankAccountNumber: {
      type: accountNumberInputType,
      label: t('AccountNumber'),
    },
  } as const);
