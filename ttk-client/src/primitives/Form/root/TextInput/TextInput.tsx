import { BaseInputProps } from "../..";
import { TextInput as MantineTextInput, TextInputProps } from "@mantine/core";
import { ControlledFormInput } from "../ControlledFormInput/ControlledFormInput";

export default function TextInput(props: BaseInputProps<TextInputProps>) {
  return <ControlledFormInput {...props} render={({ inputProps, ...p }) => <MantineTextInput {...p} {...inputProps} />} />;
}
