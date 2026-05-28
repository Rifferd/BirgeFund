import { Route, Routes } from "react-router-dom";
import { PublicLayout } from "../layouts/PublicLayout";
import { HomePage } from "../pages/public/HomePage";
import { CatalogPage } from "../pages/public/CatalogPage";
import { ProjectDetailPage } from "../pages/public/ProjectDetailPage";
import { SupportProjectPage } from "../pages/public/SupportProjectPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { DashboardHomePage } from "../pages/dashboard/DashboardHomePage";
import { ProtectedRoute } from "../features/auth/components/ProtectedRoute";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/projects" element={<CatalogPage />} />
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="/projects/:slug/support" element={<SupportProjectPage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardHomePage />} />
      </Route>
    </Routes>
  );
}
