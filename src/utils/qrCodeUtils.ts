
/**
 * Utility functions for generating QR codes for video media
 */

export const generateQRCodeUrl = (url: string): string => {
  // Use Google Charts API to generate QR code
  const encodedUrl = encodeURIComponent(url);
  return `https://chart.googleapis.com/chart?cht=qr&chl=${encodedUrl}&chs=200x200&choe=UTF-8&chld=L|2`;
};
