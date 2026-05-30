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


export async function getMyPayments() {
  const payload = await apiClient.get<PaymentAttempt[] | { items: PaymentAttempt[] }>(
    endpoints.payments.my,
  );

  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.items;
}
