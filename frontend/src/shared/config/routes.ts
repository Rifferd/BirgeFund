export const routes = {
  home: "/",
  projects: "/projects",
  projectDetail: (slug: string) => `/projects/${slug}`,
  supportProject: (slug: string) => `/projects/${slug}/support`,
};
