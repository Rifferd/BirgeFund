import type { AdminDashboardStats, AdminProject, AdminProjectsQueryParams, AdminProjectStatusUpdateRequest, AdminUser, AdminUsersQueryParams, AdminUserBlockRequest, AdminUserUpdateRequest } from "@/features/admin/api/adminTypes";
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


export async function getAdminUsers(params?: AdminUsersQueryParams) {
  const payload = await apiClient.get<AdminUser[] | { items: AdminUser[] }>(
    endpoints.admin.users,
    {
      params,
    },
  );

  return normalizeApiList(payload);
}

export function updateAdminUser(
  userId: number | string,
  payload: AdminUserUpdateRequest,
) {
  return apiClient.patch<AdminUser, AdminUserUpdateRequest>(
    endpoints.admin.user(userId),
    payload,
  );
}

export function blockAdminUser(
  userId: number | string,
  payload: AdminUserBlockRequest,
) {
  return apiClient.patch<AdminUser, AdminUserBlockRequest>(
    endpoints.admin.userBlock(userId),
    payload,
  );
}

export function unblockAdminUser(
  userId: number | string,
  payload: AdminUserBlockRequest = {},
) {
  return apiClient.patch<AdminUser, AdminUserBlockRequest>(
    endpoints.admin.userUnblock(userId),
    payload,
  );
}
