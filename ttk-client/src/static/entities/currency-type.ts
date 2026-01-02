import { createEnumOptionsData } from '@src/utils/select';

export enum Currencies {
  'AZN' = 1,
  'USD' = 2,
  'EUR' = 3,
}

export const CurrencyOptions = createEnumOptionsData(Currencies);
