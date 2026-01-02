import { createEnumOptionsData } from '@src/utils/select';

export enum ContractDocumentTypes {
  'Əlavə' = 1,
  'Xitam' = 2,
}

export const ContractDocumentTypeOptions = createEnumOptionsData(ContractDocumentTypes);
