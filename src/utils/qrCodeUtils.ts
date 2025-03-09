
/**
 * Utility functions for generating QR codes for video media
 */

export const generateQRCodeUrl = (url: string): string => {
  // Make sure the URL is properly encoded
  const encodedUrl = encodeURIComponent(url);
  
  // Use Google Charts API to generate QR code with larger size for better visibility
  return `https://chart.googleapis.com/chart?cht=qr&chl=${encodedUrl}&chs=250x250&choe=UTF-8&chld=L|2`;
};

// Helper function to safely encode URLs for QR codes
export const safeEncodeUrl = (url: string): string => {
  try {
    // Handle cases where the URL might already be encoded or contain special characters
    const decodedUrl = decodeURIComponent(url);
    return encodeURIComponent(decodedUrl);
  } catch (e) {
    // If there's an error, just use the original url but ensure it's encoded
    return encodeURIComponent(url);
  }
};
