import { useQuery } from "@tanstack/react-query";

import { getProjectReports } from "@/features/project-reports/api/projectReportsApi";

export function useProjectReports(projectId: number | string | undefined) {
  return useQuery({
    queryKey: ["project-reports", projectId],
    queryFn: () => getProjectReports(projectId!),
    enabled: Boolean(projectId),
  });
}
