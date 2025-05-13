import React, { useState, useEffect } from 'react';
import { validateField } from '../../utils/formValidationUtils';

interface FormSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface FormSelectProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  options: FormSelectOption[];
  validationRules?: Array<(value: any) => string | true>;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  helperText?: string;
  placeholder?: string;
  icon?: React.ReactNode;
}

/**
 * Reusable form select component with built-in validation
 */
const FormSelect: React.FC<FormSelectProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  options,
  validationRules = [],
  error,
  required = false,
  disabled = false,
  className = '',
  helperText,
  placeholder,
  icon
}) => {
  const [localError, setLocalError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  
  // Validate value when it changes
  useEffect(() => {
    if (touched && validationRules.length > 0) {
      const validationResult = validateField(value, validationRules);
      setLocalError(validationResult === true ? null : validationResult);
    }
  }, [value, validationRules, touched]);
  
  // Handle select blur
  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
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
        
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={handleBlur}
          disabled={disabled}
          aria-invalid={isInvalid}
          aria-describedby={isInvalid ? `${id}-error` : undefined}
          className={`block w-full rounded-md border ${
            isInvalid 
              ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
          } ${icon ? 'pl-10' : ''} shadow-sm px-4 py-2 ${className}`}
          required={required}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
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

export default FormSelect;