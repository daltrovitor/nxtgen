"use client";

import React, { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import {
  QrCode,
  Keyboard,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  LogOut,
  Sparkles,
  Shield,
  Clock,
  User,
  Ticket,
  ArrowRight,
  RefreshCw,
  X,
  History,
} from "lucide-react";
import { PartnerQrScanner } from "./partner-qr-scanner";

export interface PartnerUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
}

interface PartnerDashboardProps {
  user: PartnerUser;
  onLogout: () => void;
}

export function PartnerDashboard({ user, onLogout }: PartnerDashboardProps) {
  const [activeTab, setActiveTab] = useState<"scanner" | "manual">("scanner");
  const [manualCode, setManualCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal / Result State
  const [modalVoucher, setModalVoucher] = useState<any | null>(null);
  const [modalStatus, setModalStatus] = useState<"valid" | "used" | "redeemed_now" | null>(null);
  const [modalWarning, setModalWarning] = useState<string | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Recent Validations list
  const [recentValidations, setRecentValidations] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Fetch recent validations
  const fetchRecent = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const res = await fetch("/api/partner/validate");
      const data = await res.json();
      if (res.ok && data.vouchers) {
        setRecentValidations(data.vouchers);
      }
    } catch (e) {
      console.error("Erro ao carregar histórico:", e);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  // Handle voucher verification (from QR or manual input)
  const handleVerifyCode = async (rawCode: string) => {
    if (!rawCode || isProcessing) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/partner/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: rawCode, action: "lookup" }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Voucher não encontrado. Verifique o código e tente novamente.");
        return;
      }

      setModalVoucher(data.voucher);
      setModalStatus(data.voucher.status === "used" ? "used" : "valid");
      setModalWarning(data.warning || null);
    } catch (err: any) {
      setErrorMessage(err.message || "Erro de conexão ao verificar voucher.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle manual submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleVerifyCode(manualCode);
  };

  // Handle redemption / mark as used
  const handleRedeemVoucher = async () => {
    if (!modalVoucher || isRedeeming) return;

    setIsRedeeming(true);
    try {
      const res = await fetch("/api/partner/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: modalVoucher.code, action: "redeem" }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || "Erro ao baixar voucher.");
        return;
      }

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#8B24F0", "#F59E0B", "#10B981", "#FFFFFF"],
        });
      } catch {}

      setModalStatus("redeemed_now");
      setModalVoucher(data.voucher);
      fetchRecent();
    } catch (err: any) {
      alert("Falha ao registrar a baixa do voucher: " + err.message);
    } finally {
      setIsRedeeming(false);
    }
  };

  const closeModal = () => {
    setModalVoucher(null);
    setModalStatus(null);
    setModalWarning(null);
    setManualCode("");
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#F3F4F6] font-sans selection:bg-[#8B24F0] selection:text-white pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#090A0F]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-xl tracking-tight text-white">
                NXTGEN
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                PARTNER
              </span>
            </div>

            <span className="hidden sm:inline-block text-xs text-gray-500 font-mono pl-2 border-l border-white/10">
              partnerng.nxtgen.app
            </span>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-white font-heading">
                {user.name}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Terminal Ativo
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
              title="Sair do terminal do parceiro"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex border-t border-white/5">
          <button
            onClick={() => {
              setActiveTab("scanner");
              setErrorMessage(null);
            }}
            className={`flex-1 py-3.5 px-4 text-xs font-heading font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "scanner"
                ? "border-[#8B24F0] text-white bg-[#8B24F0]/10"
                : "border-transparent text-gray-400 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <QrCode className="w-4 h-4 text-[#C084FC]" />
            <span>Escanear QR Code</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("manual");
              setErrorMessage(null);
            }}
            className={`flex-1 py-3.5 px-4 text-xs font-heading font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "manual"
                ? "border-[#8B24F0] text-white bg-[#8B24F0]/10"
                : "border-transparent text-gray-400 hover:text-white hover:bg-white/[0.02]"
            }`}
          >
            <Keyboard className="w-4 h-4 text-amber-400" />
            <span>Código Manual</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 flex items-start justify-between gap-3 text-left animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs font-semibold text-red-300">
                  Não foi possível validar
                </strong>
                <p className="text-xs text-red-200/90 mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 1: QR CODE SCANNER */}
        {activeTab === "scanner" && (
          <div className="bg-[#090A0F] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold font-heading text-white">
                Scanner Óptico de Vouchers
              </h2>
              <p className="text-xs text-gray-400">
                Aponte a câmera para o QR Code apresentado pelo associado no app NXTGEN.
              </p>
            </div>

            <div className="py-2">
              <PartnerQrScanner
                onScan={handleVerifyCode}
                isScanningActive={activeTab === "scanner" && !modalVoucher && !isProcessing}
              />
            </div>

            {isProcessing && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#8B24F0]/20 border border-[#8B24F0]/40 text-xs font-mono text-[#C084FC] animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Consultando voucher no sistema...</span>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MANUAL CODE ENTRY */}
        {activeTab === "manual" && (
          <div className="bg-[#090A0F] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6 max-w-lg mx-auto">
            <div className="space-y-1">
              <h2 className="text-lg font-bold font-heading text-white">
                Inserção Manual do Voucher
              </h2>
              <p className="text-xs text-gray-400">
                Digite o código alfanumérico fornecido pelo cliente (ex: NXT-1234-5678)
              </p>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-gray-300">
                  Código do Voucher
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    placeholder="NXT-XXXX-XXXX"
                    className="w-full px-4 py-3.5 rounded-2xl bg-[#030407] border border-white/10 text-base font-mono font-bold tracking-widest text-center text-white placeholder-gray-600 focus:outline-none focus:border-[#8B24F0] focus:ring-1 focus:ring-[#8B24F0] transition-colors uppercase"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!manualCode.trim() || isProcessing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#8B24F0] to-[#781DD6] hover:brightness-110 disabled:opacity-50 text-white text-sm font-bold font-heading tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#8B24F0]/20"
              >
                {isProcessing ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verificar Voucher</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-gray-400 text-left">
              <span className="block font-semibold text-gray-300 mb-1 font-mono">Dica do Operador:</span>
              O associado também pode visualizar o código manual de 8 dígitos logo abaixo do QR Code no aplicativo do celular.
            </div>
          </div>
        )}

        {/* RECENT VALIDATIONS HISTORY */}
        <div className="bg-[#090A0F] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#C084FC]" />
              <h3 className="text-sm font-bold font-heading text-white">
                Vouchers Registrados Recentemente ({recentValidations.length})
              </h3>
            </div>
            <button
              onClick={fetchRecent}
              disabled={isLoadingHistory}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="Atualizar lista"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHistory ? "animate-spin text-[#C084FC]" : ""}`} />
            </button>
          </div>

          {recentValidations.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-500 font-mono">
              Nenhum voucher processado nesta sessão ainda.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {recentValidations.slice(0, 8).map((v) => (
                <div
                  key={v.id || v.code}
                  className="p-3.5 rounded-2xl bg-[#030407] border border-white/5 flex items-center justify-between gap-3 text-left"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white tracking-wider">
                        {v.code}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full uppercase ${
                          v.status === "used"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {v.status === "used" ? "Baixado" : "Pendente"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-300 truncate mt-0.5 font-medium">
                      {v.benefitTitle || v.discountLabel}
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono truncate">
                      {v.userName || v.userEmail}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-gray-400 font-mono">
                      {v.validatedAt || v.redeemedAt || "Hoje"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODAL: VOUCHER RESULT & CONFIRMATION */}
      {modalVoucher && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="max-w-md w-full bg-[#090A0F] border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-left relative overflow-hidden">
            {/* Ambient modal glow */}
            <div
              className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl pointer-events-none ${
                modalStatus === "valid" || modalStatus === "redeemed_now"
                  ? "bg-emerald-500/20"
                  : "bg-red-500/20"
              }`}
            />

            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Status */}
            <div className="space-y-2">
              {modalStatus === "redeemed_now" && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-mono font-bold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>VOUCHER BAIXADO COM SUCESSO!</span>
                </div>
              )}

              {modalStatus === "valid" && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-mono font-bold text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>VOUCHER VÁLIDO E ATIVO</span>
                </div>
              )}

              {modalStatus === "used" && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-xs font-mono font-bold text-red-300">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span>ESTE VOUCHER JÁ FOI UTILIZADO</span>
                </div>
              )}

              <h2 className="text-xl font-bold font-heading text-white">
                {modalVoucher.benefitTitle}
              </h2>
              <div className="text-xs font-mono text-amber-400 font-semibold">
                Desconto: {modalVoucher.discountLabel}
              </div>
            </div>

            {/* Warning if already used */}
            {modalWarning && (
              <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 text-xs text-red-200">
                {modalWarning}
              </div>
            )}

            {/* Voucher Details Card */}
            <div className="p-4 rounded-2xl bg-[#030407] border border-white/10 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">Código:</span>
                <span className="text-white font-bold text-sm tracking-wider">
                  {modalVoucher.code}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">Associado:</span>
                <span className="text-gray-200 font-semibold truncate max-w-[200px]">
                  {modalVoucher.userName || "Membro NXTGEN"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">E-mail:</span>
                <span className="text-gray-300 truncate max-w-[200px]">
                  {modalVoucher.userEmail}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-gray-500">Resgatado em:</span>
                <span className="text-gray-400">{modalVoucher.redeemedAt}</span>
              </div>

              {modalVoucher.validatedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Baixado em:</span>
                  <span className="text-emerald-400 font-semibold">
                    {modalVoucher.validatedAt}
                  </span>
                </div>
              )}
            </div>

            {/* Terms Summary */}
            {modalVoucher.terms && (
              <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
                <strong>Regra do benefício:</strong> {modalVoucher.terms}
              </p>
            )}

            {/* Actions */}
            <div className="pt-2 flex gap-3">
              {modalStatus === "valid" ? (
                <>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-mono text-gray-300 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleRedeemVoucher}
                    disabled={isRedeeming}
                    className="flex-2 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 disabled:opacity-50 text-white text-xs font-bold font-heading uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    {isRedeeming ? (
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirmar e Dar Baixa</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-heading font-bold text-white transition-colors cursor-pointer text-center"
                >
                  Concluir e Validar Outro
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
