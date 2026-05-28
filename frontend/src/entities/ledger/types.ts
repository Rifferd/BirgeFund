export type LedgerEntry = {
  id: number;
  project_id?: number | null;
  user_id?: number | null;
  payment_attempt_id?: number | null;
  type: string;
  amount: string | number;
  currency: string;
  status?: string;
  meta?: Record<string, unknown> | null;
  created_at?: string;
  created_by?: number | null;
};
