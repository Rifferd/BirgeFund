import { Route, Routes } from "react-router-dom";
import { PublicLayout } from "../layouts/PublicLayout";
import { HomePage } from "../pages/public/HomePage";
import { CatalogPage } from "../pages/public/CatalogPage";
import { ProjectDetailPage } from "../pages/public/ProjectDetailPage";
import { SupportProjectPage } from "../pages/public/SupportProjectPage";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/projects" element={<CatalogPage />} />
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="/projects/:slug/support" element={<SupportProjectPage />} />
      </Route>
    </Routes>
  );
}
