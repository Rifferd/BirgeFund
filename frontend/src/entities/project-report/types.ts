export type ProjectReport = {
  id: number;
  project_id: number;
  author_id?: number | null;
  language?: string | null;
  title?: string | null;
  text?: string | null;
  status?: string;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string | null;
  submitted_at?: string | null;
  reviewed_at?: string | null;
};
