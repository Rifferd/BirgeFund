import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth/model/authStore";
import { getMyProjects } from "@/features/projects/api/projectsApi";

export function useMyProjects() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["projects", "my"],
    queryFn: getMyProjects,
    enabled: isAuthenticated,
  });
}
