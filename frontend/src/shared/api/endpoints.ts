export const endpoints = {
  health: "/health",

  auth: {
    register: "/auth/register",
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/me",
  },

  categories: {
    list: "/categories",
  },

  projects: {
    list: "/projects",
    my: "/projects/my",
    detail: (slug: string) => `/projects/${slug}`,
    create: "/projects",
    update: (projectId: number | string) => `/projects/${projectId}`,
    submitReview: (projectId: number | string) => `/projects/${projectId}/submit-review`,
    rewards: (projectId: number | string) => `/projects/${projectId}/rewards`,
    updates: (projectId: number | string) => `/projects/${projectId}/updates`,
    reports: (projectId: number | string) => `/projects/${projectId}/reports`,
    comments: (projectId: number | string) => `/projects/${projectId}/comments`,
  },

  files: {
    upload: "/files/upload",
    detail: (fileId: number | string) => `/files/${fileId}`,
  },

  payments: {
    mockCreate: "/payments/mock/create",
    mockConfirm: "/payments/mock/confirm",
    my: "/payments/my",
    feeRules: "/payments/fee-rules",
  },

  ledger: {
    project: (projectId: number | string) => `/ledger/projects/${projectId}`,
    projectSummary: (projectId: number | string) => `/ledger/projects/${projectId}/summary`,
    my: "/ledger/my",
  },

  refunds: {
    create: (paymentAttemptId: number | string) => `/payments/${paymentAttemptId}/refund`,
    project: (projectId: number | string) => `/projects/${projectId}/refunds`,
  },

  complaints: {
    create: "/complaints",
    my: "/complaints/my",
  },

  notifications: {
    my: "/notifications/my",
    unreadCount: "/notifications/unread-count",
    read: (notificationId: number | string) => `/notifications/${notificationId}/read`,
    readAll: "/notifications/read-all",
  },

  cms: {
    pages: "/cms/pages",
    page: (slug: string) => `/cms/pages/${slug}`,
  },

  banners: {
    list: "/banners",
  },

  translations: {
    dictionary: "/translations",
  },

  admin: {
    dashboard: "/admin/dashboard",

    users: "/admin/users",
    user: (userId: number | string) => `/admin/users/${userId}`,
    userBlock: (userId: number | string) => `/admin/users/${userId}/block`,
    userUnblock: (userId: number | string) => `/admin/users/${userId}/unblock`,
    userRoles: (userId: number | string) => `/admin/users/${userId}/roles`,

    projects: "/admin/projects",
    project: (projectId: number | string) => `/admin/projects/${projectId}`,
    projectStatus: (projectId: number | string) => `/admin/projects/${projectId}/status`,

    payments: "/admin/payments",
    payment: (paymentId: number | string) => `/admin/payments/${paymentId}`,
    paymentRefund: (paymentId: number | string) => `/admin/payments/${paymentId}/refund`,

    projectLedger: (projectId: number | string) => `/admin/ledger/projects/${projectId}`,
    projectLedgerSummary: (projectId: number | string) => `/admin/ledger/projects/${projectId}/summary`,

    refunds: "/admin/refunds",

    reports: "/admin/reports",
    reportStatus: (reportId: number | string) => `/admin/reports/${reportId}/status`,

    complaints: "/admin/complaints",
    complaintStatus: (complaintId: number | string) => `/admin/complaints/${complaintId}/status`,

    auditLogs: "/admin/audit-logs",
    auditLog: (auditLogId: number | string) => `/admin/audit-logs/${auditLogId}`,

    permissions: "/admin/permissions",
    permissionsSeed: "/admin/permissions/seed",
    roles: "/admin/roles",

    cmsPages: "/admin/cms/pages",
    cmsPage: (pageId: number | string) => `/admin/cms/pages/${pageId}`,

    banners: "/admin/banners",
    banner: (bannerId: number | string) => `/admin/banners/${bannerId}`,

    translations: "/admin/translations",
    translationsSeed: "/admin/translations/seed",
    translation: (translationId: number | string) => `/admin/translations/${translationId}`,
  },
} as const;
