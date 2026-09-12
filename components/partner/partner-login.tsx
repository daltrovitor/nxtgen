"use client";

import React, { useState } from "react";
import { QrCode, Lock, ShieldAlert, ArrowRight, Sparkles } from "lucide-react";

interface PartnerLoginProps {
  onSuccess: () => void;
}

export function PartnerLogin({ onSuccess }: PartnerLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/partner/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(
          data.error || "Acesso negado. Apenas usuários com perfil de parceiro podem acessar."
        );
        return;
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem("nxtgen_tab_active", "true");
        localStorage.setItem("nxtgen_remember_me", "true");
      }

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Falha na conexão com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans select-none">
      <div className="max-w-md w-full bg-[#090A0F] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#8B24F0]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#8B24F0]/30 to-amber-500/20 border border-[#8B24F0]/40 flex items-center justify-center text-[#C084FC] shadow-lg shadow-[#8B24F0]/20">
            <QrCode className="w-7 h-7 text-white" />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono font-bold text-amber-400 tracking-wider uppercase">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>NXTGEN • Portal de Parceiros</span>
            </div>
            <h1 className="text-2xl font-bold font-heading text-white mt-2.5 tracking-tight">
              Acesso do Estabelecimento
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Validação instantânea de vouchers via QR Code e código manual
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-950/50 border border-red-500/40 flex items-start gap-3 text-left relative z-10">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs text-red-200">
              <strong className="block font-semibold text-red-300">Restrição de Acesso:</strong>
              {errorMsg}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-mono text-gray-300">E-mail do Parceiro</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="partner@nxtgen.app"
              required
              className="w-full px-4 py-3 rounded-2xl bg-[#030407] border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#8B24F0] focus:ring-1 focus:ring-[#8B24F0] transition-colors font-mono"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-mono text-gray-300">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-4 py-3 rounded-2xl bg-[#030407] border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#8B24F0] focus:ring-1 focus:ring-[#8B24F0] transition-colors font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#8B24F0] to-[#781DD6] hover:brightness-110 disabled:opacity-50 text-white text-sm font-bold font-heading tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#8B24F0]/30"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Acessar Scanner de Vouchers</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="text-center pt-2 relative z-10">
          <a
            href={
              typeof window !== "undefined" && window.location.hostname.includes("localhost")
                ? "http://localhost:3000"
                : "https://nxtgen.app"
            }
            className="text-xs text-gray-400 hover:text-gray-200 transition-colors font-mono"
          >
            ← Voltar para o site principal
          </a>
        </div>
      </div>
    </div>
  );
}
