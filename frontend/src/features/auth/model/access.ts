import type { CurrentUser } from "@/features/auth/api/authTypes";

export function getUserRoleNames(user: CurrentUser | null) {
  if (!user) {
    return [];
  }

  const rolesFromObjects = user.roles?.map((role) => role.name) ?? [];
  const rolesFromNames = user.role_names ?? [];

  return Array.from(new Set([...rolesFromObjects, ...rolesFromNames]));
}

export function userHasAnyRole(user: CurrentUser | null, allowedRoles: string[]) {
  const roleNames = getUserRoleNames(user);

  return allowedRoles.some((role) => roleNames.includes(role));
}

export function userHasAnyPermission(user: CurrentUser | null, allowedPermissions: string[]) {
  const permissions = user?.permissions ?? [];

  return allowedPermissions.some((permission) => permissions.includes(permission));
}

export function canAccessAdmin(user: CurrentUser | null) {
  if (!user) {
    return false;
  }

  if (user.is_blocked || user.is_active === false) {
    return false;
  }

  return (
    userHasAnyRole(user, ["admin", "moderator", "finance", "content"]) ||
    userHasAnyPermission(user, [
      "admin.read",
      "users.read",
      "projects.moderate",
      "payments.read",
      "reports.moderate",
      "complaints.manage",
      "cms.update",
      "translations.update",
    ])
  );
}
