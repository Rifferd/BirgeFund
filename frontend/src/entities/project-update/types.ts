export type ProjectUpdate = {
  id: number;
  project_id: number;
  author_id?: number | null;
  language?: string | null;
  title: string;
  text: string;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string | null;
};
