import { BaseInputProps } from '../..';
import { MultiSelect as MantineMultiSelectInput, MultiSelectProps as MantineMultiSelectProps } from '@mantine/core';
import { ControlledFormInput } from '../ControlledFormInput/ControlledFormInput';
import { SelectItem } from '@mantine/core/lib/Select/types';

// // TODO When search value is added, do not remove floating label.

export type MultiSelectProps = Omit<MantineMultiSelectProps, 'data'> & {
  data?: (Omit<SelectItem, 'value'> & { value: string | number })[];
};

export default function MultiSelectInput(props: BaseInputProps<MultiSelectProps>) {
  return (
    <ControlledFormInput
      {...props}
      render={({ inputProps, ...p }) => (
        <MantineMultiSelectInput
          clearable
          searchable
          withinPortal
          {...p}
          dropdownPosition="bottom"
          styles={{
            dropdown: {
              zIndex: 999999999999,
            },
          }}
          {...(inputProps as MantineMultiSelectProps)}
        />
      )}
    />
  );
}
