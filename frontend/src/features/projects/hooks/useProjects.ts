import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "../api/projectsApi";
import type { ProjectListParams } from "../../../entities/project/types";

export function useProjects(params: ProjectListParams = {}) {
  return useQuery({
    queryKey: ["projects", params],
    queryFn: () => projectsApi.getProjects(params),
  });
}
