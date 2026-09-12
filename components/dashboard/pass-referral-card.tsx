"use client";

import React, { useState, useEffect } from "react";
import { Copy, Check, Users, Gift, Sparkles, ArrowRight, UserCheck, Share2 } from "lucide-react";
import confetti from "canvas-confetti";
import { ReferralInfo } from "@/lib/pass-data";

interface PassReferralCardProps {
  referralInfo?: ReferralInfo | null;
  onReferralSuccess?: (newScore: number, newLevel: number) => void;
}

export function PassReferralCard({ referralInfo, onReferralSuccess }: PassReferralCardProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Input for friend to redeem an invite
  const [referrerInput, setReferrerInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isEditingReferral, setIsEditingReferral] = useState(false);

  // Local state for when referral is redeemed in this session
  const [referredByState, setReferredByState] = useState<{ id: string; name: string } | null>(
    referralInfo?.referredBy || null
  );

  // Sync state if referralInfo is loaded or updated asynchronously
  useEffect(() => {
    if (referralInfo?.referredBy) {
      setReferredByState(referralInfo.referredBy);
    }
  }, [referralInfo?.referredBy]);

  // Read URL query parameters (?ref=2662CD6C or ?code=2662CD6C)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get("ref") || params.get("code") || params.get("convite");
      if (urlCode && !referrerInput) {
        setReferrerInput(urlCode.trim().toUpperCase());
      }
    }
  }, []);

  const userId = referralInfo?.userId || "";
  const referralCode = referralInfo?.referralCode || (userId ? userId.slice(0, 8).toUpperCase() : "");
  const friendsCount = referralInfo?.friendsInvitedCount || 0;

  const handleCopyId = async () => {
    const textToCopy = referralCode || userId;
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {}
  };

  const handleCopyLink = async () => {
    const textToCopy = referralCode || userId;
    if (!textToCopy) return;
    try {
      const shareUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/?ref=${textToCopy}`
          : `https://nxtgen.app/?ref=${textToCopy}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
  };

  const handlePasteCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setReferrerInput(text.trim().toUpperCase());
      }
    } catch {}
  };

  const handleSubmitReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referrerInput.trim()) return;

    setIsValidating(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/pass/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referrerId: referrerInput.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setFeedback({
          type: "error",
          text: data.error || "Não foi possível validar o convite.",
        });
        return;
      }

      // Success
      setFeedback({
        type: "success",
        text: data.message || "Convite validado com sucesso! Bônus creditado.",
      });
      setReferredByState(data.referrer);
      setIsEditingReferral(false);
      setReferrerInput("");

      // Confetti celebration
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#8B24F0", "#00F5FF", "#10B981", "#F59E0B"],
        });
      } catch {}

      if (onReferralSuccess && data.currentUser) {
        onReferralSuccess(data.currentUser.nxtScore, data.currentUser.nxtLevel);
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.message || "Erro de conexão ao validar o convite.",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div
      id="referral-section"
      className="rounded-2xl bg-card border border-border p-5 sm:p-7 shadow-sm transition-colors relative overflow-hidden"
    >
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 dark:bg-[#8B24F0]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-[#8B24F0]/20 border border-purple-500/20 dark:border-[#8B24F0]/30 flex items-center justify-center text-purple-600 dark:text-[#8B24F0] shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold font-heading text-foreground">
                Convide Amigos & Ganhe XP
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                +250 XP
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-heading mt-0.5">
              O ecossistema é construído por você. Indique amigos para avançar suas missões e subir de nível.
            </p>
          </div>
        </div>

        {/* Counter */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-1.5 self-start sm:self-auto">
          <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span className="text-xs font-heading text-muted-foreground">Amigos indicados:</span>
          <span className="text-sm font-bold font-mono text-cyan-600 dark:text-cyan-400">
            {friendsCount}
          </span>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-4 relative z-10">
        {/* Left Column: My Referral Code / ID */}
        <div className="lg:col-span-6 space-y-3">
          <label className="text-xs font-heading font-medium text-foreground flex items-center gap-1.5">
            <span>Seu código e link para convidar amigos:</span>
          </label>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-2 overflow-hidden">
              <div className="flex flex-col overflow-hidden min-w-0">
                <span className="text-[10px] uppercase font-mono font-medium text-muted-foreground">
                  Seu Código:
                </span>
                <span className="text-sm font-mono font-extrabold text-purple-600 dark:text-purple-400 tracking-wider">
                  {referralCode || "..."}
                </span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[130px]" title={userId}>
                ID: {userId ? userId.slice(0, 10) + "..." : "..."}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyId}
                type="button"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#8B24F0] hover:bg-[#781dd6] text-white text-xs font-heading font-bold transition-all shadow-md shadow-[#8B24F0]/20 cursor-pointer"
              >
                {copiedId ? (
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedId ? "Copiado!" : "Copiar"}</span>
              </button>

              <button
                onClick={handleCopyLink}
                type="button"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-foreground text-xs font-heading font-medium transition-colors cursor-pointer"
              >
                {copiedLink ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
                <span>{copiedLink ? "Link Copiado" : "Link"}</span>
              </button>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed font-heading">
            💡 <strong className="text-foreground">Como funciona:</strong> Compartilhe o seu código (ex:{" "}
            <code className="px-1.5 py-0.5 rounded bg-muted font-mono font-bold text-purple-600 dark:text-purple-400">
              {referralCode || "SEU_CODIGO"}
            </code>
            ). Quando o amigo validar o convite no dashboard dele, você ganha{" "}
            <strong className="text-foreground">+250 XP</strong> e ele recebe{" "}
            <strong className="text-foreground">+100 XP</strong> de boas-vindas!
          </p>
        </div>

        {/* Right Column: Enter Friend's Code / Invite Validation */}
        <div className="lg:col-span-6 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 p-4 flex flex-col justify-between space-y-3">
          {referredByState && !isEditingReferral ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-3 space-y-2.5">
              <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <p className="text-xs font-heading font-bold text-foreground">
                    Indicação de Amigo Ativa
                  </p>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    +100 XP
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-heading">
                  Você foi indicado pelo amigo:{" "}
                  <strong className="text-foreground font-bold">{referredByState.name}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsEditingReferral(true);
                  setFeedback(null);
                }}
                className="mt-1 text-[11px] font-heading font-medium text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
              >
                Inserir outro código de amigo
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitReferral} className="space-y-2.5">
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 text-xs font-heading font-semibold text-foreground">
                  <Gift className="w-3.5 h-3.5 text-[#8B24F0]" />
                  <span>Inserir Código do Amigo</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                  +100 XP Bônus
                </span>
              </div>

              <p className="text-[11px] text-muted-foreground font-heading leading-tight">
                Cole o código de 8 dígitos do seu amigo (ex: <strong className="font-mono text-purple-600 dark:text-purple-400">2662CD6C</strong>) para resgatar seu bônus de boas-vindas:
              </p>

              <div className="space-y-2">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={referrerInput}
                    onChange={(e) => setReferrerInput(e.target.value.toUpperCase())}
                    placeholder="Digite o código do amigo (ex: 2662CD6C)"
                    className="w-full pl-3 pr-16 py-2.5 rounded-xl bg-background border border-slate-300 dark:border-white/15 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#8B24F0] focus:ring-1 focus:ring-[#8B24F0] font-mono tracking-wider transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handlePasteCode}
                    className="absolute right-2 px-2 py-1 text-[10px] font-heading font-semibold text-purple-600 dark:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 rounded-md transition-colors cursor-pointer"
                  >
                    Colar
                  </button>
                </div>

                <div className="flex gap-2">
                  {isEditingReferral && (
                    <button
                      type="button"
                      onClick={() => setIsEditingReferral(false)}
                      className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-foreground text-xs font-heading font-medium transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isValidating || !referrerInput.trim()}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-[#8B24F0] hover:opacity-90 disabled:opacity-50 text-white text-xs font-heading font-bold transition-all cursor-pointer shadow-md shadow-purple-500/20"
                  >
                    <span>{isValidating ? "Validando..." : "Validar Código do Amigo"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {feedback && (
                <div
                  className={`p-2.5 rounded-lg border text-[11px] leading-snug ${
                    feedback.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                      : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300"
                  }`}
                >
                  {feedback.text}
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
