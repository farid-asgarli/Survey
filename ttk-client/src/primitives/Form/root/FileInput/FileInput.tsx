import { BaseInputProps } from '../..';
import { FileInput as MantineFileInput, FileInputProps } from '@mantine/core';
import { ControlledFormInput } from '../ControlledFormInput/ControlledFormInput';

export default function FileInput(props: BaseInputProps<FileInputProps>) {
  return <ControlledFormInput {...props} render={({ inputProps, ...p }) => <MantineFileInput {...p} {...inputProps} />} />;
}
