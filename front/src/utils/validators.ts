// Form validation utilities for Survey App

// ============ Email Validation ============
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateEmail(email: string): string | null {
  if (!email) {
    return 'Email is required';
  }
  if (!isValidEmail(email)) {
    return 'Please enter a valid email address';
  }
  return null;
}

// ============ Password Validation ============
export interface PasswordRequirement {
  label: string;
  met: boolean;
  validator: (password: string) => boolean;
}

export function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    {
      label: 'At least 8 characters',
      met: password.length >= 8,
      validator: (p) => p.length >= 8,
    },
    {
      label: 'Contains uppercase letter',
      met: /[A-Z]/.test(password),
      validator: (p) => /[A-Z]/.test(p),
    },
    {
      label: 'Contains lowercase letter',
      met: /[a-z]/.test(password),
      validator: (p) => /[a-z]/.test(p),
    },
    {
      label: 'Contains number',
      met: /[0-9]/.test(password),
      validator: (p) => /[0-9]/.test(p),
    },
    {
      label: 'Contains special character (!@#$%^&*)',
      met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      validator: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
    },
  ];
}

export function calculatePasswordStrength(password: string): {
  score: number; // 0-4
  label: string;
  color: string;
} {
  const requirements = getPasswordRequirements(password);
  const metCount = requirements.filter((r) => r.met).length;

  const strengthMap = [
    { score: 0, label: 'Very weak', color: 'bg-error' },
    { score: 1, label: 'Weak', color: 'bg-error' },
    { score: 2, label: 'Fair', color: 'bg-warning' },
    { score: 3, label: 'Good', color: 'bg-tertiary' },
    { score: 4, label: 'Strong', color: 'bg-success' },
  ];

  // Additional checks for stronger passwords
  let score = metCount;

  // Bonus for length
  if (password.length >= 12) {
    score = Math.min(score + 1, 5);
  }

  // Map to 0-4 range
  const normalizedScore = Math.min(Math.floor((score * 4) / 5), 4);

  return strengthMap[normalizedScore];
}

export function isStrongPassword(password: string): boolean {
  const requirements = getPasswordRequirements(password);
  return requirements.every((r) => r.met);
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  return null;
}

export function validateConfirmPassword(password: string, confirmPassword: string): string | null {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
}

// ============ Name Validation ============
export function validateName(name: string, fieldName = 'Name'): string | null {
  if (!name) {
    return `${fieldName} is required`;
  }
  if (name.length < 2) {
    return `${fieldName} must be at least 2 characters`;
  }
  if (name.length > 50) {
    return `${fieldName} must be less than 50 characters`;
  }
  return null;
}

// ============ Generic Field Validation ============
export function validateRequired(value: string, fieldName = 'This field'): string | null {
  if (!value || !value.trim()) {
    return `${fieldName} is required`;
  }
  return null;
}

export function validateMinLength(value: string, minLength: number, fieldName = 'This field'): string | null {
  if (value && value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
}

export function validateMaxLength(value: string, maxLength: number, fieldName = 'This field'): string | null {
  if (value && value.length > maxLength) {
    return `${fieldName} must be less than ${maxLength} characters`;
  }
  return null;
}

// ============ Form Validation Hook Helper ============
export interface ValidationRule<T> {
  validate: (value: T, formData?: Record<string, unknown>) => string | null;
}

export interface FieldValidation {
  error: string | null;
  touched: boolean;
  validate: () => boolean;
}

export function createFieldValidator<T>(value: T, rules: ValidationRule<T>[], formData?: Record<string, unknown>): string | null {
  for (const rule of rules) {
    const error = rule.validate(value, formData);
    if (error) {
      return error;
    }
  }
  return null;
}

// ============ Common Validation Rules ============
export const rules = {
  required: (fieldName?: string): ValidationRule<string> => ({
    validate: (value) => validateRequired(value, fieldName),
  }),
  email: (): ValidationRule<string> => ({
    validate: validateEmail,
  }),
  password: (): ValidationRule<string> => ({
    validate: validatePassword,
  }),
  strongPassword: (): ValidationRule<string> => ({
    validate: (value) => (isStrongPassword(value) ? null : 'Password does not meet requirements'),
  }),
  minLength: (min: number, fieldName?: string): ValidationRule<string> => ({
    validate: (value) => validateMinLength(value, min, fieldName),
  }),
  maxLength: (max: number, fieldName?: string): ValidationRule<string> => ({
    validate: (value) => validateMaxLength(value, max, fieldName),
  }),
  match: (getOtherValue: () => string, message = 'Values do not match'): ValidationRule<string> => ({
    validate: (value) => (value === getOtherValue() ? null : message),
  }),
};
