export type CategoryTranslation = {
  id?: number;
  category_id?: number;
  language: string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string | null;
};

export type Category = {
  id: number;
  slug: string;
  icon?: string | null;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string | null;
  translations: CategoryTranslation[];
};
