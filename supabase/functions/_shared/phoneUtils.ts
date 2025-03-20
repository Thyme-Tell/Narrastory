
/**
 * Normalizes a phone number to a standard format for comparison
 * @param phoneNumber The phone number to normalize
 * @returns Normalized phone number
 */
export const normalizePhoneNumber = (phoneNumber: string): string => {
  // If phone number is null or undefined, return empty string
  if (!phoneNumber) {
    return '';
  }
  
  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // If the number starts with '1' and has 11 digits, format with +1
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return `+1${digitsOnly.slice(1)}`;
  }
  
  // If the number has 10 digits, add +1
  if (digitsOnly.length === 10) {
    return `+1${digitsOnly}`;
  }
  
  // If it already has a plus sign, return it as is
  if (phoneNumber.startsWith('+')) {
    return phoneNumber;
  }
  
  // Return the original format if it's already correct or we can't normalize it
  return phoneNumber;
};
