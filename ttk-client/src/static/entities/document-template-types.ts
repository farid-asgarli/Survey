import { createEnumOptionsData } from '@src/utils/select';

export enum DocumentTemplateTypes {
  'Şəhadətnamə forması' = 1,
  'Yaddaş vərəqəsi' = 2,
}

export const DocumentTemplateTypesOptions = createEnumOptionsData(DocumentTemplateTypes);
