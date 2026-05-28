import type { AdminDashboardStats, AdminProject, AdminProjectsQueryParams, AdminProjectStatusUpdateRequest } from "@/features/admin/api/adminTypes";
import { apiClient, endpoints } from "@/shared/api";
import { normalizeApiList } from "@/shared/lib/apiList";

export function getAdminDashboard() {
  return apiClient.get<AdminDashboardStats>(endpoints.admin.dashboard);
}

export async function getAdminProjects(params?: AdminProjectsQueryParams) {
  const payload = await apiClient.get<AdminProject[] | { items: AdminProject[] }>(
    endpoints.admin.projects,
    {
      params,
    },
  );

  return normalizeApiList(payload);
}

export function updateAdminProjectStatus(
  projectId: number | string,
  payload: AdminProjectStatusUpdateRequest,
) {
  return apiClient.patch<AdminProject, AdminProjectStatusUpdateRequest>(
    endpoints.admin.projectStatus(projectId),
    payload,
  );
}
