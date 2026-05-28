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

export type AdminReport = {
  id: number;
  project_id: number;
  author_id?: number | null;
  title?: string | null;
  text?: string | null;
  language?: string | null;
  status: string;
  moderator_comment?: string | null;
  created_at?: string;
  updated_at?: string | null;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  [key: string]: unknown;
};

export type AdminReportsQueryParams = {
  status?: string;
  project_id?: number | string;
};

export type AdminReportStatusUpdateRequest = {
  status: string;
  reason?: string;
};

export type AdminComplaint = {
  id: number;
  reporter_id?: number | null;
  project_id?: number | null;
  comment_id?: number | null;
  target_type?: string | null;
  target_id?: number | null;
  reason?: string | null;
  description?: string | null;
  status: string;
  moderator_comment?: string | null;
  created_at?: string;
  updated_at?: string | null;
  reviewed_at?: string | null;
  [key: string]: unknown;
};

export type AdminComplaintsQueryParams = {
  status?: string;
  project_id?: number | string;
};

export type AdminComplaintStatusUpdateRequest = {
  status: string;
  reason?: string;
};


export type AdminCMSPageTranslation = {
  id?: number;
  page_id?: number;
  language: "ru" | "kg" | "en" | string;
  title: string;
  content: string;
  meta_title?: string | null;
  meta_description?: string | null;
  created_at?: string;
  updated_at?: string | null;
};

export type AdminCMSPage = {
  id: number;
  slug: string;
  status?: string;
  is_published?: boolean;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string | null;
  translations: AdminCMSPageTranslation[];
};

export type AdminCMSPageCreateRequest = {
  slug: string;
  translations: Array<{
    language: "ru" | "kg" | "en";
    title: string;
    content: string;
    meta_title?: string | null;
    meta_description?: string | null;
  }>;
};

export type AdminCMSPageUpdateRequest = Partial<AdminCMSPageCreateRequest> & {
  status?: string;
  is_published?: boolean;
};


export type AdminBannerTranslation = {
  id?: number;
  banner_id?: number;
  language: "ru" | "kg" | "en" | string;
  title: string;
  subtitle?: string | null;
  cta_text?: string | null;
  created_at?: string;
  updated_at?: string | null;
};

export type AdminBanner = {
  id: number;
  slug: string;
  placement: string;
  image_file_id?: number | null;
  link_url?: string | null;
  sort_order: number;
  is_active: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  created_at?: string;
  updated_at?: string | null;
  translations: AdminBannerTranslation[];
};

export type AdminBannerCreateRequest = {
  slug: string;
  placement: string;
  image_file_id?: number | null;
  link_url?: string | null;
  sort_order: number;
  is_active: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  translations: Array<{
    language: "ru" | "kg" | "en";
    title: string;
    subtitle?: string | null;
    cta_text?: string | null;
  }>;
};

export type AdminBannerUpdateRequest = Partial<AdminBannerCreateRequest>;
