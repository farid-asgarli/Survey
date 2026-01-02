import Element from './root/Element/Element';
import Group from './root/Group/Group';
import Skeleton from './root/Skeleton/Skeleton';
import MultiSelectInput from './root/MultiSelectInput/MultiSelectInput';
import NumberInput from './root/NumberInput/NumberInput';
import RadioInput from './root/RadioInput/RadioInput';
import SelectInput from './root/SelectInput/SelectInput';
import TextInput from './root/TextInput/TextInput';
import TextAreaInput from './root/TextAreaInput/TextAreaInput';
import { FieldValues, FieldPath, ControllerProps } from 'react-hook-form';
import DatePickerInput from './root/DatePickerInput/DatePickerInput';
import Wrapper from './root/Wrapper/Wrapper';
import FileInput from './root/FileInput/FileInput';

// TODO Upload
export const Form = {
  Element,
  Group,
  DatePickerInput,
  FileInput,
  MultiSelectInput,
  NumberInput,
  RadioInput,
  SelectInput,
  Skeleton,
  TextInput,
  TextAreaInput,
  // UploadInput,
  Wrapper,
};

export interface BaseInputProps<
  TProps,
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  controller: Omit<ControllerProps<TFieldValues, TName>, 'render'>;
  inputProps?: TProps;
  label?: string;
  placeholder?: string;
  loading?: boolean;
  htmlProps?: JSX.IntrinsicElements['div'];
}

export const getCurrentValue = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  controller: Omit<ControllerProps<TFieldValues, TName>, 'render'>
) => controller?.control?._formValues?.[controller.name];
