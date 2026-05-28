import type { Project } from "@/entities/project/types";
import { apiClient, endpoints } from "@/shared/api";
import { normalizeApiList } from "@/shared/lib/apiList";

export type ProjectsQueryParams = {
  category?: string;
  status?: string;
  project_type?: string;
  city?: string;
  search?: string;
  page?: number;
  page_size?: number;
};

export async function getProjects(params?: ProjectsQueryParams) {
  const payload = await apiClient.get<Project[] | { items: Project[] }>(
    endpoints.projects.list,
    {
      auth: false,
      params,
    },
  );

  return normalizeApiList(payload);
}

export function getProjectBySlug(slug: string) {
  return apiClient.get<Project>(endpoints.projects.detail(slug), {
    auth: false,
  });
}
