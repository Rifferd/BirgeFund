import { apiClient } from "@/shared/api/client";
import { endpoints } from "@/shared/api/endpoints";

export type HealthResponse = {
  status: string;
};

export function getHealth() {
  return apiClient.get<HealthResponse>(endpoints.health, {
    auth: false,
  });
}
