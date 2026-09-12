import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { passStore } from "@/lib/pass-store";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const { benefitId } = body;

    const benefit = passStore.getBenefitById(benefitId);
    if (!benefit) {
      return NextResponse.json({ error: "Benefício não encontrado." }, { status: 404 });
    }

    const uniqueCode = `NXT-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const newVoucher = passStore.createVoucher({
      code: uniqueCode,
      benefitId: benefit.id,
      benefitTitle: benefit.title,
      partnerId: benefit.partnerId,
      partnerName: benefit.partnerName,
      discountLabel: benefit.discountLabel,
      status: "valid",
      qrPayload: `NXTGEN_PASS::${uniqueCode}::${benefit.partnerName.replace(/\s+/g, "")}`,
      redeemedAt: new Date().toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      terms: benefit.terms[0] || "Apresente o QR Code no balcão ao pedir a conta.",
      userId: user?.id || "usr_demo_rafael",
      userEmail: user?.email || "rafael.molina@nxtgen.app",
      userName: user?.fullName || "Rafael Molina",
    });

    return NextResponse.json({
      success: true,
      message: "Benefício resgatado com sucesso!",
      voucher: newVoucher,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao resgatar benefício." },
      { status: 500 }
    );
  }
}
