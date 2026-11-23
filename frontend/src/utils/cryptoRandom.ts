/**
 * Cryptographically secure random utilities using Web Crypto API
 */

export function secureRandomInt(min: number, max: number): number {
  const range = max - min;
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return min + (array[0] % range);
}

export function secureRandomString(chars: string, length: number): string {
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}
