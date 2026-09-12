"use client";

import React, { useState } from "react";
import { PassMission, PDF_MISSION_TEMPLATES, MissionVerificationType } from "@/lib/pass-data";
import { Plus, Edit2, Trash2, X, RefreshCw, Zap, CheckCircle2, Sparkles, Users, BookOpen } from "lucide-react";
import { useConfirmToast } from "@/components/ui/confirm-toast";

interface AdminMissionsTabProps {
  missions: PassMission[];
  onRefresh: () => Promise<void>;
}

export function AdminMissionsTab({ missions, onRefresh }: AdminMissionsTabProps) {
  const { confirmDelete, showToast } = useConfirmToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<PassMission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [xpReward, setXpReward] = useState(150);
  const [total, setTotal] = useState(1);
  const [progress, setProgress] = useState(0);
  const [verificationType, setVerificationType] = useState<MissionVerificationType>("referral");
  const [category, setCategory] = useState("Comunidade");

  const resetForm = () => {
    setEditingMission(null);
    setTitle("");
    setDescription("");
    setXpReward(150);
    setTotal(1);
    setProgress(0);
    setVerificationType("referral");
    setCategory("Comunidade");
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: PassMission) => {
    setEditingMission(m);
    setTitle(m.title);
    setDescription(m.description);
    setXpReward(m.xpReward);
    setTotal(m.total);
    setProgress(m.progress);
    setVerificationType(m.verificationType || "manual");
    setCategory(m.category || "NXTGEN");
    setIsModalOpen(true);
  };

  const handleApplyTemplate = (tmpl: (typeof PDF_MISSION_TEMPLATES)[0]) => {
    setEditingMission(null);
    setTitle(tmpl.title);
    setDescription(tmpl.description);
    setXpReward(tmpl.xpReward);
    setTotal(tmpl.total);
    setProgress(0);
    setVerificationType(tmpl.verificationType || "manual");
    setCategory(tmpl.category || "NXTGEN");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const payload = {
      title,
      description,
      xpReward: Number(xpReward),
      total: Number(total),
      progress: Number(progress),
      verificationType,
      category,
      isCompleted: Number(progress) >= Number(total),
    };

    try {
      const isEdit = !!editingMission;
      const url = "/api/admin/missions";
      const method = isEdit ? "PUT" : "POST";
      const bodyData = isEdit ? { id: editingMission.id, ...payload } : payload;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast("error", data.error || "Erro ao salvar missão.");
        setFeedback({ type: "error", text: data.error || "Erro ao salvar missão." });
        return;
      }

      showToast("success", isEdit ? "Missão atualizada com sucesso!" : "Nova missão criada com sucesso!");
      setFeedback({
        type: "success",
        text: isEdit ? "Missão atualizada com sucesso!" : "Nova missão criada com sucesso!",
      });

      await onRefresh();
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      showToast("error", err.message || "Erro de conexão.");
      setFeedback({ type: "error", text: err.message || "Erro de conexão." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    const confirmed = await confirmDelete({
      title: "Excluir Missão",
      message: `Tem certeza que deseja remover a missão "${title}"? Esta ação não pode ser desfeita.`,
      confirmText: "Sim, Excluir",
      cancelText: "Cancelar",
      type: "danger",
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/missions?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast("success", "Missão removida com sucesso.");
        setFeedback({ type: "success", text: "Missão removida com sucesso." });
        await onRefresh();
      } else {
        showToast("error", data.error || "Erro ao excluir missão.");
        setFeedback({ type: "error", text: data.error || "Erro ao excluir missão." });
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
          <h2 className="text-xl font-bold font-heading text-white">Missões e Tarefas de XP</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Configure tarefas para os membros realizarem no NXT PASS e ganharem pontos para subir de nível
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-colors cursor-pointer"
            title="Recarregar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B24F0] hover:bg-[#781DD6] text-white text-xs font-bold font-heading tracking-wide transition-all cursor-pointer shadow-lg shadow-[#8B24F0]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Nova Missão</span>
          </button>
        </div>
      </div>

      {/* Quick Templates from PDFs */}
      <div className="p-4 rounded-2xl bg-[#090A0F] border border-white/10 space-y-3">
        <div className="flex items-center gap-2 text-xs font-heading font-bold text-white">
          <BookOpen className="w-4 h-4 text-purple-400" />
          <span>Modelos Oficiais de Missões dos PDFs (1-Clique para Preencher)</span>
        </div>
        <p className="text-[11px] text-gray-400 font-heading">
          Clique em qualquer modelo oficial do ecossistema para abrir o formulário pré-configurado:
        </p>
        <div className="flex flex-wrap gap-2">
          {PDF_MISSION_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyTemplate(tmpl)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-purple-950/40 border border-white/10 hover:border-purple-500/40 text-xs text-gray-200 hover:text-white transition-all cursor-pointer font-heading"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>{tmpl.title}</span>
              <span className="text-[10px] font-mono text-purple-400 font-bold">+{tmpl.xpReward} XP</span>
            </button>
          ))}
        </div>
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

      {/* Missions Grid/List */}
      {missions.length === 0 ? (
        <div className="py-16 px-6 rounded-2xl bg-[#090A0F] border border-white/10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#8B24F0]">
            <Zap className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold font-heading text-white">Nenhuma missão cadastrada</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Nenhuma tarefa de XP foi criada ainda. Crie tarefas e desafios reais para os associados ganharem XP e subirem de nível.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B24F0] hover:bg-[#781DD6] text-white text-xs font-bold font-heading transition-colors cursor-pointer shadow-md shadow-[#8B24F0]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Primeira Missão</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {missions.map((m) => (
          <div
            key={m.id}
            className="p-4 rounded-2xl bg-[#090A0F] border border-white/10 flex flex-col justify-between space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-heading font-bold uppercase bg-white/5 border border-white/10 text-gray-400">
                    {m.category || "NXTGEN"}
                  </span>
                  <h3 className="font-semibold text-white font-heading text-sm">{m.title}</h3>
                  {m.isCompleted && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      Concluída
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">{m.description}</p>
                <div className="pt-1">
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-500/20">
                    Verificação: {m.verificationType || "manual"}
                  </span>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#8B24F0]/20 border border-[#8B24F0]/40 text-[#C084FC] font-mono font-bold text-xs shrink-0">
                <Zap className="w-3 h-3" />
                +{m.xpReward} XP
              </span>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="flex justify-between text-[11px] font-mono text-gray-400">
                <span>Meta / Passos necessários:</span>
                <span className="text-white font-bold">
                  {m.total}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => handleOpenEdit(m)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Editar</span>
              </button>

              <button
                onClick={() => handleDelete(m.id, m.title)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-xs font-mono text-red-400 hover:text-red-300 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Excluir</span>
              </button>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* MODAL: Create / Edit Mission */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#090A0F] border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-bold font-heading text-white">
                  {editingMission ? "Editar Missão" : "Criar Nova Missão"}
                </h3>
                <p className="text-xs text-gray-400">
                  Defina o objetivo, recompensa em XP e o método de validação
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-300">Título da Missão *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Convidar 1 Amigo para o NXTGEN"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#030407] border border-white/10 text-xs text-white focus:border-[#8B24F0] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-300">Descrição Detalhada *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ex: Convide um amigo e peça para ele inserir seu ID no dashboard dele."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#030407] border border-white/10 text-xs text-white focus:border-[#8B24F0] focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-300">Categoria *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#030407] border border-white/10 text-xs text-white focus:border-[#8B24F0] focus:outline-none"
                  >
                    <option value="Comunidade">Comunidade</option>
                    <option value="NXT PASS">NXT PASS</option>
                    <option value="NXT FOUNDERS">NXT FOUNDERS</option>
                    <option value="NXT LIVE">NXT LIVE / RUN</option>
                    <option value="NXT BANK">NXT BANK</option>
                    <option value="NXT CIRCLE">NXT CIRCLE</option>
                    <option value="NXT LEVEL">NXT LEVEL</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-300">Tipo de Verificação *</label>
                  <select
                    value={verificationType}
                    onChange={(e) => setVerificationType(e.target.value as MissionVerificationType)}
                    className="w-full px-3 py-2 rounded-xl bg-[#030407] border border-white/10 text-xs text-white focus:border-[#8B24F0] focus:outline-none font-mono"
                  >
                    <option value="referral">referral (ID de Amigo)</option>
                    <option value="benefit_redeem">benefit_redeem (Voucher)</option>
                    <option value="founders_pitch">founders_pitch (Founders)</option>
                    <option value="run_signup">run_signup (NXT RUN)</option>
                    <option value="bank_pix">bank_pix (Chave Pix)</option>
                    <option value="circle_connect">circle_connect (Unplug)</option>
                    <option value="manual">manual (Validação Direta)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-300">Recompensa (XP) *</label>
                  <input
                    type="number"
                    required
                    min={10}
                    step={10}
                    placeholder="Ex: 250"
                    value={xpReward}
                    onChange={(e) => setXpReward(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#030407] border border-white/10 text-xs text-white font-mono focus:border-[#8B24F0] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-300">Meta (Passos) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={total}
                    onChange={(e) => setTotal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#030407] border border-white/10 text-xs text-white font-mono focus:border-[#8B24F0] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#8B24F0] hover:bg-[#781DD6] disabled:opacity-50 text-white text-xs font-bold font-heading transition-colors cursor-pointer shadow-lg shadow-[#8B24F0]/20"
                >
                  {isSubmitting ? "Salvando..." : editingMission ? "Salvar Alterações" : "Criar Missão"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
