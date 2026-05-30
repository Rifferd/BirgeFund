import { useQuery } from "@tanstack/react-query";

import type { Project } from "@/entities/project/types";

import { getProjects, type ProjectsQueryParams } from "@/features/projects/api/projectsApi";

export function useProjects(params?: ProjectsQueryParams) {
  return useQuery<Project[]>({
    queryKey: ["projects", params],
    queryFn: () => getProjects(params),
  });
}
