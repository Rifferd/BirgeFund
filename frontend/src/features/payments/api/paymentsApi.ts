import { apiClient } from "../../../shared/api/client";

export type MockPaymentMethod = "TEST_CARD" | "TEST_WALLET" | "TEST_BANK";

export type CreateMockPaymentPayload = {
  project_id: number | string;
  reward_id?: number | string | null;
  amount: number;
  method: MockPaymentMethod;
  is_anonymous: boolean;
  comment?: string;
  idempotency_key: string;
};

export type PaymentAttempt = {
  id: number | string;
  status: "pending" | "success" | "failed" | "cancelled";
  amount: number;
  method: MockPaymentMethod;
  project_id: number | string;
};

export const paymentsApi = {
  createMockPayment(payload: CreateMockPaymentPayload) {
    return apiClient.post<PaymentAttempt>("/payments/mock/create", payload);
  },

  confirmMockPayment(paymentAttemptId: number | string) {
    return apiClient.post<PaymentAttempt>("/payments/mock/confirm", {
      payment_attempt_id: paymentAttemptId,
    });
  },
};
