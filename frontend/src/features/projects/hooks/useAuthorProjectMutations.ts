import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createProjectReport,
  createProjectReward,
  createProjectUpdate,
  type ProjectReportCreateRequest,
  type ProjectRewardCreateRequest,
  type ProjectUpdateCreateRequest,
} from "@/features/projects/api/projectsApi";

export function useCreateProjectUpdate(projectId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProjectUpdateCreateRequest) =>
      createProjectUpdate(projectId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["project-updates", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["projects", "my"] });
    },
  });
}

export function useCreateProjectReport(projectId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProjectReportCreateRequest) =>
      createProjectReport(projectId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["project-reports", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
      await queryClient.invalidateQueries({ queryKey: ["projects", "my"] });
    },
  });
}

export function useCreateProjectReward(projectId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProjectRewardCreateRequest) =>
      createProjectReward(projectId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["project-rewards", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["projects", "my"] });
    },
  });
}
