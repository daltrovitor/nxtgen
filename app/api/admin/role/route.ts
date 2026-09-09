import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { userStore, verifySessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { z } from "zod";

const RoleUpdateSchema = z.object({
  emailOrId: z.string().min(1, "Identificador do usuário obrigatório"),
  newRole: z.enum(["user", "admin"]),
});

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    const { valid, payload } = verifySessionToken(token);
    if (!valid || !payload || payload.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores (role = 'admin') podem alterar papéis." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parseResult = RoleUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || "Dados inválidos." },
        { status: 400 }
      );
    }

    const { emailOrId, newRole } = parseResult.data;
    const updated = userStore.updateRole(emailOrId, newRole);

    if (!updated) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Papel do usuário ${updated.email} alterado com sucesso para '${updated.role}'!`,
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.fullName,
        role: updated.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar papel." },
      { status: 500 }
    );
  }
}
