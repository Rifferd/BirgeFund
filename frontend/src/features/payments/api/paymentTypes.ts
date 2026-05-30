export type MockPaymentMethod = "TEST_CARD" | "TEST_WALLET" | "TEST_BANK";

export type CreateMockPaymentRequest = {
  project_id: number;
  amount: number;
  currency: string;
  method: MockPaymentMethod;
  idempotency_key: string;
  request_payload: {
    comment?: string;
    anonymous?: boolean;
    reward_id?: number | null;
  };
};

export type ConfirmMockPaymentRequest = {
  payment_attempt_id: number;
};

export type PaymentAttempt = {
  id: number;
  user_id: number;
  project_id: number;
  amount: string | number;
  currency: string;
  method: string;
  status: string;
  idempotency_key: string;
  request_payload?: Record<string, unknown> | null;
  created_at?: string;
  confirmed_at?: string | null;
};
