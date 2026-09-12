import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { passStore } from "@/lib/pass-store";
import { supabaseAdmin } from "@/lib/supabase/client";

async function verifyAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return { authorized: false, status: 401, error: "Não autenticado." };
  }

  const { valid, payload } = verifySessionToken(token);
  if (!valid || !payload) {
    return { authorized: false, status: 401, error: "Sessão inválida ou expirada." };
  }

  if (payload.role !== "admin") {
    return {
      authorized: false,
      status: 403,
      error: "Acesso Negado. Requer privilégios de administrador (role = 'admin').",
    };
  }

  return { authorized: true, adminUser: payload };
}

export async function GET() {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // 1. Try Supabase
    if (supabaseAdmin) {
      const { data: dbMissions, error } = await supabaseAdmin
        .from("missions")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && dbMissions) {
        const mapped = dbMissions.map((m: any) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          xpReward: m.xp_reward,
          total: m.total,
          progress: m.progress,
          isCompleted: m.is_completed,
        }));
        return NextResponse.json({ success: true, missions: mapped });
      }
    }

    // 2. Fallback to passStore
    const missions = passStore.getMissions();
    return NextResponse.json({ success: true, missions });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao consultar missões." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { title, description, xpReward, total, progress } = body;

    if (!title || !description || xpReward === undefined) {
      return NextResponse.json(
        { error: "Campos obrigatórios: Título, Descrição e Recompensa em XP." },
        { status: 400 }
      );
    }

    const targetTotal = Number(total) || 1;
    const currentProgress = Number(progress) || 0;
    const isCompleted = currentProgress >= targetTotal;

    // 1. Try Supabase
    if (supabaseAdmin) {
      const { data: inserted, error } = await supabaseAdmin
        .from("missions")
        .insert({
          title: title.trim(),
          description: description.trim(),
          xp_reward: Number(xpReward),
          total: targetTotal,
          progress: currentProgress,
          is_completed: isCompleted,
        })
        .select()
        .single();

      if (!error && inserted) {
        const missionObj = {
          id: inserted.id,
          title: inserted.title,
          description: inserted.description,
          xpReward: inserted.xp_reward,
          total: inserted.total,
          progress: inserted.progress,
          isCompleted: inserted.is_completed,
        };
        passStore.createMission(missionObj);
        return NextResponse.json({
          success: true,
          message: "Missão criada no Supabase com sucesso!",
          mission: missionObj,
        });
      }
    }

    // 2. Fallback to passStore
    const newMission = passStore.createMission({
      title: title.trim(),
      description: description.trim(),
      xpReward: Number(xpReward),
      progress: currentProgress,
      total: targetTotal,
      isCompleted,
    });

    return NextResponse.json({
      success: true,
      message: "Missão criada com sucesso!",
      mission: newMission,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao criar missão." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { id, title, description, xpReward, total, progress, isCompleted } = body;

    if (!id) {
      return NextResponse.json({ error: "ID da missão é obrigatório." }, { status: 400 });
    }

    // 1. Try Supabase
    if (supabaseAdmin) {
      const dbUpdates: Record<string, any> = {};
      if (title !== undefined) dbUpdates.title = title.trim();
      if (description !== undefined) dbUpdates.description = description.trim();
      if (xpReward !== undefined) dbUpdates.xp_reward = Number(xpReward);
      if (total !== undefined) dbUpdates.total = Number(total);
      if (progress !== undefined) dbUpdates.progress = Number(progress);
      if (isCompleted !== undefined) dbUpdates.is_completed = Boolean(isCompleted);

      const { data: updated, error } = await supabaseAdmin
        .from("missions")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();

      if (!error && updated) {
        passStore.updateMission(id, {
          title: updated.title,
          description: updated.description,
          xpReward: updated.xp_reward,
          total: updated.total,
          progress: updated.progress,
          isCompleted: updated.is_completed,
        });
        return NextResponse.json({
          success: true,
          message: "Missão atualizada no Supabase com sucesso!",
          mission: updated,
        });
      }
    }

    // 2. Fallback to passStore
    const updates: Record<string, any> = {};
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (xpReward !== undefined) updates.xpReward = Number(xpReward);
    if (total !== undefined) updates.total = Number(total);
    if (progress !== undefined) updates.progress = Number(progress);
    if (isCompleted !== undefined) updates.isCompleted = Boolean(isCompleted);

    const updated = passStore.updateMission(id, updates);
    if (!updated) {
      return NextResponse.json({ error: "Missão não encontrada." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Missão atualizada com sucesso!",
      mission: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar missão." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID da missão é obrigatório." }, { status: 400 });
    }

    // 1. Try Supabase
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin.from("missions").delete().eq("id", id);
      if (!error) {
        passStore.deleteMission(id);
        return NextResponse.json({
          success: true,
          message: "Missão removida do Supabase com sucesso!",
        });
      }
    }

    // 2. Fallback to passStore
    const deleted = passStore.deleteMission(id);
    if (!deleted) {
      return NextResponse.json({ error: "Missão não encontrada." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Missão removida com sucesso!",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao excluir missão." },
      { status: 500 }
    );
  }
}
