import React, { useState, useEffect } from 'react';
import { validateField } from '../../utils/formValidationUtils';

interface FormTextAreaProps {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  validationRules?: Array<(value: any) => string | true>;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  rows?: number;
  helperText?: string;
  maxLength?: number;
  showCharacterCount?: boolean;
}

/**
 * Reusable form textarea component with built-in validation
 */
const FormTextArea: React.FC<FormTextAreaProps> = ({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  validationRules = [],
  error,
  required = false,
  disabled = false,
  className = '',
  rows = 4,
  helperText,
  maxLength,
  showCharacterCount = false
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
  
  // Handle textarea blur
  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
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
      <div className="flex justify-between items-center mb-1">
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {showCharacterCount && maxLength && (
          <span className={`text-xs ${value.length > maxLength ? 'text-red-500' : 'text-gray-500'}`}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      
      <div className={`relative rounded-md shadow-sm ${isInvalid ? 'border-red-300' : ''}`}>
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          aria-invalid={isInvalid}
          aria-describedby={isInvalid ? `${id}-error` : undefined}
          className={`block w-full rounded-md border ${
            isInvalid 
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
          } shadow-sm px-4 py-2 resize-y ${className}`}
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

export default FormTextArea;