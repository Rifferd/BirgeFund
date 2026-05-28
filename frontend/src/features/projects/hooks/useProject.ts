import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "../api/projectsApi";

export function useProject(slug: string | undefined) {
  return useQuery({
    queryKey: ["project", slug],
    queryFn: () => projectsApi.getProject(slug!),
    enabled: Boolean(slug),
  });
}
