import { createEnumOptionsData } from '@src/utils/select';

export enum AddendumTypes {
  Yoxdur = 0,
  Ləğv = 1,
  Xitam = 2,
  Rest = 3,
}

export const AddendumTypeOptions = createEnumOptionsData(AddendumTypes);
