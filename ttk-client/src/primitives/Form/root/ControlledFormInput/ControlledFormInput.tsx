import { BaseInputProps, Form } from '../..';
import { Controller } from 'react-hook-form';
import { EmptyStr } from '@src/static/string';
import clsx from 'clsx';
import styles from './ControlledFormInput.module.scss';
import { InputWrapperBaseProps } from '@mantine/core';

interface ControlledRender<TProps extends InputWrapperBaseProps> {
  label?: string;
  placeholder?: string;
  onFocus?: React.FocusEventHandler<HTMLElement>;
  onBlur?: React.FocusEventHandler<HTMLElement>;
  inputProps?: TProps;
  onChange: (event: any) => void;
  value: any;
  name: string;
}

export function ControlledFormInput<TProps extends InputWrapperBaseProps>(
  props: BaseInputProps<TProps> & {
    render: (props: ControlledRender<TProps>) => JSX.Element;
  }
) {
  if (props.loading) return <Form.Skeleton />;

  return (
    <Controller
      defaultValue={EmptyStr}
      render={({ field, fieldState }) => (
        <Form.Element {...props.htmlProps} className={clsx(styles.form_base_input, props.htmlProps?.className)}>
          {props.render({
            label: props.label,
            placeholder: props.placeholder ?? props.label,
            // placeholder: (inputProps as TProps & { disabled: boolean }).disabled ? undefined : placeholder,
            inputProps: {
              ...props.inputProps,
              error: fieldState.error?.message,
              withAsterisk: !!props.controller.rules?.required,
            } as TProps,
            ...field,
          })}
        </Form.Element>
      )}
      {...props.controller}
    />
  );
}
