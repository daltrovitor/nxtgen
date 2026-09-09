import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyDynamicQRToken, checkRateLimit, sanitizeInput } from "@/lib/security";
import { mockDb } from "@/lib/store/mock-db";

const ValidateSchema = z.object({
  partnerId: z.string().min(1, "ID do parceiro é obrigatório"),
  qrTokenOrCode: z.string().min(1, "QR Token ou código do voucher é obrigatório"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    
    // Rate limit: Max 20 scans per minute
    const rateCheck = checkRateLimit(`validate_${ip}`, 20, 60);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas de validação. Aguarde alguns segundos." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parseResult = ValidateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const partnerId = sanitizeInput(parseResult.data.partnerId);
    const tokenOrCode = parseResult.data.qrTokenOrCode.trim();

    // Check if input is a dynamic QR token or manual voucher code
    if (tokenOrCode.length > 50) {
      // 1. Dynamic QR Token Verification (Cryptographic Check)
      const tokenVerification = verifyDynamicQRToken(tokenOrCode, partnerId);
      if (!tokenVerification.valid) {
        return NextResponse.json(
          { error: tokenVerification.error || "Token inválido." },
          { status: 400 }
        );
      }

      const decoded = tokenVerification.data!;
      // Find voucher by ID
      const userVouchers = mockDb.getUserVouchers(decoded.userId);
      const voucher = userVouchers.find((v) => v.id === decoded.voucherId);

      if (!voucher) {
        return NextResponse.json(
          { error: "Voucher correspondente não encontrado no sistema." },
          { status: 404 }
        );
      }

      const validation = mockDb.validateVoucher(voucher.code, partnerId);
      if (!validation.success) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: "Benefício validado com sucesso!",
        voucher: validation.voucher,
      });
    } else {
      // 2. Manual Voucher Code Verification (e.g. NXT-XXXX-XXXX)
      const sanitizedCode = sanitizeInput(tokenOrCode.toUpperCase());
      const validation = mockDb.validateVoucher(sanitizedCode, partnerId);

      if (!validation.success) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: "Código de benefício validado com sucesso!",
        voucher: validation.voucher,
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro na validação do voucher." },
      { status: 500 }
    );
  }
}
