export type Notification = {
  id: number;
  user_id?: number;
  type?: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at?: string;
  read_at?: string | null;
  meta?: Record<string, unknown> | null;
};

export type UnreadCountResponse = {
  count: number;
};
