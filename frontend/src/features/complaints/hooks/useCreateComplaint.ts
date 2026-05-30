import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createComplaint } from "@/features/complaints/api/complaintsApi";

export function useCreateComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComplaint,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["complaints"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "complaints"] });
    },
  });
}
