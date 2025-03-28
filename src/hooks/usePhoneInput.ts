
import { useState, useCallback } from "react";
import { normalizePhoneNumber } from "@/utils/phoneUtils";

export function usePhoneInput(initialValue: string = "") {
  const [value, setValue] = useState(initialValue);
  const [isValid, setIsValid] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Format phone number as user types
  const formatPhoneNumber = (input: string): string => {
    // Remove all non-numeric characters
    const cleaned = input.replace(/\D/g, '');
    
    if (cleaned.length === 0) return '';
    
    // Format: (XXX) XXX-XXXX
    if (cleaned.length <= 3) {
      return `(${cleaned}`;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };
  
  // Handle input change
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = formatPhoneNumber(event.target.value);
    setValue(newValue);
    
    // Basic validation
    const digits = newValue.replace(/\D/g, '');
    const isValidInput = digits.length === 10;
    setIsValid(isValidInput);
    
    if (isTouched) {
      if (digits.length === 0) {
        setError("Phone number is required");
      } else if (!isValidInput) {
        setError("Please enter a valid 10-digit phone number");
      } else {
        setError(null);
      }
    }
  }, [isTouched]);
  
  // Handle blur
  const handleBlur = useCallback(() => {
    setIsTouched(true);
    
    // Validate on blur
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) {
      setError("Phone number is required");
    } else if (digits.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
    } else {
      setError(null);
    }
  }, [value]);
  
  // Get normalized phone number for API calls
  const getNormalizedValue = useCallback(() => {
    return normalizePhoneNumber(value);
  }, [value]);
  
  return {
    value,
    isValid,
    isTouched,
    isSubmitting,
    error,
    handleChange,
    handleBlur,
    getNormalizedValue,
    setIsSubmitting,
    setError
  };
}
