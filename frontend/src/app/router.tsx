import { createBrowserRouter } from "react-router-dom";

import { AdminLayout } from "@/layouts/AdminLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PublicLayout } from "@/layouts/PublicLayout";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminProjectsPage } from "@/pages/admin/AdminProjectsPage";
import { AdminPaymentsPage } from "@/pages/admin/AdminPaymentsPage";
import { AdminLedgerPage } from "@/pages/admin/AdminLedgerPage";
import { AdminRefundsPage } from "@/pages/admin/AdminRefundsPage";
import { AdminReportsPage } from "@/pages/admin/AdminReportsPage";
import { AdminComplaintsPage } from "@/pages/admin/AdminComplaintsPage";
import { AdminCMSPagesPage } from "@/pages/admin/AdminCMSPagesPage";
import { AdminBannersPage } from "@/pages/admin/AdminBannersPage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import { AuthorHomePage } from "@/pages/author/AuthorHomePage";
import { AuthorProjectsPage } from "@/pages/author/AuthorProjectsPage";
import { CreateProjectPage } from "@/pages/author/CreateProjectPage";
import { DashboardHomePage } from "@/pages/dashboard/DashboardHomePage";
import { MySupportsPage } from "@/pages/dashboard/MySupportsPage";
import { NotificationsPage } from "@/pages/dashboard/NotificationsPage";
import { ProfilePage } from "@/pages/dashboard/ProfilePage";
import { SettingsPage } from "@/pages/dashboard/SettingsPage";
import { TransactionsPage } from "@/pages/dashboard/TransactionsPage";

import { HomePage } from "@/pages/public/HomePage";
import { ProjectDetailPage } from "@/pages/public/ProjectDetailPage";
import { ProjectsPage } from "@/pages/public/ProjectsPage";
import { SupportProjectPage } from "@/pages/public/SupportProjectPage";
import { routes } from "@/shared/config/routes";

export const router = createBrowserRouter([
  {
    path: routes.home,
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: routes.projects,
        element: <ProjectsPage />,
      },
      {
        path: routes.supportProject,
        element: <SupportProjectPage />,
      },
      {
        path: routes.projectDetail,
        element: <ProjectDetailPage />,
      },
      {
        path: routes.login,
        element: <LoginPage />,
      },
      {
        path: routes.register,
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: routes.dashboard,
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
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
    path: routes.author,
    element: <ProtectedRoute><DashboardLayout /></ProtectedRoute>,
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
    path: routes.admin,
    element: <ProtectedRoute><AdminLayout /></ProtectedRoute>,
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
    ],
  },
]);
