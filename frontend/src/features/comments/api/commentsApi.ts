import type {
  CreateProjectCommentRequest,
  ProjectComment,
} from "@/entities/comment/types";
import { apiClient, endpoints } from "@/shared/api";
import { normalizeApiList } from "@/shared/lib/apiList";

export async function getProjectComments(projectId: number | string) {
  const payload = await apiClient.get<ProjectComment[] | { items: ProjectComment[] }>(
    endpoints.projects.comments(projectId),
    {
      auth: false,
    },
  );

  return normalizeApiList<ProjectComment>(payload);
}

export function createProjectComment(
  projectId: number | string,
  payload: CreateProjectCommentRequest,
) {
  return apiClient.post<ProjectComment, CreateProjectCommentRequest>(
    endpoints.projects.comments(projectId),
    payload,
  );
}
