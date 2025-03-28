
import * as React from "react";
import { Input } from "@/components/ui/input";
import { normalizePhoneNumber } from "@/utils/phoneUtils";

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function PhoneInput({
  value,
  onChange,
  className,
  error,
  ...props
}: PhoneInputProps) {
  // Format phone number as user types
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Allow only numbers
    const digitsOnly = input.replace(/\D/g, '');
    
    let formattedValue = digitsOnly;
    
    // Format based on length
    if (digitsOnly.length > 0) {
      if (digitsOnly.length <= 3) {
        formattedValue = `(${digitsOnly}`;
      } else if (digitsOnly.length <= 6) {
        formattedValue = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
      } else {
        formattedValue = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
      }
    }
    
    onChange(formattedValue);
  };

  return (
    <div className="relative">
      <Input
        type="tel"
        value={value}
        onChange={handleChange}
        className={className}
        placeholder="(555) 123-4567"
        {...props}
      />
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}
