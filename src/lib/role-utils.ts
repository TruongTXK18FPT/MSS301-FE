import { UserRole, RoleId, ROLE_ID_TO_STRING, ROLE_STRING_TO_ID } from '@/lib/dto/classroom';

/**
 * Convert role ID to role string
 */
export function getRoleString(roleId: RoleId | null): UserRole | null {
  if (!roleId) return null;
  return ROLE_ID_TO_STRING[roleId] || null;
}

/**
 * Convert role string to role ID
 */
export function getRoleId(role: UserRole | null): RoleId | null {
  if (!role) return null;
  return ROLE_STRING_TO_ID[role] || null;
}

/**
 * Get current role from either roleId or role string
 */
export function getCurrentRole(role: UserRole | null, roleId: RoleId | null): UserRole | null {
  return roleId ? ROLE_ID_TO_STRING[roleId] : role;
}

/**
 * Check if user has specific role
 */
export function hasRole(role: UserRole | null, roleId: RoleId | null, targetRole: UserRole): boolean {
  const currentRole = getCurrentRole(role, roleId);
  return currentRole === targetRole;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(role: UserRole | null, roleId: RoleId | null, targetRoles: UserRole[]): boolean {
  const currentRole = getCurrentRole(role, roleId);
  return currentRole ? targetRoles.includes(currentRole) : false;
}

/**
 * Check if user is admin
 */
export function isAdmin(role: UserRole | null, roleId: RoleId | null): boolean {
  return hasRole(role, roleId, 'ADMIN');
}

/**
 * Check if user is teacher
 */
export function isTeacher(role: UserRole | null, roleId: RoleId | null): boolean {
  return hasRole(role, roleId, 'TEACHER');
}

/**
 * Check if user is student
 */
export function isStudent(role: UserRole | null, roleId: RoleId | null): boolean {
  return hasRole(role, roleId, 'STUDENT');
}

/**
 * Check if user is guardian
 */
export function isGuardian(role: UserRole | null, roleId: RoleId | null): boolean {
  return hasRole(role, roleId, 'GUARDIAN');
}
