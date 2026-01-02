import { createEnumOptionsData } from '@src/utils/select';

export enum ProductConfigurationTypes {
  'Ümumi' = 1,
  'Xüsusi' = 2,
}

export const ProductConfigurationTypeOptions = createEnumOptionsData(ProductConfigurationTypes);
