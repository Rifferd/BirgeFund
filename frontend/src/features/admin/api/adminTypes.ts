import type { LedgerEntry } from "@/entities/ledger/types";
import type { PaymentAttempt } from "@/features/payments/api/paymentTypes";
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

export type AdminPayment = PaymentAttempt;

export type AdminPaymentsQueryParams = {
  status?: string;
  project_id?: number | string;
  user_id?: number | string;
};

export type AdminRefundCreateRequest = {
  reason: string;
};

export type AdminRefund = {
  id: number;
  payment_attempt_id: number;
  project_id?: number | null;
  user_id?: number | null;
  amount?: string | number;
  currency?: string;
  reason?: string | null;
  status?: string;
  created_at?: string;
  processed_at?: string | null;
};

export type AdminLedgerEntry = LedgerEntry;

export type AdminLedgerSummary = {
  project_id?: number;
  gross_collected?: string | number;
  platform_fee_amount?: string | number;
  net_amount?: string | number;
  refunded_amount?: string | number;
  available_amount?: string | number;
  currency?: string;
  [key: string]: unknown;
};
