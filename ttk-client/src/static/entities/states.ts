import { createEnumOptionsData } from '@src/utils/select';

export enum States {
  Deaktiv,
  Aktiv,
}

export const StateOptions = createEnumOptionsData(States);

// TODO In DataGrid, State options are not displayed as string.
export enum ConfigStates {
  'Təsdiq gözləyir',
  'Aktiv',
  'Relizə hazırdır',
  'Müddəti başa çatıb',
}

export const ConfigStateOptions = createEnumOptionsData(ConfigStates);

export enum ProductReleaseStates {
  'Relizə hazırdır',
  'Aktiv',
  'Müddəti başa çatıb',
}

export const ProductReleaseStateOptions = createEnumOptionsData(ProductReleaseStates);
