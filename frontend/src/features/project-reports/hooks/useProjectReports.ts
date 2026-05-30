import { useQuery } from "@tanstack/react-query";

import type { ProjectReport } from "@/entities/project-report/types";

import { getProjectReports } from "@/features/project-reports/api/projectReportsApi";

export function useProjectReports(projectId: number | string | undefined) {
  return useQuery<ProjectReport[]>({
    queryKey: ["project-reports", projectId],
    queryFn: () => getProjectReports(projectId!),
    enabled: Boolean(projectId),
  });
}
