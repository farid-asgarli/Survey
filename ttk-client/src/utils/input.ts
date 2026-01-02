import { FileInputProps, NumberInputProps, TextInputProps, TextareaProps } from '@mantine/core';
import { DatePickerInputProps } from '@mantine/dates';
import { BaseInputProps } from '@src/primitives/Form';
import { MultiSelectProps } from '@src/primitives/Form/root/MultiSelectInput/MultiSelectInput';
import { RadioInputProps } from '@src/primitives/Form/root/RadioInput/RadioInput';
import { SelectProps } from '@src/primitives/Form/root/SelectInput/SelectInput';
import { Form } from '@src/primitives/Form';
import React from 'react';

export interface FormInputTypes {
  text: TextInputProps;
  textArea: TextareaProps;
  number: NumberInputProps;
  date: DatePickerInputProps;
  radio: RadioInputProps;
  multiSelect: MultiSelectProps;
  select: SelectProps;
  file: FileInputProps;
}

export function getFormInputComponent<K extends keyof FormInputTypes>(name: K) {
  switch (name) {
    case 'text':
      return Form.TextInput;
    case 'textArea':
      return Form.TextAreaInput;
    case 'number':
      return Form.NumberInput;
    case 'date':
      return Form.DatePickerInput;
    case 'radio':
      return Form.RadioInput;
    case 'multiSelect':
      return Form.MultiSelectInput;
    case 'select':
      return Form.SelectInput;
    case 'file':
      return Form.FileInput;
    default:
      throw new Error(`Unsupported input type: ${name}`);
  }
}

export function renderFormInput<K extends keyof FormInputTypes>(name: K, props: BaseInputProps<FormInputTypes[K]>) {
  return React.createElement(getFormInputComponent(name) as any, props);
}
