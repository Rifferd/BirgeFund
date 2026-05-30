import { useQuery } from "@tanstack/react-query";

import type { Project } from "@/entities/project/types";

import { useAuthStore } from "@/features/auth/model/authStore";
import { getMyProjects } from "@/features/projects/api/projectsApi";

export function useMyProjects() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<Project[]>({
    queryKey: ["projects", "my"],
    queryFn: getMyProjects,
    enabled: isAuthenticated,
  });
}
