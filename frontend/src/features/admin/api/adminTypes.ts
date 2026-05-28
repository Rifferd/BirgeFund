import type { Project } from "@/entities/project/types";

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
