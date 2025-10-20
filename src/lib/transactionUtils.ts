/**
 * Transaction utility functions for generating unique transaction IDs and codes
 */

export interface TransactionIdResult {
  formatId: string;
  uniqueId: string;
}

/**
 * Generate unique transaction IDs and codes for different currencies
 * @param currency - The currency code (e.g., 'USD', 'GHS', 'NGN')
 * @param phoneNumber - The phone number for generating the ID
 * @returns Object containing formatId and uniqueId
 */
export function generateTransactionIds(currency: string, phoneNumber: string): TransactionIdResult {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');

  // Extract last 3 digits from phone number
  const lastThreeDigits = phoneNumber.replace(/\D/g, '').slice(-3).padStart(3, '0');

  // Get transaction count (this would normally come from your database)
  // For now, use a random number as placeholder
  const transactionCount = String(Math.floor(Math.random() * 99999) + 1).padStart(5, '0');

  const timestamp = `${day}${month}${hour}${minute}${second}`;

  const formatId = `${currency}-${lastThreeDigits}-${timestamp}-${transactionCount}`;

  // Generate unique code (8-character alphanumeric)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let uniqueId = 'RJB';
  for (let i = 0; i < 8; i++) {
    uniqueId += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return {
    formatId,
    uniqueId
  };
}

/**
 * Validate a transaction ID format
 * @param transactionId - The transaction ID to validate
 * @returns boolean indicating if the ID is valid
 */
export function validateTransactionId(transactionId: string): boolean {
  // Expected format: CURRENCY-XXX-DDMMHHMMSS-XXXXX
  const pattern = /^[A-Z]{3}-\d{3}-\d{10}-\d{5}$/;
  return pattern.test(transactionId);
}

/**
 * Extract currency from transaction ID
 * @param transactionId - The transaction ID
 * @returns The currency code or null if invalid
 */
export function extractCurrencyFromId(transactionId: string): string | null {
  if (!validateTransactionId(transactionId)) {
    return null;
  }
  return transactionId.split('-')[0];
}

/**
 * Generate a receipt number for printing
 * @param transactionId - The transaction ID
 * @returns Formatted receipt number
 */
export function generateReceiptNumber(transactionId: string): string {
  // Extract timestamp part and format as receipt number
  const parts = transactionId.split('-');
  if (parts.length >= 4) {
    const timestamp = parts[2];
    const sequence = parts[3];
    return `RCP-${timestamp}-${sequence}`;
  }
  return `RCP-${Date.now()}`;
}