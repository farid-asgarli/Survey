import { createEnumOptionsData } from '@src/utils/select';

export enum DepreciationTypes {
  'Fixed' = 1,
  'Mixed' = 2,
  'Non-Fixed' = 3,
}

export const DepreciationTypeOptions = createEnumOptionsData(DepreciationTypes);
