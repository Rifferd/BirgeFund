export type ProjectTranslation = {
  language?: string;
  locale?: string;
  title?: string;
  short_description?: string;
  description?: string;
  risks?: string;
  refund_policy?: string;
};

export type ProjectCategory = {
  id?: number | string;
  name?: string;
  title?: string;
  slug?: string;
  translations?: ProjectTranslation[];
};

export type ProjectImage = {
  id?: number | string;
  url?: string;
  file_url?: string;
  image_url?: string;
};

export type ProjectReward = {
  id: number | string;
  title?: string;
  description?: string;
  amount: number;
  limit?: number | null;
  claimed_count?: number;
  requires_delivery?: boolean;
  estimated_delivery_date?: string | null;
  is_active?: boolean;
};

export type ProjectAuthor = {
  id?: number | string;
  full_name?: string;
  name?: string;
  display_name?: string;
  verification_status?: string;
};

export type Project = {
  id: number | string;
  slug?: string;

  title?: string;
  short_description?: string;
  description?: string;
  risks?: string;
  refund_policy?: string;

  translations?: ProjectTranslation[];

  category?: ProjectCategory | string | null;
  categories?: ProjectCategory[];

  city?: string | null;
  project_type?: string | null;
  type?: string | null;
  status?: string | null;

  goal_amount?: number | string | null;
  target_amount?: number | string | null;
  goal?: number | string | null;

  gross_collected?: number | string | null;
  collected_amount?: number | string | null;
  collected?: number | string | null;

  deadline?: string | null;
  days_left?: number | null;

  cover_image_url?: string | null;
  image_url?: string | null;
  main_image_url?: string | null;
  images?: ProjectImage[];

  rewards?: ProjectReward[];
  author?: ProjectAuthor | null;

  updates?: unknown[];
  reports?: unknown[];
  comments?: unknown[];
};

export type ProjectListParams = {
  page?: number;
  page_size?: number;
  search?: string;
  category?: string;
  status?: string;
  city?: string;
  project_type?: string;
  sort?: string;
};
