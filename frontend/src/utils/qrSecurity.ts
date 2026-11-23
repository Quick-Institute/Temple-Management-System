/**
 * Cryptographic QR Security Token System for Temple Devotee Onboarding.
 * Protects parish registration against URL tampering and unauthorized access.
 */

const QR_SECRET = 'temple_sasana_qr_sec_2026';

export function generateQrSecurityToken(templeCode: string): string {
  if (!templeCode) return '';
  const cleanCode = templeCode.trim().toUpperCase();
  let hash = 0;
  const input = `${cleanCode}:${QR_SECRET}`;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const sanitized = cleanCode.replace(/[^A-Z0-9]/g, '');
  return `SEC-${sanitized}-${hex}`;
}

export function verifyQrSecurityToken(templeCode: string, token: string): boolean {
  if (!templeCode || !token) return false;
  const expected = generateQrSecurityToken(templeCode);
  return token.trim().toUpperCase() === expected.toUpperCase();
}

export function buildSecureQrUrl(templeCode: string, origin?: string): string {
  const base = origin || (typeof window !== 'undefined' ? window.location.origin : '');
  const token = generateQrSecurityToken(templeCode);
  return `${base}/families/add?templeCode=${encodeURIComponent(templeCode)}&token=${encodeURIComponent(token)}&mode=qr_onboarding`;
}
