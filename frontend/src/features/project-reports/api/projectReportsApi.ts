import type { ProjectReport } from "@/entities/project-report/types";
import { apiClient, endpoints } from "@/shared/api";
import { normalizeApiList } from "@/shared/lib/apiList";

export async function getProjectReports(projectId: number | string) {
  const payload = await apiClient.get<ProjectReport[] | { items: ProjectReport[] }>(
    endpoints.projects.reports(projectId),
    {
      auth: false,
    },
  );

  return normalizeApiList<ProjectReport>(payload);
}
