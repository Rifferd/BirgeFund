import { createBrowserRouter } from "react-router-dom";

import { AdminLayout } from "@/layouts/AdminLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PublicLayout } from "@/layouts/PublicLayout";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AuthorHomePage } from "@/pages/author/AuthorHomePage";
import { DashboardHomePage } from "@/pages/dashboard/DashboardHomePage";
import { HomePage } from "@/pages/public/HomePage";
import { ProjectDetailPage } from "@/pages/public/ProjectDetailPage";
import { ProjectsPage } from "@/pages/public/ProjectsPage";
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
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <DashboardHomePage />,
      },
    ],
  },
  {
    path: routes.author,
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <AuthorHomePage />,
      },
    ],
  },
  {
    path: routes.admin,
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
    ],
  },
]);
