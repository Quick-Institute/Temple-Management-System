/**
 * Sri Lankan Phone & NIC Formatter and Validator
 */

/**
 * Auto-format Sri Lankan phone number into standard 07X-XXXXXXX (mobile) or 0XX-XXXXXXX (landline)
 */
export function formatSriLankanPhone(raw: string): string {
  if (!raw) return '';
  // Strip any non-digit characters
  let digits = raw.replace(/[^0-9]/g, '');

  // If user types +94 or 94, convert to 0
  if (digits.startsWith('94')) {
    digits = '0' + digits.slice(2);
  }

  // Cap at 10 digits
  if (digits.length > 10) {
    digits = digits.slice(0, 10);
  }

  // Format with dash after 3 digits (e.g. 071-2345678)
  if (digits.length <= 3) {
    return digits;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3)}`;
}

/**
 * Check if the given phone string matches a valid Sri Lankan phone number (10 digits starting with 0)
 */
export function isValidSriLankanPhone(phone: string): boolean {
  if (!phone) return false;
  const digits = phone.replace(/[^0-9]/g, '');
  return digits.length === 10 && /^0(7[0-8]|11|2[1-7]|3[1-8]|4[1-7]|5[1-7]|6[3-7]|81|91)/.test(digits);
}

/**
 * Auto-format and clean Sri Lankan NIC (uppercase V or X, trim whitespace, restrict characters)
 */
export function formatSriLankanNic(raw: string): string {
  if (!raw) return '';
  let cleaned = raw.trim().toUpperCase().replace(/[^0-9VX]/g, '');
  // Max 12 characters
  if (cleaned.length > 12) {
    cleaned = cleaned.slice(0, 12);
  }
  return cleaned;
}

export interface NicValidationResult {
  isValid: boolean;
  type?: 'Old NIC (9-digit + V/X)' | 'New NIC (12-digit)';
  message?: string;
}

/**
 * Validate Sri Lankan National Identity Card (NIC)
 * Supports:
 * 1. Old Format: 9 digits followed by 'V' or 'X' (e.g., 852341234V)
 * 2. New Format: 12 digits (e.g., 198523401234)
 */
export function getNicValidation(nic: string): NicValidationResult {
  const cleaned = (nic || '').trim().toUpperCase();
  if (!cleaned) {
    return { isValid: false };
  }

  // Old NIC: 9 digits followed by V or X
  if (/^[0-9]{9}[VX]$/.test(cleaned)) {
    return {
      isValid: true,
      type: 'Old NIC (9-digit + V/X)',
    };
  }

  // New NIC: 12 digits
  if (/^[0-9]{12}$/.test(cleaned)) {
    return {
      isValid: true,
      type: 'New NIC (12-digit)',
    };
  }

  return {
    isValid: false,
    message: 'Expected 9 digits + V/X (e.g. 721450210V) or 12 digits (e.g. 197214500210)',
  };
}

