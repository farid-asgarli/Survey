import { useState } from "react";
import { FieldValues, Path, PathValue, UseFormHandleSubmit, UseFormProps, UseFormReturn, useForm as useHookForm } from "react-hook-form";

/**
 * Custom hook to manage the entire form.
 *
 * @remarks
 * [API](https://react-hook-form.com/docs/useform) • [Demo](https://codesandbox.io/s/react-hook-form-get-started-ts-5ksmm) • [Video](https://www.youtube.com/watch?v=RkXv4AXXC_4)
 *
 * @param props - form configuration and validation parameters.
 *
 * @returns methods - individual functions to manage the form state. {@link UseFormReturn}
 */
export function useForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues | undefined = undefined
>(
  props?: UseFormProps<TFieldValues, TContext>
): UseFormReturn<TFieldValues, TContext, TTransformedValues> & {
  isSubmitting: boolean;
  setValues: (values: { [name: keyof any]: PathValue<TFieldValues, Path<TFieldValues>> }) => void;
  setValuesFromObject: <TValues extends Record<keyof any, any>>(values: TValues, ...keys: (keyof TValues)[]) => void;
} {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hookForm = useHookForm(props);

  const handleSubmit: UseFormHandleSubmit<TFieldValues, TTransformedValues> = (onValid, onInvalid) => async (e) => {
    e?.preventDefault();
    // Grabbed from the official git repo, though it is no longer required in React 17<=.
    e?.persist();
    const submitHandlerArg = hookForm.handleSubmit(onValid, onInvalid);
    try {
      setIsSubmitting(true);
      await submitHandlerArg(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const setValues = (values: { [name: keyof any]: PathValue<TFieldValues, Path<TFieldValues>> }) => {
    for (const key in values) hookForm.setValue(key as Path<TFieldValues>, values[key]);
  };

  const setValuesFromObject = <TValues extends Record<keyof any, any>>(values: TValues, ...keys: Array<keyof TValues>) => {
    for (const key in values)
      if (keys.length === 0 || keys.includes(key)) hookForm.setValue(key as unknown as Path<TFieldValues>, values[key]);
  };

  return {
    ...hookForm,
    handleSubmit,
    isSubmitting,
    setValues,
    setValuesFromObject,
  };
}
