export type ProjectReward = {
  id: number;
  project_id: number;
  title?: string | null;
  description?: string | null;
  amount?: string | number | null;
  currency?: string | null;
  quantity_total?: number | null;
  quantity_left?: number | null;
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string | null;
};
