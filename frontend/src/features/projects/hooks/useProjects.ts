import { useQuery } from "@tanstack/react-query";

import { getProjects, type ProjectsQueryParams } from "@/features/projects/api/projectsApi";

export function useProjects(params?: ProjectsQueryParams) {
  return useQuery({
    queryKey: ["projects", params],
    queryFn: () => getProjects(params),
  });
}
