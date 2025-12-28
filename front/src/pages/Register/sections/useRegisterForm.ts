import { useState, useCallback } from 'react';
import { validateEmail, validateName, getPasswordRequirements, validateConfirmPassword } from '@/utils/validators';
import type { FormErrors, RegisterFormData } from './types';

/**
 * useRegisterForm
 * Custom hook to manage register form state and validation
 */
export function useRegisterForm() {
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const passwordRequirements = getPasswordRequirements(formData.password);
  const allRequirementsMet = passwordRequirements.every((r) => r.met);

  const validateField = useCallback(
    (field: keyof FormErrors): string | null => {
      switch (field) {
        case 'firstName':
          return validateName(formData.firstName, 'First name');
        case 'lastName':
          return validateName(formData.lastName, 'Last name');
        case 'email':
          return validateEmail(formData.email);
        case 'password':
          return formData.password && !allRequirementsMet ? 'Please meet all password requirements' : null;
        case 'confirmPassword':
          return validateConfirmPassword(formData.password, formData.confirmPassword);
        default:
          return null;
      }
    },
    [formData, allRequirementsMet]
  );

  const handleBlur = (field: keyof FormErrors) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field);
    setFieldErrors((prev) => ({ ...prev, [field]: error || undefined }));
  };

  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    const firstNameError = validateName(formData.firstName, 'First name');
    if (firstNameError) errors.firstName = firstNameError;

    const lastNameError = validateName(formData.lastName, 'Last name');
    if (lastNameError) errors.lastName = lastNameError;

    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    if (!allRequirementsMet) {
      errors.password = 'Please meet all password requirements';
    }

    const confirmError = validateConfirmPassword(formData.password, formData.confirmPassword);
    if (confirmError) errors.confirmPassword = confirmError;

    setFieldErrors(errors);
    setTouched({ firstName: true, lastName: true, email: true, password: true, confirmPassword: true });
    return Object.keys(errors).length === 0;
  }, [formData, allRequirementsMet]);

  const updateField = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    updateField,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    fieldErrors,
    touched,
    handleBlur,
    validateForm,
  };
}
