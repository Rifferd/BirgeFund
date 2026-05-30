import type { Project } from "@/entities/project/types";
import { apiClient, endpoints } from "@/shared/api";
import { normalizeApiList } from "@/shared/lib/apiList";

export type ProjectTranslationCreate = {
  language: "ru" | "kg" | "en";
  title: string;
  short_description: string;
  description: string;
  risks?: string | null;
  refund_policy?: string | null;
  reward_description?: string | null;
  report_text?: string | null;
};

export type ProjectCreateRequest = {
  slug: string;
  project_type: string;
  funding_type: string;
  city: string;
  goal_amount: number;
  currency: string;
  deadline: string;
  category_ids: number[];
  translations: ProjectTranslationCreate[];
};

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


export async function getMyProjects() {
  const payload = await apiClient.get<Project[] | { items: Project[] }>(
    endpoints.projects.my,
  );

  return normalizeApiList(payload);
}

export function submitProjectToReview(projectId: number | string) {
  return apiClient.post<Project>(endpoints.projects.submitReview(projectId));
}


export function createProject(payload: ProjectCreateRequest) {
  return apiClient.post<Project, ProjectCreateRequest>(
    endpoints.projects.create,
    payload,
  );
}


export type ProjectUpdateCreateRequest = {
  language: "ru" | "kg" | "en";
  title: string;
  text: string;
  is_public: boolean;
};

export type ProjectReportCreateRequest = {
  language: "ru" | "kg" | "en";
  title: string;
  text: string;
  is_public?: boolean;
};

export type ProjectRewardCreateRequest = {
  title: string;
  description: string;
  amount: number;
  currency: string;
  quantity_total?: number | null;
  is_active: boolean;
  sort_order: number;
};

export function createProjectUpdate(
  projectId: number | string,
  payload: ProjectUpdateCreateRequest,
) {
  return apiClient.post(endpoints.projects.updates(projectId), payload);
}

export function createProjectReport(
  projectId: number | string,
  payload: ProjectReportCreateRequest,
) {
  return apiClient.post(endpoints.projects.reports(projectId), payload);
}

export function createProjectReward(
  projectId: number | string,
  payload: ProjectRewardCreateRequest,
) {
  return apiClient.post(endpoints.projects.rewards(projectId), payload);
}
