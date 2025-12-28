// Validation Patterns - Pre-defined regex patterns and validation utilities for survey questions

/**
 * Pre-defined validation presets that users can choose from
 */
export interface ValidationPreset {
  id: string;
  nameKey: string;
  descriptionKey: string;
  pattern: string;
  placeholder?: string;
  inputMode?: 'text' | 'email' | 'tel' | 'url' | 'numeric';
}

/**
 * Phone number validation presets
 */
export const PHONE_PRESETS: ValidationPreset[] = [
  {
    id: 'phone-international',
    nameKey: 'questionEditor.phone.formats.international',
    descriptionKey: 'questionEditor.phone.formats.internationalDesc',
    pattern: '^\\+?[1-9]\\d{1,14}$',
    placeholder: '+1 234 567 8900',
    inputMode: 'tel',
  },
  {
    id: 'phone-us',
    nameKey: 'questionEditor.phone.formats.usCanada',
    descriptionKey: 'questionEditor.phone.formats.usCanadaDesc',
    pattern: '^\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$',
    placeholder: '(555) 123-4567',
    inputMode: 'tel',
  },
  {
    id: 'phone-uk',
    nameKey: 'questionEditor.phone.formats.uk',
    descriptionKey: 'questionEditor.phone.formats.ukDesc',
    pattern: '^(\\+44|0)\\d{10,11}$',
    placeholder: '07911 123456',
    inputMode: 'tel',
  },
  {
    id: 'phone-eu',
    nameKey: 'questionEditor.phone.formats.european',
    descriptionKey: 'questionEditor.phone.formats.europeanDesc',
    pattern: '^\\+?[0-9\\s-]{8,20}$',
    placeholder: '+49 30 12345678',
    inputMode: 'tel',
  },
  {
    id: 'phone-digits-only',
    nameKey: 'questionEditor.phone.formats.digitsOnly',
    descriptionKey: 'questionEditor.phone.formats.digitsOnlyDesc',
    pattern: '^[0-9]{7,15}$',
    placeholder: '5551234567',
    inputMode: 'tel',
  },
  {
    id: 'phone-flexible',
    nameKey: 'questionEditor.phone.formats.flexible',
    descriptionKey: 'questionEditor.phone.formats.flexibleDesc',
    pattern: '^[+]?[(]?[0-9]{1,4}[)]?[-\\s./0-9]*$',
    placeholder: 'questionEditor.phone.formats.anyFormat',
    inputMode: 'tel',
  },
];

/**
 * Email validation preset
 */
export const EMAIL_PATTERN: ValidationPreset = {
  id: 'email',
  nameKey: 'common.email',
  descriptionKey: 'questionEditor.email.validationHelper',
  pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
  placeholder: 'email@example.com',
  inputMode: 'email',
};

/**
 * URL validation presets
 */
export const URL_PRESETS: ValidationPreset[] = [
  {
    id: 'url-standard',
    nameKey: 'questionEditor.url.formats.standard',
    descriptionKey: 'questionEditor.url.formats.standardDesc',
    pattern: '^https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+[\\/\\w\\-.,@?^=%&:/~+#]*$',
    placeholder: 'https://example.com',
    inputMode: 'url',
  },
  {
    id: 'url-flexible',
    nameKey: 'questionEditor.url.formats.flexible',
    descriptionKey: 'questionEditor.url.formats.flexibleDesc',
    pattern: '^(https?:\\/\\/)?([\\w\\-]+\\.)+[\\w\\-]+(\\/[\\w\\-.,@?^=%&:/~+#]*)?$',
    placeholder: 'example.com',
    inputMode: 'url',
  },
];

/**
 * Number validation presets
 */
export const NUMBER_PRESETS: ValidationPreset[] = [
  {
    id: 'number-integer',
    nameKey: 'questionEditor.number.formats.integer',
    descriptionKey: 'questionEditor.number.formats.integerDesc',
    pattern: '^-?\\d+$',
    placeholder: '123',
    inputMode: 'numeric',
  },
  {
    id: 'number-decimal',
    nameKey: 'questionEditor.number.formats.decimal',
    descriptionKey: 'questionEditor.number.formats.decimalDesc',
    pattern: '^-?\\d+(\\.\\d+)?$',
    placeholder: '123.45',
    inputMode: 'numeric',
  },
  {
    id: 'number-positive',
    nameKey: 'questionEditor.number.formats.positive',
    descriptionKey: 'questionEditor.number.formats.positiveDesc',
    pattern: '^\\d+(\\.\\d+)?$',
    placeholder: '123',
    inputMode: 'numeric',
  },
];

/**
 * Other common validation presets
 */
export const OTHER_PRESETS: ValidationPreset[] = [
  {
    id: 'zip-us',
    nameKey: 'questionEditor.validation.presets.usZipCode',
    descriptionKey: 'questionEditor.validation.presets.usZipCodeDesc',
    pattern: '^\\d{5}(-\\d{4})?$',
    placeholder: '12345 or 12345-6789',
  },
  {
    id: 'zip-uk',
    nameKey: 'questionEditor.validation.presets.ukPostcode',
    descriptionKey: 'questionEditor.validation.presets.ukPostcodeDesc',
    pattern: '^[A-Z]{1,2}\\d[A-Z\\d]? ?\\d[A-Z]{2}$',
    placeholder: 'SW1A 1AA',
  },
  {
    id: 'alphanumeric',
    nameKey: 'questionEditor.validation.presets.alphanumeric',
    descriptionKey: 'questionEditor.validation.presets.alphanumericDesc',
    pattern: '^[a-zA-Z0-9]+$',
    placeholder: 'abc123',
  },
  {
    id: 'letters-only',
    nameKey: 'questionEditor.validation.presets.lettersOnly',
    descriptionKey: 'questionEditor.validation.presets.lettersOnlyDesc',
    pattern: '^[a-zA-Z\\s]+$',
    placeholder: 'John Doe',
  },
];

/**
 * All presets grouped by category
 */
export const ALL_PRESETS = {
  phone: PHONE_PRESETS,
  email: [EMAIL_PATTERN],
  url: URL_PRESETS,
  number: NUMBER_PRESETS,
  other: OTHER_PRESETS,
};

/**
 * Get preset by ID
 */
export function getPresetById(id: string): ValidationPreset | undefined {
  const allPresets = [...PHONE_PRESETS, EMAIL_PATTERN, ...URL_PRESETS, ...NUMBER_PRESETS, ...OTHER_PRESETS];
  return allPresets.find((p) => p.id === id);
}

/**
 * Get presets for a specific question type
 */
export function getPresetsForQuestionType(questionType: string): ValidationPreset[] {
  switch (questionType) {
    case 'Phone':
      return PHONE_PRESETS;
    case 'Email':
      return [EMAIL_PATTERN];
    case 'Url':
      return URL_PRESETS;
    case 'Number':
      return NUMBER_PRESETS;
    default:
      return OTHER_PRESETS;
  }
}

/**
 * Validate a value against a pattern
 */
export function validatePattern(value: string, pattern: string): boolean {
  if (!value || !pattern) return true;
  try {
    const regex = new RegExp(pattern);
    return regex.test(value);
  } catch {
    // Invalid regex pattern, consider it valid to avoid blocking user
    console.warn('Invalid validation pattern:', pattern);
    return true;
  }
}

/**
 * Validate email format
 */
export function validateEmail(value: string): boolean {
  if (!value) return true;
  return validatePattern(value, EMAIL_PATTERN.pattern);
}

/**
 * Validate phone number with preset
 */
export function validatePhone(value: string, presetId?: string): boolean {
  if (!value) return true;

  if (presetId) {
    const preset = getPresetById(presetId);
    if (preset) {
      return validatePattern(value, preset.pattern);
    }
  }

  // Default: flexible phone validation
  const flexiblePreset = PHONE_PRESETS.find((p) => p.id === 'phone-flexible');
  return validatePattern(value, flexiblePreset?.pattern || '');
}

/**
 * Validate URL format
 */
export function validateUrl(value: string, presetId?: string): boolean {
  if (!value) return true;

  if (presetId) {
    const preset = getPresetById(presetId);
    if (preset) {
      return validatePattern(value, preset.pattern);
    }
  }

  // Default: flexible URL validation
  const flexiblePreset = URL_PRESETS.find((p) => p.id === 'url-flexible');
  return validatePattern(value, flexiblePreset?.pattern || '');
}

/**
 * Get validation result with error message
 */
export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Comprehensive validation for a question type
 */
export function validateQuestionValue(
  value: string,
  questionType: string,
  settings?: {
    validationPattern?: string;
    validationMessage?: string;
    validationPreset?: string;
  }
): ValidationResult {
  if (!value) {
    return { isValid: true };
  }

  // If custom pattern is provided, use that
  if (settings?.validationPattern) {
    const isValid = validatePattern(value, settings.validationPattern);
    return {
      isValid,
      errorMessage: isValid ? undefined : settings.validationMessage || 'Invalid format',
    };
  }

  // If preset is provided, use that
  if (settings?.validationPreset) {
    const preset = getPresetById(settings.validationPreset);
    if (preset) {
      const isValid = validatePattern(value, preset.pattern);
      return {
        isValid,
        errorMessage: isValid ? undefined : settings.validationMessage || `Invalid format`,
      };
    }
  }

  // Default validation based on question type
  switch (questionType) {
    case 'Email': {
      const isValid = validateEmail(value);
      return {
        isValid,
        errorMessage: isValid ? undefined : settings?.validationMessage || 'Please enter a valid email address',
      };
    }
    case 'Phone': {
      const isValid = validatePhone(value, settings?.validationPreset);
      return {
        isValid,
        errorMessage: isValid ? undefined : settings?.validationMessage || 'Please enter a valid phone number',
      };
    }
    case 'Url': {
      const isValid = validateUrl(value, settings?.validationPreset);
      return {
        isValid,
        errorMessage: isValid ? undefined : settings?.validationMessage || 'Please enter a valid URL',
      };
    }
    default:
      return { isValid: true };
  }
}

/**
 * Get HTML input type for question type
 */
export function getInputTypeForQuestion(questionType: string): string {
  switch (questionType) {
    case 'Email':
      return 'email';
    case 'Phone':
      return 'tel';
    case 'Url':
      return 'url';
    case 'Number':
      return 'text'; // Use text with inputMode for better control
    default:
      return 'text';
  }
}

/**
 * Get HTML inputMode for question type
 */
export function getInputModeForQuestion(questionType: string): 'text' | 'email' | 'tel' | 'url' | 'numeric' | undefined {
  switch (questionType) {
    case 'Email':
      return 'email';
    case 'Phone':
      return 'tel';
    case 'Url':
      return 'url';
    case 'Number':
      return 'numeric';
    default:
      return 'text';
  }
}
