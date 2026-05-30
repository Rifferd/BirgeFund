import type { Category } from "@/entities/category/types";

export type ProjectStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "fundraising"
  | "funded"
  | "in_progress"
  | "completed"
  | "failed"
  | "cancelled"
  | "frozen";

export type ProjectType =
  | "donation"
  | "reward"
  | "preorder"
  | "business_support"
  | "investment_disabled";

export type FundingType = "all_or_nothing" | "flexible_funding";

export type ProjectTranslation = {
  id: number;
  project_id?: number;
  language: string;
  title: string;
  short_description: string;
  description?: string | null;
  risks?: string | null;
  refund_policy?: string | null;
  reward_description?: string | null;
  report_text?: string | null;
  created_at?: string;
  updated_at?: string | null;
};

export type Project = {
  id: number;
  author_id: number;
  slug: string;
  status: ProjectStatus | string;
  project_type: ProjectType | string;
  funding_type: FundingType | string;
  city: string | null;
  goal_amount: string | number;
  currency: string;
  deadline: string | null;
  submitted_at?: string | null;
  approved_at?: string | null;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string | null;

  gross_collected?: string | number;
  net_amount?: string | number;
  platform_fee_amount?: string | number;
  refunded_amount?: string | number;
  progress_percent?: number;

  translations: ProjectTranslation[];
  categories?: Category[];
};
