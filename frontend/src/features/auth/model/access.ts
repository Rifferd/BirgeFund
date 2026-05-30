import type { CurrentUser } from "@/features/auth/api/authTypes";

function normalizeStringList(value: unknown): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;

          if (typeof record.name === "string") return record.name;
          if (typeof record.code === "string") return record.code;
          if (typeof record.slug === "string") return record.slug;
        }

        return null;
      })
      .filter((item): item is string => Boolean(item));
  }

  if (typeof value === "string") {
    return [value];
  }

  return [];
}

export function getUserRoleNames(user: CurrentUser | null) {
  if (!user) {
    return [];
  }

  const record = user as unknown as Record<string, unknown>;

  return Array.from(
    new Set([
      ...normalizeStringList(user.roles),
      ...normalizeStringList(user.role_names),
      ...normalizeStringList(record.role),
      ...normalizeStringList(record.role_name),
    ]),
  );
}

export function getUserPermissions(user: CurrentUser | null) {
  if (!user) {
    return [];
  }

  return normalizeStringList((user as unknown as Record<string, unknown>).permissions);
}

export function userHasAnyRole(user: CurrentUser | null, allowedRoles: string[]) {
  const roleNames = getUserRoleNames(user);

  return allowedRoles.some((role) => roleNames.includes(role));
}

export function userHasAnyPermission(user: CurrentUser | null, allowedPermissions: string[]) {
  const permissions = getUserPermissions(user);

  return allowedPermissions.some((permission) => permissions.includes(permission));
}

export function canAccessAdmin(user: CurrentUser | null) {
  if (!user) {
    return false;
  }

  const record = user as unknown as Record<string, unknown>;

  if (user.is_blocked || user.is_active === false) {
    return false;
  }

  if (record.is_admin === true || record.is_superuser === true || record.is_staff === true) {
    return true;
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
