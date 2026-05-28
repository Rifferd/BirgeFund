import { useQuery } from "@tanstack/react-query";

import { getHealth } from "@/features/health/api/healthApi";

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
  });
}
