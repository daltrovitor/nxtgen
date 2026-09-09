import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import QRCode from "qrcode";
import { generateDynamicQRToken, checkRateLimit, sanitizeInput } from "@/lib/security";
import { mockDb, DEMO_USER, Voucher } from "@/lib/store/mock-db";

const RedeemSchema = z.object({
  benefitId: z.string().min(1, "ID do benefício é obrigatório"),
  partnerId: z.string().min(1, "ID do parceiro é obrigatório"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    
    // 1. Rate Limiting: Max 10 redemptions per minute per IP
    const rateCheck = checkRateLimit(`redeem_${ip}`, 10, 60);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Limite de resgates excedido. Tente novamente em ${rateCheck.resetInSeconds}s.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parseResult = RedeemSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const benefitId = sanitizeInput(parseResult.data.benefitId);
    const partnerId = sanitizeInput(parseResult.data.partnerId);

    // 2. Fetch Partner & Benefit
    const partner = mockDb.getPartnerById(partnerId);
    if (!partner) {
      return NextResponse.json({ error: "Parceiro não encontrado." }, { status: 404 });
    }

    const benefit = partner.benefits.find((b) => b.id === benefitId);
    if (!benefit || !benefit.isActive) {
      return NextResponse.json({ error: "Benefício indisponível ou esgotado." }, { status: 404 });
    }

    // 3. Check if user already has an active voucher for this benefit
    const user = DEMO_USER;
    const existing = mockDb
      .getUserVouchers(user.id)
      .find((v) => v.benefitId === benefitId && v.status === "valid");

    if (existing) {
      // Re-generate refreshed dynamic QR code for existing active voucher
      const dynamicToken = generateDynamicQRToken(existing.id, user.id, partner.id);
      const qrDataUrl = await QRCode.toDataURL(dynamicToken, {
        errorCorrectionLevel: "H",
        margin: 1,
        color: { dark: "#0a0b10", light: "#ffffff" },
        width: 320,
      });

      return NextResponse.json({
        voucher: existing,
        qrPayload: dynamicToken,
        qrDataUrl,
        expiresInSeconds: 60,
      });
    }

    // 4. Generate New Voucher with Cryptographic Token
    const voucherId = `vch_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    const voucherCode = `NXT-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const dynamicToken = generateDynamicQRToken(voucherId, user.id, partner.id);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days voucher validity

    const newVoucher: Voucher = {
      id: voucherId,
      code: voucherCode,
      hmacSignature: dynamicToken.split(".").pop() || "sig",
      benefitId: benefit.id,
      benefitTitle: benefit.title,
      discountLabel: benefit.discountLabel,
      partnerId: partner.id,
      partnerName: partner.name,
      partnerLogo: partner.logoUrl,
      userId: user.id,
      userName: user.name,
      status: "valid",
      qrPayload: dynamicToken,
      redeemedAt: now.toISOString(),
      expiresAt,
    };

    mockDb.createVoucher(newVoucher);
    benefit.totalUsed += 1;

    // Generate high-resolution QR image data URL
    const qrDataUrl = await QRCode.toDataURL(dynamicToken, {
      errorCorrectionLevel: "H",
      margin: 1,
      color: { dark: "#0a0b10", light: "#ffffff" },
      width: 320,
    });

    return NextResponse.json({
      voucher: newVoucher,
      qrPayload: dynamicToken,
      qrDataUrl,
      expiresInSeconds: 60,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao processar resgate do benefício." },
      { status: 500 }
    );
  }
}
