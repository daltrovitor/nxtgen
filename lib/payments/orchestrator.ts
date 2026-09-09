import crypto from "crypto";

export interface SplitRule {
  partnerId: string;
  partnerPercentage: number; // e.g. 90%
  platformPercentage: number; // e.g. 10%
}

export interface PaymentRequest {
  orderId: string;
  userId: string;
  partnerId: string;
  amount: number; // In BRL (e.g. 100.00)
  paymentMethod: "pix" | "credit_card" | "wallet";
  splitRule?: SplitRule;
  customer: {
    name: string;
    email: string;
    taxId: string; // CPF
  };
}

export interface PaymentResult {
  transactionId: string;
  status: "pending" | "paid" | "failed";
  paymentMethod: "pix" | "credit_card" | "wallet";
  totalAmount: number;
  partnerAmount: number;
  platformAmount: number;
  pixQrCode?: string;
  pixCopyPaste?: string;
  provider: "pagarme" | "mercadopago" | "asaas";
  createdAt: string;
}

export interface PaymentProvider {
  name: string;
  createPayment(req: PaymentRequest): Promise<PaymentResult>;
  verifyWebhook(payload: any, signature: string): boolean;
}

/**
 * Pagar.me / Stone Adapter for Marketplace & Split
 */
export class PagarmeAdapter implements PaymentProvider {
  name = "pagarme";

  async createPayment(req: PaymentRequest): Promise<PaymentResult> {
    const split = req.splitRule || { partnerId: req.partnerId, partnerPercentage: 90, platformPercentage: 10 };
    const platformAmount = Number(((req.amount * split.platformPercentage) / 100).toFixed(2));
    const partnerAmount = Number((req.amount - platformAmount).toFixed(2));

    const txId = `pagarme_tx_${crypto.randomBytes(8).toString("hex")}`;
    const pixCopyPaste = `00020101021226840014br.gov.bcb.pix2562pix.nxtgen.app/qr/${txId}520400005303986540${req.amount.toFixed(2)}5802BR5915NXTGEN BENEFIC6009SAO PAULO62070503***6304`;

    return {
      transactionId: txId,
      status: "pending",
      paymentMethod: req.paymentMethod,
      totalAmount: req.amount,
      partnerAmount,
      platformAmount,
      pixQrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCopyPaste)}`,
      pixCopyPaste,
      provider: "pagarme",
      createdAt: new Date().toISOString(),
    };
  }

  verifyWebhook(payload: any, signature: string): boolean {
    const secret = process.env.PAGARME_WEBHOOK_SECRET || "nxtgen_pagarme_secret_mock";
    const computedSig = crypto.createHmac("sha256", secret).update(JSON.stringify(payload)).digest("hex");
    return computedSig === signature;
  }
}

/**
 * Payment Orchestrator (Payment Orchestration Layer - POL)
 * Decoupled from specific gateways to allow seamless multi-PSP switching
 */
export class PaymentOrchestrator {
  private primaryProvider: PaymentProvider = new PagarmeAdapter();

  async processOrderPayment(req: PaymentRequest): Promise<PaymentResult> {
    // 1. Antifraud / Input Sanity Check
    if (req.amount <= 0) {
      throw new Error("Valor da transação inválido.");
    }
    if (!req.customer.taxId || req.customer.taxId.length < 11) {
      throw new Error("CPF do comprador é obrigatório para compliance bancário.");
    }

    // 2. Route through active provider adapter
    return await this.primaryProvider.createPayment(req);
  }
}

export const paymentOrchestrator = new PaymentOrchestrator();
