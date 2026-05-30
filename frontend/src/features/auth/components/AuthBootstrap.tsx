import type { ReactNode } from "react";

import { useMe } from "@/features/auth/hooks/useMe";

type AuthBootstrapProps = {
  children: ReactNode;
};

export function AuthBootstrap({ children }: AuthBootstrapProps) {
  useMe();

  return children;
}
