/**
 * Validation utilities for form inputs
 */

/**
 * Interface for form validation rule
 */
export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

/**
 * Validate required fields
 */
export const required = (message = 'This field is required'): ValidationRule => ({
  validate: (value) => {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== undefined && value !== null;
  },
  message,
});

/**
 * Validate minimum string length
 */
export const minLength = (min: number, message = `Minimum length is ${min} characters`): ValidationRule => ({
  validate: (value) => {
    if (typeof value === 'string') {
      return value.trim().length >= min;
    }
    return false;
  },
  message,
});

/**
 * Validate maximum string length
 */
export const maxLength = (max: number, message = `Maximum length is ${max} characters`): ValidationRule => ({
  validate: (value) => {
    if (typeof value === 'string') {
      return value.trim().length <= max;
    }
    return false;
  },
  message,
});

/**
 * Validate minimum number value
 */
export const minValue = (min: number, message = `Minimum value is ${min}`): ValidationRule => ({
  validate: (value) => {
    const numValue = parseFloat(value);
    return !isNaN(numValue) && numValue >= min;
  },
  message,
});

/**
 * Validate maximum number value
 */
export const maxValue = (max: number, message = `Maximum value is ${max}`): ValidationRule => ({
  validate: (value) => {
    const numValue = parseFloat(value);
    return !isNaN(numValue) && numValue <= max;
  },
  message,
});

/**
 * Validate using a regular expression pattern
 */
export const pattern = (regex: RegExp, message = 'Invalid format'): ValidationRule => ({
  validate: (value) => {
    if (typeof value === 'string') {
      return regex.test(value);
    }
    return false;
  },
  message,
});

/**
 * Validate using a custom function
 */
export const custom = (validateFn: (value: any) => boolean, message: string): ValidationRule => ({
  validate: validateFn,
  message,
});

/**
 * Validate a form field with multiple rules
 * Returns the first error message if validation fails, or null if validation passes
 */
export const validateField = (value: any, rules: ValidationRule[]): string | null => {
  for (const rule of rules) {
    if (!rule.validate(value)) {
      return rule.message;
    }
  }
  return null;
};

/**
 * Validate the entire form
 * Returns an object with field names as keys and error messages as values
 */
export const validateForm = (values: Record<string, any>, validationRules: Record<string, ValidationRule[]>): Record<string, string> => {
  const errors: Record<string, string> = {};

  Object.keys(validationRules).forEach(field => {
    const fieldValue = values[field];
    const fieldRules = validationRules[field];
    
    const errorMessage = validateField(fieldValue, fieldRules);
    if (errorMessage) {
      errors[field] = errorMessage;
    }
  });

  return errors;
};