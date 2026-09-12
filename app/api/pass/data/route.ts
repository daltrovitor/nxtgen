import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { passStore, SystemVoucher } from "@/lib/pass-store";
import { supabaseAdmin } from "@/lib/supabase/client";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    let benefits: any[] = [];
    let missions: any[] = [];
    let userVouchers: SystemVoucher[] = [];

    // 1. Try Supabase
    if (supabaseAdmin) {
      try {
        const [resBenefits, resMissions] = await Promise.all([
          supabaseAdmin.from("benefits").select("*").eq("is_active", true).order("created_at", { ascending: false }),
          supabaseAdmin.from("missions").select("*").order("created_at", { ascending: false }),
        ]);

        if (resBenefits.data) {
          benefits = resBenefits.data.map((b: any) => ({
            id: b.id,
            partnerId: b.partner_id || b.id,
            partnerName: b.partner_name,
            partnerLogo: b.partner_logo,
            partnerBanner: b.partner_banner,
            partnerLocation: b.partner_location || "São Paulo, SP",
            categoryId: b.category_id,
            title: b.title,
            description: b.description || "",
            discountLabel: b.discount_label,
            minNxtLevel: b.min_nxt_level || 1,
            terms: Array.isArray(b.terms) ? b.terms : [b.terms || "Apresente o QR Code no balcão."],
          }));
        }

        if (resMissions.data) {
          missions = resMissions.data.map((m: any) => ({
            id: m.id,
            title: m.title,
            description: m.description,
            xpReward: m.xp_reward,
            total: m.total,
            progress: m.progress,
            isCompleted: m.is_completed,
          }));
        }

        if (user) {
          const { data: dbVouchers } = await supabaseAdmin
            .from("vouchers")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (dbVouchers) {
            userVouchers = dbVouchers.map((v: any) => ({
              id: v.id,
              code: v.code,
              benefitId: v.benefit_id,
              benefitTitle: v.benefit_title,
              partnerId: v.partner_id || v.id,
              partnerName: v.partner_name,
              discountLabel: v.discount_label,
              status: v.status,
              qrPayload: v.qr_payload,
              redeemedAt: new Date(v.redeemed_at || v.created_at).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              }),
              terms: v.terms || "Apresente o QR Code no balcão.",
              userId: v.user_id,
              userEmail: v.user_email,
              userName: v.user_name,
            }));
          }
        }
      } catch (dbErr) {
        console.warn("Supabase pass data lookup notice:", dbErr);
      }
    }

    // 2. Fallback to passStore if tables don't exist yet
    if (benefits.length === 0) {
      benefits = passStore.getBenefits();
    }
    if (missions.length === 0) {
      missions = passStore.getMissions();
    }
    if (userVouchers.length === 0 && user) {
      userVouchers = passStore.getUserVouchers(user.id);
      if (userVouchers.length === 0 && user.email) {
        userVouchers = passStore.getUserVouchers(user.email);
      }
    }

    return NextResponse.json({
      success: true,
      benefits,
      missions,
      vouchers: userVouchers,
      currentUser: user
        ? {
            id: user.id,
            email: user.email,
            name: user.fullName,
            nxtLevel: user.nxtLevel,
            nxtScore: user.nxtScore,
            role: user.role,
            walletBalance: user.walletBalance,
          }
        : null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao consultar dados do NXT Pass." },
      { status: 500 }
    );
  }
}
