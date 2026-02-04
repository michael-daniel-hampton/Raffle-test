import { Injectable } from "@nestjs/common";

@Injectable()
export class PaymentsAdapter {
  async createTicketPayment(
    listingId: string,
    buyerAliasId: string,
    qty: number,
    amount: number,
  ): Promise<{ paymentRef: string }> {
    // TODO: integrate Stripe (or PSP) + webhooks + reconciliation.
    return {
      paymentRef: `stub-${listingId}-${buyerAliasId}-${qty}-${amount}-${Date.now()}`,
    };
  }

  async confirmPayment(paymentRef: string): Promise<"CONFIRMED" | "FAILED"> {
    // TODO: integrate PSP confirmation.
    return paymentRef ? "CONFIRMED" : "FAILED";
  }

  async refundPayment(paymentRef: string, reason: string): Promise<void> {
    // TODO: integrate PSP refunds.
    void paymentRef;
    void reason;
  }
}
