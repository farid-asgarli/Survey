import { BaseInputProps } from '../..';
import { Radio as MantineRadioInput, RadioGroupProps, RadioProps } from '@mantine/core';
import { ControlledFormInput } from '../ControlledFormInput/ControlledFormInput';

export type RadioInputProps = Omit<RadioGroupProps, 'children'> & { data?: Array<RadioProps> };

export default function RadioInput(props: BaseInputProps<RadioInputProps>) {
  return (
    <ControlledFormInput
      {...props}
      render={({ inputProps = { data: [] }, ...p }) => {
        const { data, ...restInputProps } = inputProps;

        return (
          <MantineRadioInput.Group
            children={data?.map((it, i) => (
              <MantineRadioInput key={i} {...it} />
            ))}
            {...p}
            {...restInputProps}
          />
        );
      }}
    />
  );
}
