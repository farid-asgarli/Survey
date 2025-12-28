# Form Management Guide

This project uses **React Hook Form** with **Zod** for form validation. This guide explains how to create and manage forms consistently.

## Quick Start

```tsx
import { useForm, FormProvider, zodResolver, type SubmitHandler } from '@/lib/form';
import { loginSchema, type LoginFormData } from '@/lib/validations';

function MyForm() {
  const methods = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
    mode: 'onBlur', // Validate on blur (recommended)
  });

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    // data is fully typed and validated
    console.log(data.email, data.password);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>{/* Form fields */}</form>
    </FormProvider>
  );
}
```

---

## File Structure

```
src/lib/
├── form.tsx        # Form helpers & re-exports
├── validations.ts  # Zod schemas & types
└── FORMS.md        # This guide
```

---

## Creating a New Form

### Step 1: Define a Zod Schema

Add your schema to `src/lib/validations.ts`:

```ts
import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  subscribe: z.boolean(),
});

// Infer TypeScript type from schema
export type ContactFormData = z.infer<typeof contactSchema>;
```

### Step 2: Create the Form Component

```tsx
import { useState } from 'react';
import { useForm, FormProvider, zodResolver, type SubmitHandler } from '@/lib/form';
import { contactSchema, type ContactFormData } from '@/lib/validations';
import { Input, Textarea, Checkbox, Button } from '@/components/ui';

export function ContactForm() {
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
      subscribe: false,
    },
    mode: 'onBlur',
  });

  const {
    register,
    formState: { errors, touchedFields },
    handleSubmit,
  } = methods;

  const onSubmit: SubmitHandler<ContactFormData> = async (data) => {
    setIsLoading(true);
    try {
      await sendContact(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input label="Name" {...register('name')} error={touchedFields.name ? errors.name?.message : undefined} />

      <Input label="Email" type="email" {...register('email')} error={touchedFields.email ? errors.email?.message : undefined} />

      <Textarea label="Message" {...register('message')} error={touchedFields.message ? errors.message?.message : undefined} />

      <Checkbox label="Subscribe to newsletter" {...register('subscribe')} />

      <Button type="submit" loading={isLoading}>
        Send
      </Button>
    </form>
  );
}
```

---

## Using FormProvider (Parent-Child Pattern)

When form state needs to be shared between parent and child components:

**Parent Component:**

```tsx
function ParentPage() {
  const methods = useForm<MyFormData>({
    resolver: zodResolver(mySchema),
    defaultValues: {
      /* ... */
    },
  });

  const onSubmit: SubmitHandler<MyFormData> = async (data) => {
    // Handle submission
  };

  return (
    <FormProvider {...methods}>
      <ChildForm onSubmit={methods.handleSubmit(onSubmit)} />
    </FormProvider>
  );
}
```

**Child Component:**

```tsx
import { useFormContext } from '@/lib/form';
import type { MyFormData } from '@/lib/validations';

function ChildForm({ onSubmit }: { onSubmit: () => void }) {
  const {
    register,
    formState: { errors, touchedFields },
  } = useFormContext<MyFormData>();

  return (
    <form onSubmit={onSubmit}>
      <Input {...register('fieldName')} error={touchedFields.fieldName ? errors.fieldName?.message : undefined} />
    </form>
  );
}
```

---

## Available Zod Schemas

### Base Schemas (Reusable)

| Schema                            | Description                                                  |
| --------------------------------- | ------------------------------------------------------------ |
| `emailSchema`                     | Email validation                                             |
| `passwordSchema`                  | Basic password (min 8 chars)                                 |
| `strongPasswordSchema`            | Strong password (uppercase, lowercase, number, special char) |
| `nameSchema(fieldName)`           | Name field (2-50 chars)                                      |
| `requiredStringSchema(fieldName)` | Non-empty string                                             |

### Pre-built Form Schemas

| Schema                | Type                    | Fields                                                |
| --------------------- | ----------------------- | ----------------------------------------------------- |
| `loginSchema`         | `LoginFormData`         | email, password, rememberMe                           |
| `registerSchema`      | `RegisterFormData`      | firstName, lastName, email, password, confirmPassword |
| `resetPasswordSchema` | `ResetPasswordFormData` | password, confirmPassword                             |

---

## Common Patterns

### Conditional Validation

```ts
const schema = z
  .object({
    hasPhone: z.boolean(),
    phone: z.string().optional(),
  })
  .refine((data) => !data.hasPhone || (data.phone && data.phone.length >= 10), { message: 'Phone is required', path: ['phone'] });
```

### Password Confirmation

```ts
const schema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });
```

### Array Fields

```ts
const schema = z.object({
  tags: z.array(z.string()).min(1, 'At least one tag required'),
});
```

### Watch Field Values

```tsx
const { watch } = useFormContext<MyFormData>();
const password = watch('password'); // Reactive to changes

// Use for password strength indicator, conditional rendering, etc.
```

### Manual Trigger Validation

```tsx
const { trigger } = useFormContext();

// Validate single field
await trigger('email');

// Validate multiple fields
await trigger(['email', 'password']);

// Validate all fields
await trigger();
```

### Set Values Programmatically

```tsx
const { setValue, reset } = useFormContext<MyFormData>();

// Set single field
setValue('email', 'user@example.com');

// Reset entire form
reset({ email: '', password: '' });
```

---

## Password Requirements Helper

```tsx
import { getPasswordRequirements, areAllRequirementsMet } from '@/lib/validations';

function PasswordField() {
  const { watch } = useFormContext();
  const password = watch('password') || '';

  const requirements = getPasswordRequirements(password);
  const isValid = areAllRequirementsMet(password);

  return (
    <>
      <Input type="password" {...register('password')} />
      <ul>
        {requirements.map((req, i) => (
          <li key={i} className={req.met ? 'text-green-500' : 'text-gray-400'}>
            {req.label}
          </li>
        ))}
      </ul>
    </>
  );
}
```

---

## Validation Modes

| Mode        | When Validation Runs                     |
| ----------- | ---------------------------------------- |
| `onBlur`    | When field loses focus (recommended)     |
| `onChange`  | On every keystroke (can be slow)         |
| `onSubmit`  | Only on form submission                  |
| `onTouched` | On blur, then on change after first blur |
| `all`       | On blur and change                       |

```tsx
const methods = useForm({
  mode: 'onBlur', // Choose based on UX needs
});
```

---

## Migration Checklist

When converting an existing form:

- [ ] Create Zod schema in `validations.ts`
- [ ] Export inferred type (`type MyFormData = z.infer<typeof mySchema>`)
- [ ] Replace `useState` for form fields with `useForm`
- [ ] Replace manual validation with `zodResolver`
- [ ] Use `register()` for inputs instead of `value` + `onChange`
- [ ] Use `formState.errors` instead of custom error state
- [ ] Use `formState.touchedFields` instead of custom touched state
- [ ] Wrap with `FormProvider` if using child components
