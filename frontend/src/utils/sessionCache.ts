/**
 * In-memory session cache for registered families and users.
 * Keeps data accessible across page transitions without storing unencrypted
 * sensitive personal records (phone numbers, certificates) into browser localStorage,
 * completely satisfying CodeQL CWE-312 (Cleartext storage of sensitive information).
 */

const memoryFamilies: Record<string, unknown>[] = [];
const memoryUsers: Record<string, unknown>[] = [];

export function getSessionFamilies(): Record<string, unknown>[] {
  return memoryFamilies;
}

export function saveSessionFamily(family: Record<string, unknown>): void {
  const idx = memoryFamilies.findIndex((f) => String(f.id) === String(family.id));
  if (idx >= 0) {
    memoryFamilies[idx] = family;
  } else {
    memoryFamilies.unshift(family);
  }
}

export function updateSessionFamilies(families: Record<string, unknown>[]): void {
  memoryFamilies.length = 0;
  memoryFamilies.push(...families);
}

export function getSessionUsers(): Record<string, unknown>[] {
  return memoryUsers;
}

export function saveSessionUser(user: Record<string, unknown>): void {
  const idx = memoryUsers.findIndex((u) => String(u.id) === String(user.id));
  if (idx >= 0) {
    memoryUsers[idx] = user;
  } else {
    memoryUsers.unshift(user);
  }
}

export function updateSessionUsers(users: Record<string, unknown>[]): void {
  memoryUsers.length = 0;
  memoryUsers.push(...users);
}
