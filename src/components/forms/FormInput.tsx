import React, { useState, useEffect } from 'react';
import { validateField } from '../../utils/formValidationUtils';

interface FormInputProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  validationRules?: Array<(value: any) => string | true>;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  autoComplete?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

/**
 * Reusable form input component with built-in validation
 */
const FormInput: React.FC<FormInputProps> = ({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  validationRules = [],
  error,
  required = false,
  disabled = false,
  className = '',
  autoComplete,
  helperText,
  icon
}) => {
  const [localError, setLocalError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  
  // Clear local error when value changes
  useEffect(() => {
    if (touched && validationRules.length > 0) {
      const validationResult = validateField(value, validationRules);
      setLocalError(validationResult === true ? null : validationResult);
    }
  }, [value, validationRules, touched]);
  
  // Handle input blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    if (validationRules.length > 0) {
      const validationResult = validateField(value, validationRules);
      setLocalError(validationResult === true ? null : validationResult);
    }
    if (onBlur) {
      onBlur(e);
    }
  };
  
  // Determine if there's an error to display
  const displayError = error || localError;
  const isInvalid = !!displayError;
  
  return (
    <div className="mb-4">
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className={`relative rounded-md shadow-sm ${isInvalid ? 'border-red-300' : ''}`}>
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={isInvalid}
          aria-describedby={isInvalid ? `${id}-error` : undefined}
          className={`block w-full rounded-md border ${
            isInvalid 
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
          } ${icon ? 'pl-10' : ''} shadow-sm px-4 py-2 ${className}`}
          required={required}
        />
      </div>
      
      {displayError && (
        <p 
          className="mt-2 text-sm text-red-600"
          id={`${id}-error`}
        >
          {displayError}
        </p>
      )}
      
      {helperText && !displayError && (
        <p className="mt-2 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default FormInput;