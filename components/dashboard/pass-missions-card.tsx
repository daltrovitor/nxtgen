"use client";

import React, { useState } from "react";
import { PassMission } from "@/lib/pass-data";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  Users,
  Compass,
  Flame,
} from "lucide-react";
import confetti from "canvas-confetti";

interface PassMissionsCardProps {
  missions: PassMission[];
  userId?: string;
  onMissionUpdate?: () => Promise<void>;
  onScoreChange?: (newScore: number, newLevel: number) => void;
}

type TabType = "all" | "in_progress" | "available" | "completed";

export function PassMissionsCard({
  missions,
  userId,
  onMissionUpdate,
  onScoreChange,
}: PassMissionsCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [loadingMissionId, setLoadingMissionId] = useState<string | null>(null);
  const [verifyingMissionId, setVerifyingMissionId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [messageNotice, setMessageNotice] = useState<{ id: string; text: string; success: boolean } | null>(null);

  const handleCopyId = async () => {
    if (!userId) return;
    try {
      await navigator.clipboard.writeText(userId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {}
  };

  const handleAcceptMission = async (missionId: string) => {
    setLoadingMissionId(missionId);
    setMessageNotice(null);
    try {
      const res = await fetch("/api/pass/missions/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessageNotice({
          id: missionId,
          text: `Missão aceita! Inicie as etapas para subir de nível.`,
          success: true,
        });
        if (onMissionUpdate) await onMissionUpdate();
      } else {
        setMessageNotice({
          id: missionId,
          text: data.error || "Erro ao aceitar missão.",
          success: false,
        });
      }
    } catch (err: any) {
      setMessageNotice({
        id: missionId,
        text: err.message || "Erro de conexão.",
        success: false,
      });
    } finally {
      setLoadingMissionId(null);
    }
  };

  const handleVerifyMission = async (missionId: string) => {
    setVerifyingMissionId(missionId);
    setMessageNotice(null);
    try {
      const res = await fetch("/api/pass/missions/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missionId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessageNotice({
          id: missionId,
          text: data.message || "Missão resolvida!",
          success: data.completed,
        });

        if (data.completed) {
          try {
            confetti({
              particleCount: 90,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#8B24F0", "#00F5FF", "#10B981", "#F59E0B"],
            });
          } catch {}

          if (onScoreChange && data.currentUser) {
            onScoreChange(data.currentUser.nxtScore, data.currentUser.nxtLevel);
          }
        }

        if (onMissionUpdate) await onMissionUpdate();
      } else {
        setMessageNotice({
          id: missionId,
          text: data.error || "Ainda faltam etapas para resolver esta missão.",
          success: false,
        });
      }
    } catch (err: any) {
      setMessageNotice({
        id: missionId,
        text: err.message || "Erro de conexão ao verificar missão.",
        success: false,
      });
    } finally {
      setVerifyingMissionId(null);
    }
  };

  // Counts
  const inProgressMissions = missions.filter((m) => m.isAccepted && !m.isCompleted);
  const availableMissions = missions.filter((m) => !m.isAccepted && !m.isCompleted);
  const completedMissions = missions.filter((m) => m.isCompleted);

  const filteredMissions = missions.filter((m) => {
    if (activeTab === "in_progress") return m.isAccepted && !m.isCompleted;
    if (activeTab === "available") return !m.isAccepted && !m.isCompleted;
    if (activeTab === "completed") return m.isCompleted;
    return true;
  });

  return (
    <div className="space-y-4 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold font-heading text-foreground">
              Missões do Passe
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#8B24F0]/20 text-purple-300 border border-[#8B24F0]/30">
              NXT SCORE
            </span>
          </div>
          <p className="text-xs font-heading text-muted-foreground mt-0.5">
            Complete tarefas baseadas no ecossistema NXTGEN para acumular XP e desbloquear novos níveis
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-card border border-border self-start sm:self-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-heading font-medium transition-colors cursor-pointer ${
              activeTab === "all"
                ? "bg-[#8B24F0] text-white font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Todas ({missions.length})
          </button>
          <button
            onClick={() => setActiveTab("in_progress")}
            className={`px-3 py-1.5 rounded-lg text-xs font-heading font-medium transition-colors cursor-pointer ${
              activeTab === "in_progress"
                ? "bg-[#8B24F0] text-white font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Em Andamento ({inProgressMissions.length})
          </button>
          <button
            onClick={() => setActiveTab("available")}
            className={`px-3 py-1.5 rounded-lg text-xs font-heading font-medium transition-colors cursor-pointer ${
              activeTab === "available"
                ? "bg-[#8B24F0] text-white font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Disponíveis ({availableMissions.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-3 py-1.5 rounded-lg text-xs font-heading font-medium transition-colors cursor-pointer ${
              activeTab === "completed"
                ? "bg-[#8B24F0] text-white font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Concluídas ({completedMissions.length})
          </button>
        </div>
      </div>

      {/* Grid */}
      {filteredMissions.length === 0 ? (
        <div className="p-8 rounded-2xl bg-card border border-border text-center space-y-2">
          <p className="text-sm font-heading font-semibold text-foreground">
            {activeTab === "in_progress"
              ? "Você não tem missões em andamento. Acesse a aba 'Disponíveis' e aceite um desafio!"
              : activeTab === "completed"
              ? "Nenhuma missão concluída ainda. Aceite e verifique tarefas para receber XP!"
              : "Nenhuma missão encontrada nesta categoria."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMissions.map((m) => {
            const percent = Math.min(100, Math.round((m.progress / m.total) * 100));
            const isReferral =
              m.verificationType === "referral" ||
              m.title.toLowerCase().includes("convidar") ||
              m.title.toLowerCase().includes("amigo");
            const notice = messageNotice?.id === m.id ? messageNotice : null;

            return (
              <div
                key={m.id}
                className={`p-4 sm:p-5 rounded-2xl bg-card border transition-all duration-200 flex flex-col justify-between space-y-3.5 ${
                  m.isCompleted
                    ? "border-emerald-500/30 bg-emerald-950/10"
                    : m.isAccepted
                    ? "border-[#8B24F0]/40 shadow-lg shadow-[#8B24F0]/5"
                    : "border-border hover:border-[#8B24F0]/30"
                }`}
              >
                {/* Top: Category & XP */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-heading font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-gray-300">
                      {m.category || (isReferral ? "Comunidade" : "NXTGEN")}
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-purple-400 bg-purple-950/40 border border-purple-500/30 px-2 py-0.5 rounded-md">
                      <Zap className="w-3 h-3 text-[#8B24F0]" />
                      +{m.xpReward} XP
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-foreground font-heading text-sm sm:text-base leading-tight">
                    {m.title}
                  </h3>
                  <p className="text-xs font-heading text-muted-foreground leading-relaxed">
                    {m.description}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] font-heading text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium">
                      {m.isCompleted ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Concluída
                        </span>
                      ) : m.isAccepted ? (
                        <span className="text-purple-300 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Em Progresso
                        </span>
                      ) : (
                        <span>Não iniciada</span>
                      )}
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {m.isCompleted ? "100%" : `${m.progress} / ${m.total}`}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        m.isCompleted
                          ? "bg-emerald-400"
                          : "bg-gradient-to-r from-cyan-400 to-[#8B24F0]"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Action feedback */}
                {notice && (
                  <div
                    className={`p-2.5 rounded-xl border text-[11px] font-heading ${
                      notice.success
                        ? "bg-emerald-950/50 border-emerald-500/30 text-emerald-300"
                        : "bg-amber-950/40 border-amber-500/30 text-amber-300"
                    }`}
                  >
                    {notice.text}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  {!m.isAccepted && !m.isCompleted ? (
                    <button
                      onClick={() => handleAcceptMission(m.id)}
                      disabled={loadingMissionId === m.id}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#8B24F0] hover:bg-[#781dd6] text-white text-xs font-heading font-bold transition-all shadow-md shadow-[#8B24F0]/20 cursor-pointer disabled:opacity-50"
                    >
                      <span>
                        {loadingMissionId === m.id ? "Aceitando..." : "Aceitar Missão"}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : m.isAccepted && !m.isCompleted ? (
                    <>
                      {isReferral && userId && (
                        <button
                          onClick={handleCopyId}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/30 text-cyan-300 text-xs font-heading font-semibold transition-colors cursor-pointer"
                        >
                          {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId ? "ID Copiado!" : "Copiar Meu ID"}</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleVerifyMission(m.id)}
                        disabled={verifyingMissionId === m.id}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-[#8B24F0] hover:opacity-90 text-white text-xs font-heading font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${verifyingMissionId === m.id ? "animate-spin" : ""}`} />
                        <span>
                          {verifyingMissionId === m.id ? "Verificando..." : "Verificar Missão"}
                        </span>
                      </button>
                    </>
                  ) : (
                    <div className="w-full py-2 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-center flex items-center justify-center gap-1.5 text-emerald-300 text-xs font-heading font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Recompensa de +{m.xpReward} XP creditada no seu perfil</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
