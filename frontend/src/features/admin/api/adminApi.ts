import type {
  AdminBanner,
  AdminBannerCreateRequest,
  AdminBannerUpdateRequest,
  AdminCMSPage,
  AdminCMSPageCreateRequest,
  AdminCMSPageUpdateRequest,
  AdminComplaint,
  AdminComplaintsQueryParams,
  AdminComplaintStatusUpdateRequest,
  AdminDashboardStats,
  AdminLedgerEntry,
  AdminLedgerSummary,
  AdminPayment,
  AdminPaymentsQueryParams,
  AdminProject,
  AdminProjectsQueryParams,
  AdminProjectStatusUpdateRequest,
  AdminRefund,
  AdminRefundCreateRequest,
  AdminReport,
  AdminReportsQueryParams,
  AdminReportStatusUpdateRequest,
  AdminStaticTranslation,
  AdminStaticTranslationCreateRequest,
  AdminStaticTranslationUpdateRequest,
  AdminTranslationsQueryParams,
  AdminUser,
  AdminUserBlockRequest,
  AdminUsersQueryParams,
  AdminUserUpdateRequest,
} from "@/features/admin/api/adminTypes";
import { apiClient, endpoints } from "@/shared/api";
import { normalizeApiList } from "@/shared/lib/apiList";

export function getAdminDashboard() {
  return apiClient.get<AdminDashboardStats>(endpoints.admin.dashboard);
}

export async function getAdminProjects(params?: AdminProjectsQueryParams) {
  const payload = await apiClient.get<AdminProject[] | { items: AdminProject[] }>(
    endpoints.admin.projects,
    { params },
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
    { params },
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

export async function getAdminPayments(params?: AdminPaymentsQueryParams) {
  const payload = await apiClient.get<AdminPayment[] | { items: AdminPayment[] }>(
    endpoints.admin.payments,
    { params },
  );

  return normalizeApiList(payload);
}

export function createAdminRefund(
  paymentId: number | string,
  payload: AdminRefundCreateRequest,
) {
  return apiClient.post<AdminRefund, AdminRefundCreateRequest>(
    endpoints.admin.paymentRefund(paymentId),
    payload,
  );
}

export async function getAdminProjectLedger(projectId: number | string) {
  const payload = await apiClient.get<AdminLedgerEntry[] | { items: AdminLedgerEntry[] }>(
    endpoints.admin.projectLedger(projectId),
  );

  return normalizeApiList(payload);
}

export function getAdminProjectLedgerSummary(projectId: number | string) {
  return apiClient.get<AdminLedgerSummary>(
    endpoints.admin.projectLedgerSummary(projectId),
  );
}

export async function getAdminRefunds() {
  const payload = await apiClient.get<AdminRefund[] | { items: AdminRefund[] }>(
    endpoints.admin.refunds,
  );

  return normalizeApiList(payload);
}

export async function getAdminReports(params?: AdminReportsQueryParams) {
  const payload = await apiClient.get<AdminReport[] | { items: AdminReport[] }>(
    endpoints.admin.reports,
    { params },
  );

  return normalizeApiList(payload);
}

export function updateAdminReportStatus(
  reportId: number | string,
  payload: AdminReportStatusUpdateRequest,
) {
  return apiClient.patch<AdminReport, AdminReportStatusUpdateRequest>(
    endpoints.admin.reportStatus(reportId),
    payload,
  );
}

export async function getAdminComplaints(params?: AdminComplaintsQueryParams) {
  const payload = await apiClient.get<AdminComplaint[] | { items: AdminComplaint[] }>(
    endpoints.admin.complaints,
    { params },
  );

  return normalizeApiList(payload);
}

export function updateAdminComplaintStatus(
  complaintId: number | string,
  payload: AdminComplaintStatusUpdateRequest,
) {
  return apiClient.patch<AdminComplaint, AdminComplaintStatusUpdateRequest>(
    endpoints.admin.complaintStatus(complaintId),
    payload,
  );
}

export async function getAdminCMSPages() {
  const payload = await apiClient.get<AdminCMSPage[] | { items: AdminCMSPage[] }>(
    endpoints.admin.cmsPages,
  );

  return normalizeApiList(payload);
}

export function createAdminCMSPage(payload: AdminCMSPageCreateRequest) {
  return apiClient.post<AdminCMSPage, AdminCMSPageCreateRequest>(
    endpoints.admin.cmsPages,
    payload,
  );
}

export function updateAdminCMSPage(
  pageId: number | string,
  payload: AdminCMSPageUpdateRequest,
) {
  return apiClient.patch<AdminCMSPage, AdminCMSPageUpdateRequest>(
    endpoints.admin.cmsPage(pageId),
    payload,
  );
}

export async function getAdminBanners() {
  const payload = await apiClient.get<AdminBanner[] | { items: AdminBanner[] }>(
    endpoints.admin.banners,
  );

  return normalizeApiList(payload);
}

export function createAdminBanner(payload: AdminBannerCreateRequest) {
  return apiClient.post<AdminBanner, AdminBannerCreateRequest>(
    endpoints.admin.banners,
    payload,
  );
}

export function updateAdminBanner(
  bannerId: number | string,
  payload: AdminBannerUpdateRequest,
) {
  return apiClient.patch<AdminBanner, AdminBannerUpdateRequest>(
    endpoints.admin.banner(bannerId),
    payload,
  );
}

export async function getAdminTranslations(params?: AdminTranslationsQueryParams) {
  const payload = await apiClient.get<
    AdminStaticTranslation[] | { items: AdminStaticTranslation[] }
  >(endpoints.admin.translations, { params });

  return normalizeApiList(payload);
}

export function seedAdminTranslations() {
  return apiClient.post<{ message: string }>(
    endpoints.admin.translationsSeed,
  );
}

export function createAdminTranslation(payload: AdminStaticTranslationCreateRequest) {
  return apiClient.post<
    AdminStaticTranslation,
    AdminStaticTranslationCreateRequest
  >(endpoints.admin.translations, payload);
}

export function updateAdminTranslation(
  translationId: number | string,
  payload: AdminStaticTranslationUpdateRequest,
) {
  return apiClient.patch<
    AdminStaticTranslation,
    AdminStaticTranslationUpdateRequest
  >(endpoints.admin.translation(translationId), payload);
}
