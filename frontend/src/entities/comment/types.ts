export type ProjectComment = {
  id: number;
  project_id: number;
  author_id?: number | null;
  parent_id?: number | null;
  text: string;
  status?: string;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string | null;
  author?: {
    id: number;
    email?: string;
    full_name?: string | null;
  } | null;
};

export type CreateProjectCommentRequest = {
  text: string;
  parent_id?: number | null;
};
