"use client";

import React, { useState } from "react";
import { UserCheck, Edit3, Ticket, Check, X, Shield, RefreshCw } from "lucide-react";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  nxtScore: number;
  nxtLevel: number;
  walletBalance: number;
  createdAt: string;
  vouchersCount: number;
  vouchers: any[];
}

interface AdminMembersTabProps {
  users: AdminUser[];
  onRefresh: () => Promise<void>;
}

export function AdminMembersTab({ users, onRefresh }: AdminMembersTabProps) {
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [selectedUserVouchers, setSelectedUserVouchers] = useState<AdminUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states for editing
  const [formLevel, setFormLevel] = useState<number>(1);
  const [formScore, setFormScore] = useState<number>(0);
  const [formBalance, setFormBalance] = useState<number>(0);
  const [formRole, setFormRole] = useState<"user" | "admin">("user");

  const handleOpenEdit = (u: AdminUser) => {
    setEditingUser(u);
    setFormLevel(u.nxtLevel);
    setFormScore(u.nxtScore);
    setFormBalance(u.walletBalance);
    setFormRole(u.role);
    setFeedback(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser.id,
          nxtLevel: formLevel,
          nxtScore: formScore,
          walletBalance: formBalance,
          role: formRole,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: "error", text: data.error || "Erro ao atualizar membro." });
        return;
      }

      setFeedback({
        type: "success",
        text: `Membro ${editingUser.name} atualizado para Level ${formLevel} e ${formScore} XP com sucesso!`,
      });

      await onRefresh();
      setEditingUser(null);
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Falha na requisição." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleVoucherStatus = async (voucherId: string, currentStatus: string) => {
    const newStatus = currentStatus === "valid" ? "used" : "valid";
    try {
      const res = await fetch("/api/admin/vouchers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: voucherId, status: newStatus }),
      });
      if (res.ok) {
        await onRefresh();
        // Update current drawer view
        if (selectedUserVouchers) {
          setSelectedUserVouchers((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              vouchers: prev.vouchers.map((v) =>
                v.id === voucherId ? { ...v, status: newStatus } : v
              ),
            };
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-white">Membros do NXT PASS</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Visualize os membros ativos, altere seus níveis (1-10), pontuações de XP e gerencie vouchers resgatados
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-gray-300 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Atualizar Membros</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
              : "bg-red-950/40 border-red-500/30 text-red-300"
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-[#090A0F] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-gray-400 font-mono">
                <th className="py-3 px-4">Membro</th>
                <th className="py-3 px-4">Papel (Role)</th>
                <th className="py-3 px-4">Nível NXT</th>
                <th className="py-3 px-4">XP Acumulado</th>
                <th className="py-3 px-4">Saldo Carteira</th>
                <th className="py-3 px-4">Vouchers</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white font-heading">{u.name}</div>
                    <div className="text-[11px] text-gray-400 font-mono">{u.email}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                        u.role === "admin"
                          ? "bg-[#8B24F0]/20 text-[#C084FC] border border-[#8B24F0]/40"
                          : "bg-white/5 text-gray-300 border border-white/10"
                      }`}
                    >
                      {u.role === "admin" && <Shield className="w-3 h-3" />}
                      {u.role}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-[#8B24F0]/15 border border-[#8B24F0]/30 text-white font-bold">
                      LVL {u.nxtLevel}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-gray-300">
                    <span className="text-[#C084FC] font-bold">{u.nxtScore.toLocaleString()}</span> XP
                  </td>

                  <td className="py-3.5 px-4 font-mono text-gray-300">
                    R$ {Number(u.walletBalance || 0).toFixed(2)}
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => setSelectedUserVouchers(u)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-mono text-[11px] transition-colors cursor-pointer"
                    >
                      <Ticket className="w-3.5 h-3.5 text-[#8B24F0]" />
                      <span>{u.vouchersCount || (u.vouchers?.length ?? 0)} resgates</span>
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8B24F0] hover:bg-[#781DD6] text-white text-xs font-semibold font-heading tracking-wide transition-all cursor-pointer shadow-md shadow-[#8B24F0]/20"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Alterar Level</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Edit Member Level & XP */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#090A0F] border border-white/15 rounded-2xl p-6 shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-bold font-heading text-white">
                  Alterar Membro
                </h3>
                <p className="text-xs text-gray-400">{editingUser.name} ({editingUser.email})</p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Level Selector */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-300">
                  NXT Level (Nível do Membro)
                </label>
                <select
                  value={formLevel}
                  onChange={(e) => setFormLevel(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#030407] border border-white/10 text-sm text-white font-mono focus:border-[#8B24F0] focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                    <option key={lvl} value={lvl} className="bg-[#090A0F] text-white">
                      Level {lvl} {lvl === 1 ? "(Iniciante)" : lvl >= 5 ? "(Elite/Black)" : "(Avançado)"}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-500">
                  Ao alterar o nível, os benefícios liberados no dashboard do usuário mudam instantaneamente.
                </p>
              </div>

              {/* XP Score */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-300">
                  Pontuação de XP (nxtScore)
                </label>
                <input
                  type="number"
                  value={formScore}
                  onChange={(e) => setFormScore(Number(e.target.value))}
                  min={0}
                  step={50}
                  className="w-full px-3 py-2 rounded-xl bg-[#030407] border border-white/10 text-sm text-white font-mono focus:border-[#8B24F0] focus:outline-none"
                />
              </div>

              {/* Wallet Balance */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-300">
                  Saldo em Carteira (R$)
                </label>
                <input
                  type="number"
                  value={formBalance}
                  onChange={(e) => setFormBalance(Number(e.target.value))}
                  min={0}
                  step={0.5}
                  className="w-full px-3 py-2 rounded-xl bg-[#030407] border border-white/10 text-sm text-white font-mono focus:border-[#8B24F0] focus:outline-none"
                />
              </div>

              {/* Role */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-300">
                  Papel de Acesso (Role)
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as "user" | "admin")}
                  className="w-full px-3 py-2 rounded-xl bg-[#030407] border border-white/10 text-sm text-white font-mono focus:border-[#8B24F0] focus:outline-none"
                >
                  <option value="user" className="bg-[#090A0F] text-white">Usuário Comum (user)</option>
                  <option value="admin" className="bg-[#090A0F] text-white">Administrador (admin)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-300 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-[#8B24F0] hover:bg-[#781DD6] disabled:opacity-50 text-xs font-bold font-heading text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSaving ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER/MODAL: Member Vouchers Inspector */}
      {selectedUserVouchers && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#090A0F] border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4 text-left max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-bold font-heading text-white">
                  Vouchers de {selectedUserVouchers.name}
                </h3>
                <p className="text-xs text-gray-400">{selectedUserVouchers.email}</p>
              </div>
              <button
                onClick={() => setSelectedUserVouchers(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {(!selectedUserVouchers.vouchers || selectedUserVouchers.vouchers.length === 0) ? (
                <p className="text-xs text-gray-400 py-6 text-center">
                  Este membro ainda não resgatou nenhum voucher.
                </p>
              ) : (
                selectedUserVouchers.vouchers.map((v) => (
                  <div
                    key={v.id}
                    className="p-3.5 rounded-xl bg-[#030407] border border-white/10 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-mono text-xs font-bold text-white tracking-wider">
                        {v.code}
                      </div>
                      <div className="text-xs text-gray-300 font-medium mt-0.5">
                        {v.partnerName} • {v.benefitTitle || v.discountLabel}
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                        Resgatado em: {v.redeemedAt}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase ${
                          v.status === "valid"
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                            : "bg-gray-800 text-gray-400 border border-gray-700"
                        }`}
                      >
                        {v.status === "valid" ? "Válido" : "Utilizado"}
                      </span>

                      <button
                        onClick={() => handleToggleVoucherStatus(v.id, v.status)}
                        className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[11px] font-mono text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                        title="Alternar entre Válido e Utilizado"
                      >
                        {v.status === "valid" ? "Validar" : "Reativar"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-white/10 text-right">
              <button
                onClick={() => setSelectedUserVouchers(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-mono text-white transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
