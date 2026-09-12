import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, userStore } from "@/lib/auth";
import { passStore } from "@/lib/pass-store";
import { supabaseAdmin } from "@/lib/supabase/client";

function calculateNxtLevel(score: number): number {
  if (score < 500) return 1;
  if (score < 1000) return 2;
  if (score < 2000) return 3;
  if (score < 3500) return 4;
  if (score < 5500) return 5;
  if (score < 8000) return 6;
  return 7;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Faça login para verificar missões." }, { status: 401 });
    }

    const body = await req.json();
    const missionId = body.missionId?.trim();
    const actionData = body.actionData;

    if (!missionId) {
      return NextResponse.json({ error: "ID da missão é obrigatório." }, { status: 400 });
    }

    // Check user vouchers count in Supabase to assist benefit_redeem verification
    let vouchersCount = 0;
    if (supabaseAdmin) {
      try {
        const { count } = await supabaseAdmin
          .from("vouchers")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);
        vouchersCount = count || 0;
      } catch {}
    }
    const storeVouchersCount = passStore.getUserVouchers(user.id).length;
    const effectiveVouchersCount = Math.max(vouchersCount, storeVouchersCount);

    const result = passStore.verifyMission(user.id, missionId, {
      userVouchersCount: effectiveVouchersCount,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    let updatedScore = user.nxtScore || 250;
    let updatedLevel = user.nxtLevel || 1;

    // If newly completed and has XP to award
    if (result.completed && result.xpEarned > 0) {
      updatedScore += result.xpEarned;
      updatedLevel = calculateNxtLevel(updatedScore);

      // Keep userStore in-memory synced
      userStore.updateUser(user.id, {
        nxtScore: updatedScore,
        nxtLevel: updatedLevel,
      });

      if (supabaseAdmin) {
        try {
          await supabaseAdmin
            .from("profiles")
            .update({
              nxt_score: updatedScore,
              nxt_level: updatedLevel,
            })
            .eq("id", user.id);

          const { data: authData } = await supabaseAdmin.auth.admin.getUserById(user.id);
          const meta = authData?.user?.user_metadata || {};
          const acceptedMap = meta.accepted_missions || {};
          acceptedMap[missionId] = {
            isAccepted: true,
            isCompleted: true,
            progress: result.progress,
            actionData: actionData || undefined,
            completedAt: new Date().toISOString(),
          };

          await supabaseAdmin.auth.admin.updateUserById(user.id, {
            user_metadata: {
              ...meta,
              nxt_score: updatedScore,
              nxt_level: updatedLevel,
              accepted_missions: acceptedMap,
            },
          });
        } catch (dbErr) {
          console.warn("Notice updating profile on mission verification:", dbErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      completed: result.completed,
      progress: result.progress,
      total: result.total,
      xpEarned: result.xpEarned,
      message: result.message,
      currentUser: {
        id: user.id,
        name: user.fullName,
        nxtScore: updatedScore,
        nxtLevel: updatedLevel,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao verificar missão." },
      { status: 500 }
    );
  }
}
