export type CMSPageTranslation = {
  id?: number;
  page_id?: number;
  language: string;
  title: string;
  content: string;
  meta_title?: string | null;
  meta_description?: string | null;
  created_at?: string;
  updated_at?: string | null;
};

export type CMSPage = {
  id: number;
  slug: string;
  status?: string;
  is_published?: boolean;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string | null;
  translations: CMSPageTranslation[];
};
