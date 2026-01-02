import { BaseInputProps } from '../..';
import { Select as MantineSelectInput, SelectItem, SelectProps as MantineSelectProps } from '@mantine/core';
import { ControlledFormInput } from '../ControlledFormInput/ControlledFormInput';

export type SelectProps = Omit<MantineSelectProps, 'data'> & {
  data?: (Omit<SelectItem, 'value'> & { value: string | number })[];
};

export default function SelectInput(props: BaseInputProps<SelectProps>) {
  return (
    <ControlledFormInput
      {...props}
      render={({ inputProps, ...p }) => <MantineSelectInput withinPortal allowDeselect {...p} {...(inputProps as MantineSelectProps)} />}
    />
  );
}
