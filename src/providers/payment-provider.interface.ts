export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentResponse {
  providerReference: string;
  status: string;
  metadata?: Record<string, unknown>;
}

export interface IPaymentProvider {
  processPayment(request: PaymentRequest): Promise<PaymentResponse>;
  getProviderName(): string;
}
