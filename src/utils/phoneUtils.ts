
export const normalizePhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // If the number starts with '1' and has 11 digits, remove the '1'
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return `+1${digitsOnly.slice(1)}`;
  }
  
  // If the number has 10 digits, add +1
  if (digitsOnly.length === 10) {
    return `+1${digitsOnly}`;
  }
  
  // Return the original format if it's already correct
  if (digitsOnly.length === 10 || (digitsOnly.length === 11 && digitsOnly.startsWith('1'))) {
    return `+${digitsOnly}`;
  }
  
  // Return the original input if we can't normalize it
  return phoneNumber;
};
