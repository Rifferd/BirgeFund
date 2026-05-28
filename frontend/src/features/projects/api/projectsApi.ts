import { apiClient } from "../../../shared/api/client";
import type { ApiListResponse } from "../../../shared/types/api";
import type { Project, ProjectListParams } from "../../../entities/project/types";

export const projectsApi = {
  getProjects(params: ProjectListParams = {}) {
    return apiClient.get<ApiListResponse<Project>>("/projects", params);
  },

  getProject(slug: string) {
    return apiClient.get<Project>(`/projects/${slug}`);
  },
};
