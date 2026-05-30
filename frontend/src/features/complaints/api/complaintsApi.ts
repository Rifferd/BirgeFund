import { apiClient, endpoints } from "@/shared/api";

export type CreateComplaintRequest = {
  project_id: number;
  comment_id?: null;
  reason: string;
  text: string;
};

export type Complaint = {
  id: number;
  reporter_id?: number | null;
  project_id: number;
  comment_id?: number | null;
  reason: string;
  text: string;
  status: string;
  moderator_id?: number | null;
  moderator_comment?: string | null;
  created_at?: string;
  reviewed_at?: string | null;
};

export function createComplaint(payload: CreateComplaintRequest) {
  return apiClient.post<Complaint, CreateComplaintRequest>(
    endpoints.complaints.create,
    payload,
  );
}
