"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  UserCheck,
  Lock,
  ArrowLeft,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertTriangle,
  Key,
} from "lucide-react";

interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  nxtScore: number;
  nxtLevel: number;
  walletBalance: number;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [usersList, setUsersList] = useState<AdminUserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok && data.users) {
        setUsersList(data.users);
      } else {
        setFeedbackMsg({ type: "error", text: data.error || "Erro ao listar usuários." });
      }
    } catch {
      setFeedbackMsg({ type: "error", text: "Falha na requisição ao servidor." });
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchUsers();
    }
  }, [user]);

  const handleRoleToggle = async (targetEmail: string, currentRole: "user" | "admin") => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    setUpdatingUser(targetEmail);
    setFeedbackMsg(null);

    try {
      const res = await fetch("/api/admin/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrId: targetEmail, newRole }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setFeedbackMsg({
          type: "success",
          text: `Papel de ${targetEmail} alterado para '${newRole}' com sucesso!`,
        });
        await fetchUsers();
      } else {
        setFeedbackMsg({
          type: "error",
          text: data.error || "Falha ao alterar papel.",
        });
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: "error",
        text: err.message || "Erro de conexão ao alterar papel.",
      });
    } finally {
      setUpdatingUser(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center text-white font-mono space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
        <p className="text-sm text-gray-400">Verificando credenciais e coluna &apos;role&apos;...</p>
      </div>
    );
  }

  // ===========================================================================
  // 1. NÃO AUTENTICADO
  // ===========================================================================
  if (!user) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-6 text-white font-mono">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#0A0D18] border border-red-500/30 text-center space-y-6 shadow-[0_0_50px_rgba(239,68,68,0.15)]">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/40 mx-auto flex items-center justify-center text-red-400">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold font-heading text-white">Autenticação Necessária</h1>
            <p className="text-xs text-gray-400 font-sans">
              Você precisa estar autenticado para acessar a área administrativa.
            </p>
          </div>
          <Link
            href="/#secao-login"
            className="w-full inline-flex items-center justify-center py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-sm transition-all cursor-pointer"
          >
            Fazer Login no NXTGEN
          </Link>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // 2. AUTENTICADO COMO 'user' (BLOQUEIO 403 COM VERIFICAÇÃO EXPLÍCITA DA ROLE)
  // ===========================================================================
  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-6 text-white">
        <div className="max-w-lg w-full p-8 sm:p-10 rounded-3xl bg-[#090A12] border border-amber-500/40 text-center space-y-6 shadow-[0_0_60px_rgba(245,158,11,0.15)] relative overflow-hidden">
          {/* Ambient Amber Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/40 mx-auto flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono tracking-widest uppercase text-amber-300">
              ACESSO RESTRITO • ROLE = &apos;{user.role}&apos;
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white">
              Acesso Negado (403 Forbidden)
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 font-sans">
              A verificação da coluna <code className="text-purple-300 font-mono bg-purple-950/60 px-1.5 py-0.5 rounded">role</code> identificou seu usuário como <b className="text-amber-400">&apos;{user.role}&apos;</b>.
              Este dashboard é exclusivo para contas configuradas com <code className="text-emerald-300 font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded">role = &apos;admin&apos;</code>.
            </p>
          </div>

          {/* User Details Snapshot */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left font-mono text-xs space-y-2">
            <div className="flex justify-between text-gray-400">
              <span>Usuário:</span>
              <span className="text-white">{user.name}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>E-mail:</span>
              <span className="text-white">{user.email}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Coluna &apos;role&apos;:</span>
              <span className="text-amber-400 font-bold uppercase">{user.role}</span>
            </div>
          </div>

          {/* SQL Snippet to promote user */}
          <div className="p-4 rounded-2xl bg-black/60 border border-purple-500/30 text-left space-y-2">
            <p className="text-[11px] font-mono text-purple-300 font-semibold flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              Como liberar acesso a esta conta no PostgreSQL/Supabase:
            </p>
            <pre className="text-[10px] font-mono text-gray-300 bg-white/5 p-2.5 rounded-lg overflow-x-auto select-all">
              {`UPDATE public.profiles\nSET role = 'admin'\nWHERE email = '${user.email}';`}
            </pre>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/"
              className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Site</span>
            </Link>
            <Link
              href="/#secao-login"
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:brightness-110 text-white font-mono text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Key className="w-4 h-4" />
              <span>Entrar com Conta Admin</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // 3. AUTENTICADO COMO 'admin' (DASHBOARD ADMINISTRATIVO COMPLETO)
  // ===========================================================================
  const totalUsers = usersList.length;
  const adminCount = usersList.filter((u) => u.role === "admin").length;
  const normalUserCount = usersList.filter((u) => u.role === "user").length;

  return (
    <div className="min-h-screen bg-[#000000] text-[#F3F4F6] pb-20">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-[#08090E]/90 backdrop-blur-md px-6 sm:px-12 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="hover:opacity-90 transition-opacity">
              <Image
                src="/logonxtgen.png"
                alt="NXTGEN"
                width={2065}
                height={762}
                priority
                className="h-10 sm:h-12 w-auto object-contain"
                style={{ width: "auto" }}
              />
            </Link>
            <span className="hidden sm:inline-block px-2.5 py-1 rounded-md bg-purple-950/80 border border-purple-500/40 text-[10px] font-mono tracking-widest text-purple-300 font-bold uppercase">
              ADMIN CONSOLE
            </span>
          </div>

          <div className="flex items-center space-x-4 font-mono text-xs">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-bold">ROLE: ADMIN</span>
            </div>
            <Link
              href="/"
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ver Site</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 pt-8 space-y-8">
        
        {/* Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/40 via-violet-950/30 to-black border border-purple-500/30 shadow-[0_0_50px_rgba(139,92,246,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono tracking-[0.25em] text-cyan-400 font-semibold uppercase">
              Painel de Controle de Segurança
            </span>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white mt-1">
              Gerenciamento de Papéis (RBAC)
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 font-sans mt-1 max-w-2xl">
              Usuários cadastrados recebem automaticamente o papel <code className="text-white font-mono bg-white/10 px-1 py-0.5 rounded">role = &apos;user&apos;</code>.
              Você pode promover ou revogar permissões de <code className="text-emerald-400 font-mono bg-emerald-950/60 px-1 py-0.5 rounded">role = &apos;admin&apos;</code> instantaneamente.
            </p>
          </div>
          <button
            onClick={fetchUsers}
            disabled={loadingUsers}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-xs flex items-center space-x-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? "animate-spin text-cyan-400" : ""}`} />
            <span>Atualizar Dados</span>
          </button>
        </div>

        {/* Feedback Message */}
        {feedbackMsg && (
          <div
            className={`p-4 rounded-2xl text-xs font-mono flex items-center space-x-3 border ${
              feedbackMsg.type === "success"
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                : "bg-red-950/60 border-red-500/40 text-red-300"
            }`}
          >
            {feedbackMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#090A12] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-mono uppercase">Total de Contas</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-3xl font-heading font-extrabold text-white">{totalUsers}</p>
            <p className="text-[11px] font-mono text-gray-500">Registrados na base</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#090A12] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-mono uppercase">Usuários Comuns</span>
              <UserCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-3xl font-heading font-extrabold text-cyan-400">{normalUserCount}</p>
            <p className="text-[11px] font-mono text-gray-500">role = &apos;user&apos; (padrão)</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#090A12] border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-mono uppercase">Administradores</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-heading font-extrabold text-emerald-400">{adminCount}</p>
            <p className="text-[11px] font-mono text-emerald-500/80">role = &apos;admin&apos; (acesso liberado)</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#090A12] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-mono uppercase">Status RLS</span>
              <Database className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-xl font-heading font-bold text-white flex items-center gap-1.5 pt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              ATIVO & PROTEGIDO
            </p>
            <p className="text-[11px] font-mono text-gray-500">PostgreSQL Row Level Security</p>
          </div>
        </div>

        {/* User Management Table */}
        <div className="rounded-3xl bg-[#090A12] border border-white/10 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold font-heading text-white">Tabela de Perfis & Papéis</h2>
              <p className="text-xs text-gray-400 font-sans">
                Altere a coluna <code className="text-purple-300 font-mono">role</code> de qualquer usuário diretamente pelos botões de ação abaixo:
              </p>
            </div>
            <div className="text-xs font-mono text-gray-400">
              Mostrando {usersList.length} usuários
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white/5 text-gray-400 uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-6">Nome / E-mail</th>
                  <th className="py-3.5 px-6">Coluna &apos;role&apos;</th>
                  <th className="py-3.5 px-6">Nível NXT</th>
                  <th className="py-3.5 px-6">XP Pontos</th>
                  <th className="py-3.5 px-6 text-right">Ação de Permissão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {usersList.map((u) => {
                  const isAdmin = u.role === "admin";
                  const isBusy = updatingUser === u.email;

                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 space-y-0.5">
                        <p className="font-bold text-white font-sans text-sm">{u.name}</p>
                        <p className="text-gray-400 text-xs">{u.email}</p>
                      </td>
                      <td className="py-4 px-6">
                        {isAdmin ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>admin</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                            <UserCheck className="w-3.5 h-3.5 text-gray-400" />
                            <span>user</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-gray-300">
                        Nível {u.nxtLevel}
                      </td>
                      <td className="py-4 px-6 text-cyan-400 font-bold">
                        {u.nxtScore} XP
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleRoleToggle(u.email, u.role)}
                          disabled={isBusy || (u.email === user.email && isAdmin)}
                          title={
                            u.email === user.email && isAdmin
                              ? "Você não pode revogar seu próprio papel de admin nesta sessão"
                              : `Alterar papel para ${isAdmin ? "user" : "admin"}`
                          }
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                            isAdmin
                              ? "bg-red-950/50 hover:bg-red-900/60 border border-red-500/40 text-red-300"
                              : "bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                          }`}
                        >
                          {isBusy ? (
                            <span className="inline-flex items-center space-x-1">
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>Atualizando...</span>
                            </span>
                          ) : isAdmin ? (
                            "Rebaixar para 'user'"
                          ) : (
                            "Promover para 'admin'"
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SQL Script Quick-Access */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#090A12] border border-white/10 space-y-4">
          <div className="flex items-center space-x-3">
            <Database className="w-5 h-5 text-purple-400" />
            <h3 className="font-heading text-lg font-bold text-white">
              Comandos SQL do Supabase para Gestão da Coluna &apos;role&apos;
            </h3>
          </div>
          <p className="text-xs text-gray-400 font-sans">
            O arquivo oficial de migração está salvo em <code className="text-purple-300 font-mono">supabase/schema-auth-roles.sql</code>.
            Você também pode colar as queries abaixo no SQL Editor do Supabase para alterar o papel diretamente no banco:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
              <p className="text-xs font-mono font-bold text-emerald-400">
                1. Promover qualquer e-mail para &apos;admin&apos;:
              </p>
              <pre className="text-[11px] font-mono text-gray-300 bg-white/5 p-3 rounded-xl overflow-x-auto select-all">
                {`UPDATE public.profiles\nSET role = 'admin'\nWHERE email = 'seu_email@exemplo.com';`}
              </pre>
            </div>
            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2">
              <p className="text-xs font-mono font-bold text-amber-400">
                2. Reverter qualquer e-mail para usuário normal &apos;user&apos;:
              </p>
              <pre className="text-[11px] font-mono text-gray-300 bg-white/5 p-3 rounded-xl overflow-x-auto select-all">
                {`UPDATE public.profiles\nSET role = 'user'\nWHERE email = 'seu_email@exemplo.com';`}
              </pre>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
