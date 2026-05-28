import type { Project } from "@/entities/project/types";
import type { User } from "@/entities/user/types";

export type AdminDashboardStats = {
  users_count?: number;
  projects_count?: number;
  pending_projects_count?: number;
  payments_count?: number;
  complaints_count?: number;
  reports_count?: number;
  refunds_count?: number;
  [key: string]: unknown;
};

export type AdminProjectStatusUpdateRequest = {
  status: string;
  reason?: string;
};

export type AdminProjectsQueryParams = {
  status?: string;
};

export type AdminProject = Project;


export type AdminUser = User;

export type AdminUsersQueryParams = {
  search?: string;
  is_blocked?: boolean;
  is_active?: boolean;
};

export type AdminUserUpdateRequest = {
  full_name?: string | null;
  preferred_language?: string | null;
  is_active?: boolean;
  is_verified?: boolean;
};

export type AdminUserBlockRequest = {
  reason?: string;
};
