"use client";

import React, { useState, useMemo } from "react";
import { SystemVoucher } from "@/lib/pass-store";
import { Ticket, CheckCircle2, RotateCcw, Trash2, Search, RefreshCw, X } from "lucide-react";
import { useConfirmToast } from "@/components/ui/confirm-toast";

interface AdminVouchersTabProps {
  vouchers: SystemVoucher[];
  onRefresh: () => Promise<void>;
}

export function AdminVouchersTab({ vouchers, onRefresh }: AdminVouchersTabProps) {
  const { confirmDelete, showToast } = useConfirmToast();
  const [filterStatus, setFilterStatus] = useState<"all" | "valid" | "used">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const filteredVouchers = useMemo(() => {
    return vouchers.filter((v) => {
      if (filterStatus !== "all" && v.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCode = v.code.toLowerCase().includes(q);
        const matchPartner = v.partnerName.toLowerCase().includes(q);
        const matchUser = (v.userName || "").toLowerCase().includes(q) || (v.userEmail || "").toLowerCase().includes(q);
        const matchBenefit = (v.benefitTitle || "").toLowerCase().includes(q);
        if (!matchCode && !matchPartner && !matchUser && !matchBenefit) return false;
      }
      return true;
    });
  }, [vouchers, filterStatus, searchQuery]);

  const handleToggleStatus = async (voucher: SystemVoucher) => {
    const newStatus = voucher.status === "valid" ? "used" : "valid";
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/vouchers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: voucher.id, status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: "error", text: data.error || "Erro ao alterar voucher." });
        return;
      }

      setFeedback({
        type: "success",
        text: `Voucher ${voucher.code} alterado para '${newStatus === "used" ? "Utilizado" : "Válido"}' com sucesso!`,
      });
      await onRefresh();
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Erro de conexão." });
    }
  };

  const handleDelete = async (id: string, code: string) => {
    const confirmed = await confirmDelete({
      title: "Revogar Voucher",
      message: `Deseja realmente revogar permanentemente o voucher "${code}"? Essa ação não pode ser desfeita.`,
      confirmText: "Sim, Revogar",
      cancelText: "Cancelar",
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/vouchers?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("success", `Voucher ${code} revogado com sucesso.`);
        setFeedback({ type: "success", text: `Voucher ${code} revogado.` });
        await onRefresh();
      } else {
        showToast("error", data.error || "Erro ao revogar voucher.");
        setFeedback({ type: "error", text: data.error || "Erro ao revogar." });
      }
    } catch (err: any) {
      showToast("error", err.message || "Erro de conexão.");
      setFeedback({ type: "error", text: err.message || "Erro de conexão." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-white">Vouchers Resgatados (Auditoria & Validação)</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Monitore em tempo real todos os benefícios resgatados pelos membros e valide ou reverta o uso no caixa
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-gray-300 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Atualizar Vouchers</span>
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

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por código, membro, parceiro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#090A0F] border border-white/10 text-xs text-white placeholder-gray-500 focus:border-[#8B24F0] focus:outline-none"
          />
        </div>

        <div className="flex gap-1.5 p-1 rounded-xl bg-[#090A0F] border border-white/10">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              filterStatus === "all" ? "bg-[#8B24F0] text-white font-bold" : "text-gray-400 hover:text-white"
            }`}
          >
            Todos ({vouchers.length})
          </button>
          <button
            onClick={() => setFilterStatus("valid")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              filterStatus === "valid" ? "bg-[#8B24F0] text-white font-bold" : "text-gray-400 hover:text-white"
            }`}
          >
            Válidos ({vouchers.filter((v) => v.status === "valid").length})
          </button>
          <button
            onClick={() => setFilterStatus("used")}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
              filterStatus === "used" ? "bg-[#8B24F0] text-white font-bold" : "text-gray-400 hover:text-white"
            }`}
          >
            Utilizados ({vouchers.filter((v) => v.status === "used").length})
          </button>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-[#090A0F] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-gray-400 font-mono">
                <th className="py-3 px-4">Código Único</th>
                <th className="py-3 px-4">Membro</th>
                <th className="py-3 px-4">Parceiro & Oferta</th>
                <th className="py-3 px-4">Data de Resgate</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ação / Validação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-200">
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 font-mono">
                    Nenhum voucher encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredVouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-white tracking-wider flex items-center gap-1.5">
                        <Ticket className="w-3.5 h-3.5 text-[#8B24F0]" />
                        <span>{v.code}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white font-heading">
                        {v.userName || "Rafael Molina"}
                      </div>
                      <div className="text-[11px] text-gray-400 font-mono">
                        {v.userEmail || "rafael.molina@nxtgen.app"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white">{v.partnerName}</div>
                      <div className="text-[11px] text-[#C084FC] font-mono">
                        {v.benefitTitle || v.discountLabel}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-gray-400">
                      {v.redeemedAt}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                          v.status === "valid"
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                            : "bg-gray-800/80 text-gray-400 border border-gray-700"
                        }`}
                      >
                        {v.status === "valid" ? "Válido" : "Utilizado"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(v)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                            v.status === "valid"
                              ? "bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm"
                              : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
                          }`}
                          title={v.status === "valid" ? "Marcar como utilizado no caixa" : "Reativar voucher"}
                        >
                          {v.status === "valid" ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Validar Uso</span>
                            </>
                          ) : (
                            <>
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Reverter</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleDelete(v.id, v.code)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                          title="Revogar voucher"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
