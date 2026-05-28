import { apiClient, endpoints } from "@/shared/api";

import type {
  ConfirmMockPaymentRequest,
  CreateMockPaymentRequest,
  PaymentAttempt,
} from "./paymentTypes";

export function createMockPayment(payload: CreateMockPaymentRequest) {
  return apiClient.post<PaymentAttempt, CreateMockPaymentRequest>(
    endpoints.payments.mockCreate,
    payload,
  );
}

export function confirmMockPayment(payload: ConfirmMockPaymentRequest) {
  return apiClient.post<PaymentAttempt, ConfirmMockPaymentRequest>(
    endpoints.payments.mockConfirm,
    payload,
  );
}
