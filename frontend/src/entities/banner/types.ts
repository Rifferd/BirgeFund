export type BannerTranslation = {
  id?: number;
  banner_id?: number;
  language: string;
  title: string;
  subtitle?: string | null;
  cta_text?: string | null;
  created_at?: string;
  updated_at?: string | null;
};

export type Banner = {
  id: number;
  slug: string;
  placement: string;
  image_file_id?: number | null;
  link_url?: string | null;
  sort_order?: number;
  is_active?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  created_at?: string;
  updated_at?: string | null;
  translations: BannerTranslation[];
};
