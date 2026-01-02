import { Badge, BadgeProps, DefaultMantineColor } from '@mantine/core';
import { AddendumTypes } from '@src/static/entities/addendum-types';
import { ConfigStates, ProductReleaseStates, States } from '@src/static/entities/states';

type StatusBadgeProps<TKey extends keyof any> = import('@mantine/utils').PolymorphicComponentProps<'div', BadgeProps> & {
  value: TKey;
  states: object;
  colorFn: (value: TKey) => DefaultMantineColor;
};

export function assignStateColor(value: States): DefaultMantineColor {
  switch (value) {
    case States.Deaktiv:
      return 'red';
    case States.Aktiv:
      return 'teal';
  }
}

export function assignAddendumStateColor(value: AddendumTypes): DefaultMantineColor {
  switch (value) {
    case AddendumTypes.Yoxdur:
      return 'dark';
    case AddendumTypes.Ləğv:
      return 'gray';
    case AddendumTypes.Xitam:
      return 'red.9';
    case AddendumTypes.Rest:
      return 'indigo';
  }
}

export function assignConfigStateColor(value: ConfigStates): DefaultMantineColor {
  switch (value) {
    case ConfigStates['Təsdiq gözləyir']:
      return 'orange';
    case ConfigStates['Aktiv']:
      return 'teal';
    case ConfigStates['Relizə hazırdır']:
      return 'indigo';
    case ConfigStates['Müddəti başa çatıb']:
      return 'gray';
  }
}

export function assignReleaseStateColor(value: ProductReleaseStates): DefaultMantineColor {
  switch (value) {
    case ProductReleaseStates['Relizə hazırdır']:
      return 'indigo';
    case ProductReleaseStates['Aktiv']:
      return 'teal';
    case ProductReleaseStates['Müddəti başa çatıb']:
      return 'gray';
  }
}

export default function StatusBadge<TKey extends keyof any>({ colorFn, states, value, ...props }: StatusBadgeProps<TKey>) {
  return <Badge color={colorFn(value)} radius="md" variant="filled" {...props} children={states[value as keyof typeof states]} />;
}
