import { BaseInputProps } from '../..';
import { NumberInput as MantineNumberInput, NumberInputProps } from '@mantine/core';
import { ControlledFormInput } from '../ControlledFormInput/ControlledFormInput';

// // TODO Update separator and precision properties.
export default function NumberInput(props: BaseInputProps<NumberInputProps>) {
  return (
    <ControlledFormInput
      {...props}
      render={({ inputProps, ...p }) => <MantineNumberInput mt="md" min={0} hideControls thousandsSeparator="," {...p} {...inputProps} />}
    />
  );
}
