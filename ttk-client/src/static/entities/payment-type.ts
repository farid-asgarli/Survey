import { createEnumOptionsData } from '@src/utils/select';

export enum PaymentTypes {
  'Birdəfəlik' = 1,
  'Aylıq' = 2,
  'İllik' = 3,
}

export const PaymentTypeOptions = createEnumOptionsData(PaymentTypes);
