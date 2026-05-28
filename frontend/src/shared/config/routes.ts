export const routes = {
  home: "/",
  projects: "/projects",
  projectDetail: "/projects/:slug",
  supportProject: "/projects/:slug/support",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  author: "/author",
  admin: "/admin",
  cmsPage: "/pages/:slug",
} as const;

export function buildProjectUrl(slug: string) {
  return `/projects/${slug}`;
}

export function buildSupportProjectUrl(slug: string) {
  return `/projects/${slug}/support`;
}
