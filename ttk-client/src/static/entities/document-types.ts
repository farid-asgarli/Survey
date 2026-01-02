import { createEnumOptionsData } from '@src/utils/select';

export enum DocumentTypes {
  'Şəxsiyyət vəsiqəsi' = 1,
  'Xarici pasport' = 2,
}

export const DocumentTypeOptions = createEnumOptionsData(DocumentTypes);
