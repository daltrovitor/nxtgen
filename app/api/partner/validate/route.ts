import { NextRequest, NextResponse } from "next/server";
import { verifyPartnerRequest } from "@/lib/auth";
import { passStore, SystemVoucher } from "@/lib/pass-store";
import { supabaseAdmin } from "@/lib/supabase/client";

/**
 * Normalizes user input or QR payload to locate voucher
 */
function extractVoucherCode(input: string): string {
  const trimmed = input.trim();
  // If payload format: NXTGEN_PASS::NXT-1234-5678::PartnerName
  if (trimmed.startsWith("NXTGEN_PASS::")) {
    const parts = trimmed.split("::");
    if (parts[1]) return parts[1].trim().toUpperCase();
  }
  return trimmed.toUpperCase();
}

/**
 * POST /api/partner/validate
 * body: { code: string, action?: 'lookup' | 'redeem' }
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyPartnerRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const rawInput = body.code || body.payload || "";
    const action = body.action || "lookup"; // 'lookup' | 'redeem'

    if (!rawInput) {
      return NextResponse.json(
        { error: "Informe ou escaneie o código do voucher." },
        { status: 400 }
      );
    }

    const normalizedCode = extractVoucherCode(rawInput);

    // 1. Try finding in Supabase
    let foundVoucher: any = null;
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("vouchers")
        .select("*")
        .or(`code.eq.${normalizedCode},qr_payload.eq.${rawInput},id.eq.${normalizedCode}`)
        .maybeSingle();

      if (!error && data) {
        foundVoucher = {
          id: data.id,
          code: data.code,
          benefitId: data.benefit_id,
          benefitTitle: data.benefit_title,
          partnerId: data.partner_id,
          partnerName: data.partner_name,
          discountLabel: data.discount_label,
          status: data.status,
          qrPayload: data.qr_payload,
          redeemedAt: new Date(data.redeemed_at || data.created_at).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          validatedAt: data.validated_at
            ? new Date(data.validated_at).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : null,
          terms: data.terms || "Apresente o QR Code no balcão ao pedir a conta.",
          userId: data.user_id,
          userEmail: data.user_email,
          userName: data.user_name,
        };
      }
    }

    // 2. Fallback to passStore
    if (!foundVoucher) {
      const vouchers = passStore.getVouchers();
      const match = vouchers.find(
        (v) =>
          v.code.toUpperCase() === normalizedCode ||
          v.qrPayload === rawInput ||
          v.id === normalizedCode
      );
      if (match) {
        foundVoucher = { ...match };
      }
    }

    if (!foundVoucher) {
      return NextResponse.json(
        {
          success: false,
          error: `Voucher '${normalizedCode}' não encontrado no sistema. Verifique o código e tente novamente.`,
        },
        { status: 404 }
      );
    }

    // Action: Redeem / Mark as used
    if (action === "redeem") {
      if (foundVoucher.status === "used") {
        return NextResponse.json(
          {
            success: false,
            error: `Este voucher já foi utilizado anteriormente${
              foundVoucher.validatedAt ? ` em ${foundVoucher.validatedAt}` : ""
            }.`,
            voucher: foundVoucher,
          },
          { status: 400 }
        );
      }

      const validatedAtIso = new Date().toISOString();
      const validatedAtDisplay = new Date().toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      // Update in Supabase
      if (supabaseAdmin) {
        try {
          await supabaseAdmin
            .from("vouchers")
            .update({
              status: "used",
              validated_at: validatedAtIso,
            })
            .eq("id", foundVoucher.id);
        } catch (dbErr) {
          console.warn("Supabase voucher update notice:", dbErr);
        }
      }

      // Update in passStore
      passStore.updateVoucherStatus(foundVoucher.id, "used");
      if (foundVoucher.code) {
        passStore.updateVoucherStatus(foundVoucher.code, "used");
      }

      foundVoucher.status = "used";
      foundVoucher.validatedAt = validatedAtDisplay;

      return NextResponse.json({
        success: true,
        message: "Voucher validado e baixado com sucesso!",
        voucher: foundVoucher,
      });
    }

    // Default Action: Lookup only
    return NextResponse.json({
      success: true,
      canRedeem: foundVoucher.status === "valid",
      warning:
        foundVoucher.status === "used"
          ? `Atenção: Este voucher já consta como UTILIZADO${
              foundVoucher.validatedAt ? ` em ${foundVoucher.validatedAt}` : ""
            }.`
          : null,
      voucher: foundVoucher,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao processar validação do voucher." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/partner/validate
 * Returns recent vouchers validated or stored
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyPartnerRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // Try Supabase first
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("vouchers")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data) {
        const mapped = data.map((v: any) => ({
          id: v.id,
          code: v.code,
          benefitTitle: v.benefit_title,
          partnerName: v.partner_name,
          discountLabel: v.discount_label,
          status: v.status,
          redeemedAt: new Date(v.redeemed_at || v.created_at).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
          validatedAt: v.validated_at
            ? new Date(v.validated_at).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
            : null,
          userName: v.user_name,
          userEmail: v.user_email,
        }));

        return NextResponse.json({ success: true, vouchers: mapped });
      }
    }

    // Fallback to passStore
    const all = passStore.getVouchers().slice(0, 20);
    return NextResponse.json({ success: true, vouchers: all });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao consultar histórico." },
      { status: 500 }
    );
  }
}
