import { AppIcon, Icon } from '@src/components/icons';
import { FormInputTypes, renderFormInput } from '@src/utils/input';
import { merge } from '@src/utils/merge';
import React, { useCallback } from 'react';
import { Control, ControllerProps, FieldValues, RegisterOptions } from 'react-hook-form';

interface BaseFormInputProps {
  type: keyof FormInputTypes;
  inputProps?: FormInputTypes[keyof FormInputTypes];
  label?: string;
  placeholder?: string;
  loading?: boolean;
  htmlProps?: JSX.IntrinsicElements['div'];
  disabled?: boolean;
  icon?: AppIcon;
}

interface InputFactoryOptions<TFieldValues extends FieldValues = FieldValues> {
  rules?: Omit<RegisterOptions<TFieldValues>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;
  disableAll?: boolean;
}

/**
 * Type definition for each input configuration.
 *
 * @template K The keys of each configuration, corresponding to the name of each input field.
 * @property {keyof FormInputTypes} type - The type of the input field.
 * @property {FormInputTypes[keyof FormInputTypes]} inputProps - Optional input properties.
 * @property {string} label - Optional label text for the input field.
 * @property {string} placeholder - Optional placeholder text for the input field.
 * @property {boolean} loading - Optional loading state for the input field.
 * @property {JSX.IntrinsicElements['div']} htmlProps - Optional HTML properties for a wrapping `div` element.
 * @property {ControllerProps} ControllerProps - The `defaultValue` and `rules` for the `react-hook-form` controller.
 */

export type InputMapProps = BaseFormInputProps & Pick<ControllerProps, 'defaultValue' | 'rules'>;

export type InputMap<K extends {} = {}> = {
  [P in keyof K]?: InputMapProps;
} & {
  [k: keyof any]: InputMapProps;
};

/**
 * `useFormInputFactory` is a hook that provides a function to get a specific input configuration from the passed input map.
 * It takes a Control object from React Hook Form and a map of input field configurations and returns a function,
 * getInput, which can be used to generate input fields based on the configuration map.
 *
 * @template TFieldValues A generic helper for `react-hook-form` that extends from FieldValues.
 * @template TMap A generic helper that extends from InputMap.
 * @param {Control<TFieldValues>} control A Control object from React Hook Form.
 * @param {TMap} map An object that maps input field names to their configuration.
 * @returns An object containing the getInput function.
 */
export function useFormInputFactory<TFieldValues extends FieldValues = FieldValues, TMap extends InputMap = InputMap>(
  control: Control<TFieldValues>,
  map: TMap,
  options?: InputFactoryOptions<TFieldValues>
) {
  function _input(
    name: keyof TMap,
    index?: number,
    props?: Pick<BaseFormInputProps, 'disabled' | 'htmlProps' | 'inputProps' | 'loading' | 'icon'>
  ) {
    const { type, defaultValue, disabled, rules, inputProps, icon, ...rest } = map[name];
    const disabledStatus = disabled !== undefined ? disabled : props?.disabled !== undefined ? props.disabled : options?.disableAll;

    const formController = {
      name,
      control,
      defaultValue,
      rules: merge(options?.rules, rules),
      shouldUnregister: true,
    } as any;

    const formInputProps = {
      ...inputProps,
      ...props?.inputProps,
      disabled: disabledStatus,
    } as any;

    if (icon) formInputProps.icon = React.createElement(Icon, { name: icon });

    return renderFormInput(type, {
      controller: formController,
      ...props,
      inputProps: formInputProps,
      key: index,
      ...rest,
    });
  }

  /**
   * `getInput` is a function that generates an input field based on the configuration provided in the map for that field name and accepts additional `props` override.
   *
   * @param {keyof TMap} name The name of the input field to generate.
   * @returns An instance of the form input component based on the configuration.
   */

  const getInput = useCallback(
    (name: keyof TMap, props?: Pick<BaseFormInputProps, 'disabled' | 'htmlProps' | 'inputProps' | 'loading' | 'icon'>) =>
      _input(name, undefined, props),
    [map]
  );

  /**
   * `getInputs` is a function that generates a collection of input fields based on the configuration provided in the map for that field name.
   *
   * @param {Array<keyof TMap>} names The name of the input field to generate.
   * @returns An instance of the form input component based on the configuration.
   */
  const getInputs = useCallback(
    (names: Array<keyof TMap> = [], props?: Pick<BaseFormInputProps, 'disabled' | 'htmlProps' | 'inputProps' | 'loading' | 'icon'>) =>
      names.length > 0 ? names.map((it, i) => _input(it, i, props)) : Object.keys(map).map((it, i) => _input(it, i, props)),
    [map]
  );

  return { getInput, getInputs };
}
