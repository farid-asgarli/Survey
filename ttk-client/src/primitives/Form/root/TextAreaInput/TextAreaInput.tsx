import { BaseInputProps } from "../..";
import { Textarea as MantineTextAreaInput, TextareaProps } from "@mantine/core";
import { ControlledFormInput } from "../ControlledFormInput/ControlledFormInput";

export default function TextAreaInput(props: BaseInputProps<TextareaProps>) {
  return <ControlledFormInput {...props} render={({ inputProps, ...p }) => <MantineTextAreaInput {...p} {...inputProps} />} />;
}
