import { useFormContext, Controller, type FieldValues, type Path, type PathValue } from 'react-hook-form';
import { Input, type InputProps } from '@/components/ui/Input';
import { Textarea, type TextareaProps } from '@/components/ui/Textarea';
import { Select, type SelectProps } from '@/components/ui/Select';
import { Checkbox, type CheckboxProps } from '@/components/ui/Checkbox';

// ============ Form Input ============

interface FormInputProps<T extends FieldValues> extends Omit<InputProps, 'name' | 'value' | 'onChange' | 'onBlur'> {
  name: Path<T>;
}

export function FormInput<T extends FieldValues>({ name, ...props }: FormInputProps<T>) {
  const {
    register,
    formState: { errors, touchedFields },
  } = useFormContext<T>();
  const error = errors[name];
  const isTouched = name in touchedFields;

  return <Input {...props} {...register(name)} error={isTouched && error ? String(error.message) : undefined} />;
}

// ============ Form Textarea ============

interface FormTextareaProps<T extends FieldValues> extends Omit<TextareaProps, 'name' | 'value' | 'onChange' | 'onBlur'> {
  name: Path<T>;
}

export function FormTextarea<T extends FieldValues>({ name, ...props }: FormTextareaProps<T>) {
  const {
    register,
    formState: { errors, touchedFields },
  } = useFormContext<T>();
  const error = errors[name];
  const isTouched = name in touchedFields;

  return <Textarea {...props} {...register(name)} error={isTouched && error ? String(error.message) : undefined} />;
}

// ============ Form Select ============

interface FormSelectProps<T extends FieldValues> extends Omit<SelectProps, 'name' | 'value' | 'onChange'> {
  name: Path<T>;
}

export function FormSelect<T extends FieldValues>({ name, ...props }: FormSelectProps<T>) {
  const {
    formState: { errors, touchedFields },
  } = useFormContext<T>();
  const error = errors[name];
  const isTouched = name in touchedFields;

  return (
    <Controller<T>
      name={name}
      render={({ field }) => (
        <Select
          {...props}
          value={field.value as string}
          onChange={(value) => field.onChange(value as PathValue<T, Path<T>>)}
          error={isTouched && error ? String(error.message) : undefined}
        />
      )}
    />
  );
}

// ============ Form Checkbox ============

interface FormCheckboxProps<T extends FieldValues> extends Omit<CheckboxProps, 'name' | 'checked' | 'onChange'> {
  name: Path<T>;
}

export function FormCheckbox<T extends FieldValues>({ name, ...props }: FormCheckboxProps<T>) {
  return (
    <Controller<T>
      name={name}
      render={({ field }) => (
        <Checkbox {...props} checked={field.value as boolean} onChange={(e) => field.onChange(e.target.checked as PathValue<T, Path<T>>)} />
      )}
    />
  );
}

// ============ Re-export essentials ============

export { useForm, FormProvider, useFormContext } from 'react-hook-form';
export { zodResolver } from '@hookform/resolvers/zod';
export type { SubmitHandler, UseFormReturn } from 'react-hook-form';
