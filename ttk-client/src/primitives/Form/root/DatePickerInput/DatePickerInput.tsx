import { type BaseInputProps } from '../..';
import { DatePickerInput as MantineDatePickerInput, type DatePickerInputProps } from '@mantine/dates';
import { ControlledFormInput } from '../ControlledFormInput/ControlledFormInput';

// // TODO Prevent bouncing label of input.
export default function DatePickerInput({ controller, ...props }: BaseInputProps<DatePickerInputProps>) {
  return (
    <ControlledFormInput
      controller={{ ...controller, defaultValue: controller.defaultValue ?? null }}
      {...props}
      render={({ inputProps, ...p }) => (
        <MantineDatePickerInput
          clearable
          locale="az"
          {...p}
          {...(inputProps as any)}
          styles={{
            calendarHeaderControl: {
              zIndex: 1000,
            },
          }}
        />
      )}
    />
  );
}
