/**
 * API Contract Validation Utilities
 *
 * Runtime validation for API responses to catch backend/frontend mismatches early.
 * Use these in development to identify issues before they hit production.
 */

// ============ Type Guards & Validators ============

type ValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

type Validator<T> = (data: T, path?: string) => ValidationResult;

// Utility to merge validation results
const mergeResults = (...results: ValidationResult[]): ValidationResult => ({
  valid: results.every((r) => r.valid),
  errors: results.flatMap((r) => r.errors),
  warnings: results.flatMap((r) => r.warnings),
});

// Base validators
const isString = (value: unknown): value is string => typeof value === 'string';
const isNumber = (value: unknown): value is number => typeof value === 'number';
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
const isArray = (value: unknown): value is unknown[] => Array.isArray(value);
const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isNullOrUndefined = (value: unknown): value is null | undefined => value === null || value === undefined;

// Create a field validator
const validateField = (
  obj: Record<string, unknown>,
  field: string,
  type: 'string' | 'number' | 'boolean' | 'array' | 'object',
  required: boolean,
  path: string
): ValidationResult => {
  const value = obj[field];
  const fullPath = path ? `${path}.${field}` : field;

  if (isNullOrUndefined(value)) {
    if (required) {
      return { valid: false, errors: [`Missing required field: ${fullPath}`], warnings: [] };
    }
    return { valid: true, errors: [], warnings: [] };
  }

  const typeChecks: Record<string, (v: unknown) => boolean> = {
    string: isString,
    number: isNumber,
    boolean: isBoolean,
    array: isArray,
    object: isObject,
  };

  if (!typeChecks[type](value)) {
    return {
      valid: false,
      errors: [`Invalid type for ${fullPath}: expected ${type}, got ${typeof value}`],
      warnings: [],
    };
  }

  return { valid: true, errors: [], warnings: [] };
};

// ============ Auth Response Validators ============

export const validateAuthResponse: Validator<unknown> = (data, path = 'authResponse') => {
  if (!isObject(data)) {
    return { valid: false, errors: [`${path} is not an object`], warnings: [] };
  }

  const results: ValidationResult[] = [
    validateField(data, 'token', 'string', true, path),
    validateField(data, 'refreshToken', 'string', true, path),
    validateField(data, 'expiresAt', 'string', true, path),
    validateField(data, 'user', 'object', true, path),
  ];

  // Validate nested user object
  if (isObject(data.user)) {
    const userPath = `${path}.user`;
    results.push(
      validateField(data.user as Record<string, unknown>, 'id', 'string', true, userPath),
      validateField(data.user as Record<string, unknown>, 'email', 'string', true, userPath)
    );

    // Check for nullable firstName/lastName - warn if null
    const user = data.user as Record<string, unknown>;
    if (user.firstName === null) {
      results.push({ valid: true, errors: [], warnings: [`${userPath}.firstName is null - frontend expects string`] });
    }
    if (user.lastName === null) {
      results.push({ valid: true, errors: [], warnings: [`${userPath}.lastName is null - frontend expects string`] });
    }
  }

  return mergeResults(...results);
};

// ============ Survey Validators ============

const VALID_SURVEY_STATUSES = ['Draft', 'Published', 'Closed', 'Archived'];

export const validateSurvey: Validator<unknown> = (data, path = 'survey') => {
  if (!isObject(data)) {
    return { valid: false, errors: [`${path} is not an object`], warnings: [] };
  }

  const results: ValidationResult[] = [
    validateField(data, 'id', 'string', true, path),
    validateField(data, 'namespaceId', 'string', true, path),
    validateField(data, 'title', 'string', true, path),
    validateField(data, 'status', 'string', true, path),
    validateField(data, 'questionCount', 'number', true, path),
    validateField(data, 'responseCount', 'number', true, path),
    validateField(data, 'createdAt', 'string', true, path),
    validateField(data, 'allowMultipleResponses', 'boolean', true, path),
  ];

  // Validate status enum
  if (isString(data.status) && !VALID_SURVEY_STATUSES.includes(data.status)) {
    results.push({
      valid: false,
      errors: [`${path}.status has invalid value: ${data.status}. Expected one of: ${VALID_SURVEY_STATUSES.join(', ')}`],
      warnings: [],
    });
  }

  return mergeResults(...results);
};

export const validateSurveyList: Validator<unknown> = (data, path = 'surveyList') => {
  if (!isObject(data)) {
    return { valid: false, errors: [`${path} is not an object`], warnings: [] };
  }

  const results: ValidationResult[] = [
    validateField(data, 'items', 'array', true, path),
    validateField(data, 'totalCount', 'number', true, path),
    validateField(data, 'pageNumber', 'number', true, path),
    validateField(data, 'pageSize', 'number', true, path),
    validateField(data, 'totalPages', 'number', true, path),
    validateField(data, 'hasNextPage', 'boolean', true, path),
    validateField(data, 'hasPreviousPage', 'boolean', true, path),
  ];

  // Validate each item
  if (isArray(data.items)) {
    data.items.forEach((item, index) => {
      results.push(validateSurvey(item, `${path}.items[${index}]`));
    });
  }

  return mergeResults(...results);
};

// ============ Question Validators ============

const VALID_QUESTION_TYPES = [
  'SingleChoice',
  'MultipleChoice',
  'Text',
  'LongText',
  'Rating',
  'Scale',
  'Matrix',
  'Date',
  'DateTime',
  'FileUpload',
  'YesNo',
  'Dropdown',
  'NPS',
  'Checkbox',
  'Number',
  'ShortText',
  'Email',
  'Phone',
  'Url',
];

// Note: 'Ranking' is in frontend but NOT in backend
const FRONTEND_ONLY_QUESTION_TYPES = ['Ranking'];

export const validateQuestion: Validator<unknown> = (data, path = 'question') => {
  if (!isObject(data)) {
    return { valid: false, errors: [`${path} is not an object`], warnings: [] };
  }

  const results: ValidationResult[] = [
    validateField(data, 'id', 'string', true, path),
    validateField(data, 'surveyId', 'string', true, path),
    validateField(data, 'text', 'string', true, path),
    validateField(data, 'type', 'string', true, path),
    validateField(data, 'order', 'number', true, path),
    validateField(data, 'isRequired', 'boolean', true, path),
  ];

  // Validate question type
  if (isString(data.type)) {
    if (FRONTEND_ONLY_QUESTION_TYPES.includes(data.type)) {
      results.push({
        valid: true,
        errors: [],
        warnings: [`${path}.type '${data.type}' exists in frontend but NOT in backend - will fail on create`],
      });
    } else if (!VALID_QUESTION_TYPES.includes(data.type)) {
      results.push({
        valid: false,
        errors: [`${path}.type has invalid value: ${data.type}`],
        warnings: [],
      });
    }
  }

  return mergeResults(...results);
};

// ============ Logic Validators ============

const VALID_LOGIC_OPERATORS = [
  'Equals',
  'NotEquals',
  'Contains',
  'NotContains',
  'GreaterThan',
  'LessThan',
  'GreaterThanOrEquals',
  'LessThanOrEquals',
  'IsEmpty',
  'IsNotEmpty',
  'IsAnswered',
  'IsNotAnswered',
];

const FRONTEND_SUPPORTED_OPERATORS = ['Equals', 'NotEquals', 'Contains', 'GreaterThan', 'LessThan', 'IsAnswered', 'IsNotAnswered'];

const VALID_LOGIC_ACTIONS = ['Show', 'Hide', 'Skip', 'JumpTo', 'EndSurvey'];
const FRONTEND_SUPPORTED_ACTIONS = ['Show', 'Hide', 'Skip', 'EndSurvey'];

export const validateQuestionLogic: Validator<unknown> = (data, path = 'logic') => {
  if (!isObject(data)) {
    return { valid: false, errors: [`${path} is not an object`], warnings: [] };
  }

  const results: ValidationResult[] = [
    validateField(data, 'id', 'string', true, path),
    validateField(data, 'questionId', 'string', true, path),
    validateField(data, 'sourceQuestionId', 'string', true, path),
    validateField(data, 'operator', 'string', true, path),
    validateField(data, 'conditionValue', 'string', true, path),
    validateField(data, 'action', 'string', true, path),
    validateField(data, 'priority', 'number', true, path),
  ];

  // Check for unsupported operators (exist in backend but not frontend)
  if (isString(data.operator)) {
    if (!VALID_LOGIC_OPERATORS.includes(data.operator)) {
      results.push({
        valid: false,
        errors: [`${path}.operator has invalid value: ${data.operator}`],
        warnings: [],
      });
    } else if (!FRONTEND_SUPPORTED_OPERATORS.includes(data.operator)) {
      results.push({
        valid: true,
        errors: [],
        warnings: [`${path}.operator '${data.operator}' is not supported in frontend UI`],
      });
    }
  }

  // Check for unsupported actions
  if (isString(data.action)) {
    if (!VALID_LOGIC_ACTIONS.includes(data.action)) {
      results.push({
        valid: false,
        errors: [`${path}.action has invalid value: ${data.action}`],
        warnings: [],
      });
    } else if (!FRONTEND_SUPPORTED_ACTIONS.includes(data.action)) {
      results.push({
        valid: true,
        errors: [],
        warnings: [`${path}.action '${data.action}' (e.g., JumpTo) is not supported in frontend UI`],
      });
    }
  }

  return mergeResults(...results);
};

// ============ Link Validators ============

const VALID_LINK_TYPES = ['Public', 'Unique', 'Campaign', 'Embedded', 'QrCode'];
const FRONTEND_LINK_TYPES = ['Standard', 'Unique', 'Embedded']; // Note: Standard should be Public

export const validateSurveyLink: Validator<unknown> = (data, path = 'link') => {
  if (!isObject(data)) {
    return { valid: false, errors: [`${path} is not an object`], warnings: [] };
  }

  const results: ValidationResult[] = [
    validateField(data, 'id', 'string', true, path),
    validateField(data, 'surveyId', 'string', true, path),
    validateField(data, 'token', 'string', true, path),
    validateField(data, 'fullUrl', 'string', true, path),
    validateField(data, 'type', 'string', true, path),
    validateField(data, 'isActive', 'boolean', true, path),
    validateField(data, 'usageCount', 'number', true, path),
    validateField(data, 'responseCount', 'number', true, path),
    validateField(data, 'hasPassword', 'boolean', true, path),
    validateField(data, 'createdAt', 'string', true, path),
  ];

  // Check link type
  if (isString(data.type)) {
    if (!VALID_LINK_TYPES.includes(data.type) && !FRONTEND_LINK_TYPES.includes(data.type)) {
      results.push({
        valid: false,
        errors: [`${path}.type has invalid value: ${data.type}`],
        warnings: [],
      });
    }
    if (data.type === 'Standard') {
      results.push({
        valid: true,
        errors: [],
        warnings: [`${path}.type 'Standard' should be 'Public' according to backend`],
      });
    }
    if (data.type === 'Campaign' || data.type === 'QrCode') {
      results.push({
        valid: true,
        errors: [],
        warnings: [`${path}.type '${data.type}' exists in backend but not in frontend types`],
      });
    }
  }

  return mergeResults(...results);
};

// ============ Distribution Validators ============

export const validateEmailDistribution: Validator<unknown> = (data, path = 'distribution') => {
  if (!isObject(data)) {
    return { valid: false, errors: [`${path} is not an object`], warnings: [] };
  }

  const results: ValidationResult[] = [
    validateField(data, 'id', 'string', true, path),
    validateField(data, 'surveyId', 'string', true, path),
    validateField(data, 'subject', 'string', true, path),
    validateField(data, 'body', 'string', true, path),
    validateField(data, 'status', 'string', true, path),
    validateField(data, 'createdAt', 'string', true, path),
  ];

  // Backend has these that frontend might miss
  if (data.surveyTitle !== undefined) {
    results.push({
      valid: true,
      errors: [],
      warnings: [`${path}.surveyTitle exists in response but not in frontend type`],
    });
  }
  if (data.emailTemplateId !== undefined && data.templateId === undefined) {
    results.push({
      valid: true,
      errors: [],
      warnings: [`${path} uses emailTemplateId (backend) not templateId (frontend)`],
    });
  }

  return mergeResults(...results);
};

// ============ Theme Validators ============

export const validateTheme: Validator<unknown> = (data, path = 'theme') => {
  if (!isObject(data)) {
    return { valid: false, errors: [`${path} is not an object`], warnings: [] };
  }

  const results: ValidationResult[] = [
    validateField(data, 'id', 'string', true, path),
    validateField(data, 'name', 'string', true, path),
    validateField(data, 'isDefault', 'boolean', true, path),
    validateField(data, 'isPublic', 'boolean', true, path),
    validateField(data, 'isSystem', 'boolean', true, path),
    validateField(data, 'isDark', 'boolean', true, path),
    validateField(data, 'usageCount', 'number', true, path),
    validateField(data, 'createdAt', 'string', true, path),
  ];

  // Check for nested vs flat structure
  if (data.colors !== undefined && isObject(data.colors)) {
    // Has nested structure (detailed response)
    results.push({
      valid: true,
      errors: [],
      warnings: [],
    });
  } else if (data.primaryColor !== undefined) {
    // Has flat structure (summary response)
    results.push({
      valid: true,
      errors: [],
      warnings: [],
    });
  }

  return mergeResults(...results);
};

// ============ Response Validators ============

export const validateSurveyResponse: Validator<unknown> = (data, path = 'response') => {
  if (!isObject(data)) {
    return { valid: false, errors: [`${path} is not an object`], warnings: [] };
  }

  const results: ValidationResult[] = [
    validateField(data, 'id', 'string', true, path),
    validateField(data, 'surveyId', 'string', true, path),
    validateField(data, 'isComplete', 'boolean', true, path),
    validateField(data, 'startedAt', 'string', true, path),
    validateField(data, 'answers', 'array', true, path),
  ];

  // Backend has additional fields frontend might want
  const backendOnlyFields = ['respondentName', 'timeSpentSeconds', 'ipAddress'];
  backendOnlyFields.forEach((field) => {
    if (data[field] !== undefined) {
      results.push({
        valid: true,
        errors: [],
        warnings: [`${path}.${field} available from backend but not typed in frontend`],
      });
    }
  });

  return mergeResults(...results);
};

// ============ Generic API Response Validator ============

export const validatePaginatedResponse: Validator<unknown> = (data, path = 'paginatedResponse') => {
  if (!isObject(data)) {
    return { valid: false, errors: [`${path} is not an object`], warnings: [] };
  }

  return mergeResults(
    validateField(data, 'items', 'array', true, path),
    validateField(data, 'totalCount', 'number', true, path),
    validateField(data, 'pageNumber', 'number', true, path),
    validateField(data, 'pageSize', 'number', true, path),
    validateField(data, 'totalPages', 'number', true, path),
    validateField(data, 'hasNextPage', 'boolean', true, path),
    validateField(data, 'hasPreviousPage', 'boolean', true, path)
  );
};

// ============ Development Mode Validator Wrapper ============

/**
 * Wraps an API call to validate the response in development mode.
 * In production, it simply returns the data without validation.
 *
 * @example
 * const getSurvey = async (id: string) => {
 *   const data = await api.get(`/surveys/${id}`);
 *   return validateInDev(data, validateSurvey, 'getSurvey');
 * };
 */
export function validateInDev<T>(data: T, validator: Validator<T>, context: string): T {
  if (import.meta.env.DEV) {
    const result = validator(data);

    if (!result.valid) {
      console.error(`[API Validation Error] ${context}:`, result.errors);
    }

    if (result.warnings.length > 0) {
      console.warn(`[API Validation Warning] ${context}:`, result.warnings);
    }
  }

  return data;
}

/**
 * Creates a validated API wrapper for a service function.
 *
 * @example
 * export const surveysApi = {
 *   getById: createValidatedApi(
 *     async (id: string) => apiClient.get(`/surveys/${id}`),
 *     validateSurvey,
 *     'surveys.getById'
 *   ),
 * };
 */
export function createValidatedApi<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  validator: Validator<TResult>,
  context: string
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    const result = await fn(...args);
    return validateInDev(result, validator, context);
  };
}

// ============ Batch Validator for Full API Check ============

export interface ApiBatchValidationResult {
  endpoint: string;
  result: ValidationResult;
}

/**
 * Run validation on sample data from multiple endpoints.
 * Useful for generating a comprehensive mismatch report.
 *
 * @example
 * const results = await runBatchValidation({
 *   '/api/surveys': surveysApi.list(),
 *   '/api/surveys/123': surveysApi.getById('123'),
 * });
 */
export async function runBatchValidation(
  endpoints: Record<string, Promise<unknown>>,
  validators: Record<string, Validator<unknown>>
): Promise<ApiBatchValidationResult[]> {
  const results: ApiBatchValidationResult[] = [];

  for (const [endpoint, dataPromise] of Object.entries(endpoints)) {
    try {
      const data = await dataPromise;
      const validator = validators[endpoint];

      if (validator) {
        results.push({
          endpoint,
          result: validator(data),
        });
      } else {
        results.push({
          endpoint,
          result: {
            valid: true,
            errors: [],
            warnings: [`No validator defined for ${endpoint}`],
          },
        });
      }
    } catch (error) {
      results.push({
        endpoint,
        result: {
          valid: false,
          errors: [`Failed to fetch ${endpoint}: ${error instanceof Error ? error.message : 'Unknown error'}`],
          warnings: [],
        },
      });
    }
  }

  return results;
}

// ============ Type Mapping Helpers ============

/**
 * Maps frontend enum values to backend values where they differ.
 * Use this when sending data to the backend.
 */
export const mapToBackendValue = {
  linkType: (type: string): string => {
    const mapping: Record<string, string> = {
      Standard: 'Public',
    };
    return mapping[type] ?? type;
  },

  exportFormat: (format: string): string => {
    const mapping: Record<string, string> = {
      xlsx: 'Excel',
      csv: 'Csv',
      json: 'Json',
    };
    return mapping[format] ?? format;
  },
};

/**
 * Maps backend enum values to frontend values where they differ.
 * Use this when receiving data from the backend.
 */
export const mapFromBackendValue = {
  linkType: (type: string): string => {
    const mapping: Record<string, string> = {
      Public: 'Standard',
    };
    return mapping[type] ?? type;
  },
};

// ============ Export All Validators ============

export const validators = {
  authResponse: validateAuthResponse,
  survey: validateSurvey,
  surveyList: validateSurveyList,
  question: validateQuestion,
  questionLogic: validateQuestionLogic,
  surveyLink: validateSurveyLink,
  emailDistribution: validateEmailDistribution,
  theme: validateTheme,
  surveyResponse: validateSurveyResponse,
  paginatedResponse: validatePaginatedResponse,
};

export default validators;
