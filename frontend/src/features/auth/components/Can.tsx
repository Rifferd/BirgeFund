import type { ReactNode } from "react";

import { useAuthStore } from "@/features/auth/model/authStore";

type UserWithPermissions = {
  permissions?: string[];
};

type CanProps = {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
};

export function Can({ permission, children, fallback = null }: CanProps) {
  const user = useAuthStore((state) => state.user) as UserWithPermissions | null;
  const permissions = user?.permissions ?? [];

  if (!permissions.includes(permission)) {
    return fallback;
  }

  return children;
}
