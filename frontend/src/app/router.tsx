import { createBrowserRouter } from "react-router-dom";

import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";

import { AdminLayout } from "@/layouts/AdminLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PublicLayout } from "@/layouts/PublicLayout";

import { ErrorPage } from "@/pages/ErrorPage";

import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";

import { HomePage } from "@/pages/public/HomePage";
import { ProjectsPage } from "@/pages/public/ProjectsPage";
import { ProjectDetailPage } from "@/pages/public/ProjectDetailPage";
import { SupportProjectPage } from "@/pages/public/SupportProjectPage";
import { CMSPage } from "@/pages/public/CMSPage";

import { DashboardHomePage } from "@/pages/dashboard/DashboardHomePage";
import { ProfilePage } from "@/pages/dashboard/ProfilePage";
import { MySupportsPage } from "@/pages/dashboard/MySupportsPage";
import { TransactionsPage } from "@/pages/dashboard/TransactionsPage";
import { NotificationsPage } from "@/pages/dashboard/NotificationsPage";
import { SettingsPage } from "@/pages/dashboard/SettingsPage";

import { AuthorHomePage } from "@/pages/author/AuthorHomePage";
import { AuthorProjectsPage } from "@/pages/author/AuthorProjectsPage";
import { CreateProjectPage } from "@/pages/author/CreateProjectPage";

import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import { AdminProjectsPage } from "@/pages/admin/AdminProjectsPage";
import { AdminPaymentsPage } from "@/pages/admin/AdminPaymentsPage";
import { AdminLedgerPage } from "@/pages/admin/AdminLedgerPage";
import { AdminRefundsPage } from "@/pages/admin/AdminRefundsPage";
import { AdminReportsPage } from "@/pages/admin/AdminReportsPage";
import { AdminComplaintsPage } from "@/pages/admin/AdminComplaintsPage";
import { AdminCMSPagesPage } from "@/pages/admin/AdminCMSPagesPage";
import { AdminBannersPage } from "@/pages/admin/AdminBannersPage";
import { AdminTranslationsPage } from "@/pages/admin/AdminTranslationsPage";

import { routes } from "@/shared/config/routes";

export const router = createBrowserRouter([
  {
    path: routes.home,
    element: <PublicLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "projects",
        element: <ProjectsPage />,
      },
      {
        path: "projects/:slug/support",
        element: <SupportProjectPage />,
      },
      {
        path: "projects/:slug",
        element: <ProjectDetailPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "pages/:slug",
        element: <CMSPage />,
      },
    ],
  },
  {
    path: "dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <DashboardHomePage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "supports",
        element: <MySupportsPage />,
      },
      {
        path: "transactions",
        element: <TransactionsPage />,
      },
      {
        path: "notifications",
        element: <NotificationsPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: "author",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <AuthorHomePage />,
      },
      {
        path: "projects",
        element: <AuthorProjectsPage />,
      },
      {
        path: "projects/create",
        element: <CreateProjectPage />,
      },
    ],
  },
  {
    path: "admin",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: "users",
        element: <AdminUsersPage />,
      },
      {
        path: "projects",
        element: <AdminProjectsPage />,
      },
      {
        path: "payments",
        element: <AdminPaymentsPage />,
      },
      {
        path: "ledger",
        element: <AdminLedgerPage />,
      },
      {
        path: "refunds",
        element: <AdminRefundsPage />,
      },
      {
        path: "reports",
        element: <AdminReportsPage />,
      },
      {
        path: "complaints",
        element: <AdminComplaintsPage />,
      },
      {
        path: "cms",
        element: <AdminCMSPagesPage />,
      },
      {
        path: "banners",
        element: <AdminBannersPage />,
      },
      {
        path: "translations",
        element: <AdminTranslationsPage />,
      },
    ],
  },
]);
