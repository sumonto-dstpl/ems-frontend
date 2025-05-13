/**
 * Form validation utilities
 * Provides consistent validation rules and error handling for forms
 */

/**
 * Validation rules for common field types
 */
export const validationRules = {
  // Text field validation
  required: (value: string) => !!value.trim() || 'This field is required',
  
  // Email validation
  email: (value: string) => 
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value) || 
    'Invalid email address',
  
  // Date validation
  date: (value: string) => {
    if (!value) return true;
    const date = new Date(value);
    return !isNaN(date.getTime()) || 'Invalid date';
  },
  
  // Number validation
  number: (value: string) => !isNaN(Number(value)) || 'Must be a number',
  
  // Min/max length validation
  minLength: (min: number) => (value: string) => 
    value.length >= min || `Must be at least ${min} characters`,
  
  maxLength: (max: number) => (value: string) => 
    value.length <= max || `Cannot exceed ${max} characters`,
  
  // Min/max value validation (for numbers)
  minValue: (min: number) => (value: number) => 
    value >= min || `Value must be at least ${min}`,
  
  maxValue: (max: number) => (value: number) => 
    value <= max || `Value cannot exceed ${max}`,
  
  // Future date validation
  futureDate: (value: string) => {
    if (!value) return true;
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today || 'Date must be in the future';
  },
  
  // Past date validation
  pastDate: (value: string) => {
    if (!value) return true;
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date <= today || 'Date must be in the past';
  },
  
  // Time format validation (HH:MM)
  timeFormat: (value: string) => {
    if (!value) return true;
    return /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/.test(value) || 'Invalid time format (HH:MM)';
  },
  
  // Password strength validation
  passwordStrength: (value: string) => {
    if (!value) return true;
    
    const hasLength = value.length >= 8;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value);
    
    const strength = [hasLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar]
      .filter(Boolean).length;
    
    if (strength < 3) {
      return 'Password must be at least 8 characters and include uppercase, lowercase, numbers, or special characters';
    }
    
    return true;
  },
  
  // Custom pattern validation
  pattern: (regexp: RegExp, message: string) => (value: string) => {
    if (!value) return true;
    return regexp.test(value) || message;
  }
};

/**
 * Validate a form field with multiple rules
 * @param value - The field value
 * @param rules - Array of validation functions
 * @returns Error message or true if valid
 */
export const validateField = (value: any, rules: Array<(value: any) => string | true>): string | true => {
  for (const rule of rules) {
    const result = rule(value);
    if (result !== true) {
      return result;
    }
  }
  return true;
};

/**
 * Validate multiple form fields
 * @param values - Object containing field values
 * @param validationSchema - Object containing validation rules for each field
 * @returns Object with field names and error messages
 */
export const validateForm = (
  values: Record<string, any>,
  validationSchema: Record<string, Array<(value: any) => string | true>>
): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  for (const field in validationSchema) {
    if (Object.prototype.hasOwnProperty.call(validationSchema, field)) {
      const value = values[field];
      const fieldRules = validationSchema[field];
      const error = validateField(value, fieldRules);
      
      if (error !== true) {
        errors[field] = error;
      }
    }
  }
  
  return errors;
};

/**
 * Create a form submission handler with validation
 * @param validationSchema - Object containing validation rules for each field
 * @param onSubmit - Function to call if validation passes
 * @param onError - Optional function to call if validation fails
 * @returns Form submission handler
 */
export const createFormSubmitHandler = (
  validationSchema: Record<string, Array<(value: any) => string | true>>,
  onSubmit: (values: Record<string, any>) => void,
  onError?: (errors: Record<string, string>) => void
) => {
  return (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    const values: Record<string, any> = {};
    
    formData.forEach((value, key) => {
      values[key] = value;
    });
    
    const errors = validateForm(values, validationSchema);
    
    if (Object.keys(errors).length === 0) {
      onSubmit(values);
    } else if (onError) {
      onError(errors);
    }
  };
};