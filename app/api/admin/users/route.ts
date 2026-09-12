import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { userStore, verifySessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { passStore } from "@/lib/pass-store";

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

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    // 1. Try querying Supabase public.profiles for real registered members
    let users: any[] = [];
    try {
      const { supabaseAdmin } = await import("@/lib/supabase/client");
      if (supabaseAdmin) {
        const { data: dbProfiles, error } = await supabaseAdmin
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && dbProfiles && dbProfiles.length > 0) {
          users = dbProfiles.map((p) => {
            const userVouchers = passStore.getUserVouchers(p.id);
            return {
              id: p.id,
              email: p.email,
              name: p.full_name || p.name || p.email.split("@")[0],
              role: p.role || "user",
              nxtScore: p.nxt_score ?? 250,
              nxtLevel: p.nxt_level ?? 1,
              walletBalance: Number(p.wallet_balance || 0),
              createdAt: p.created_at,
              vouchersCount: userVouchers.length,
              vouchers: userVouchers,
            };
          });
        }
      }
    } catch (e) {
      console.warn("Supabase profiles query error:", e);
    }

    // 2. Fallback to userStore only if Supabase has no records
    if (users.length === 0) {
      const allUsers = userStore.getAllUsers();
      users = allUsers.map((u) => {
        const userVouchers = passStore.getUserVouchers(u.id);
        return {
          id: u.id,
          email: u.email,
          name: u.fullName,
          role: u.role,
          nxtScore: u.nxtScore,
          nxtLevel: u.nxtLevel,
          walletBalance: u.walletBalance,
          createdAt: u.createdAt,
          vouchersCount: userVouchers.length,
          vouchers: userVouchers,
        };
      });
    }

    return NextResponse.json({
      success: true,
      currentUserRole: auth.adminUser?.role,
      users,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao consultar usuários." },
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
    const { id, email, nxtLevel, nxtScore, role, walletBalance } = body;

    const targetKey = id || email;
    if (!targetKey) {
      return NextResponse.json(
        { error: "Informe o ID ou e-mail do usuário para atualizar." },
        { status: 400 }
      );
    }

    // Update in userStore
    const updated = userStore.updateUser(targetKey, {
      nxtLevel: nxtLevel !== undefined ? Number(nxtLevel) : undefined,
      nxtScore: nxtScore !== undefined ? Number(nxtScore) : undefined,
      role: role !== undefined ? role : undefined,
      walletBalance: walletBalance !== undefined ? Number(walletBalance) : undefined,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    // Try updating Supabase public.profiles if connected
    try {
      const { supabaseAdmin } = await import("@/lib/supabase/client");
      if (supabaseAdmin) {
        const updatePayload: Record<string, any> = {};
        if (nxtLevel !== undefined) updatePayload.nxt_level = Number(nxtLevel);
        if (nxtScore !== undefined) updatePayload.nxt_score = Number(nxtScore);
        if (role !== undefined) updatePayload.role = role;
        if (walletBalance !== undefined) updatePayload.wallet_balance = Number(walletBalance);

        if (Object.keys(updatePayload).length > 0) {
          await supabaseAdmin
            .from("profiles")
            .update(updatePayload)
            .or(`id.eq.${updated.id},email.eq.${updated.email}`);
        }
      }
    } catch (e) {
      console.warn("Supabase update notice:", e);
    }

    return NextResponse.json({
      success: true,
      message: `Dados do membro ${updated.fullName} atualizados com sucesso!`,
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.fullName,
        role: updated.role,
        nxtLevel: updated.nxtLevel,
        nxtScore: updated.nxtScore,
        walletBalance: updated.walletBalance,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar dados do membro." },
      { status: 500 }
    );
  }
}
