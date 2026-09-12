"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Lock, ShieldAlert, ArrowRight, CheckCircle2 } from "lucide-react";

interface AdminLoginProps {
  onSuccess: () => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(
          data.error || "Acesso negado. Esta conta não possui privilégios de administrador."
        );
        return;
      }

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Erro de conexão ao servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillCredentials = (testEmail: string, testPass: string) => {
    setEmail(testEmail);
    setPassword(testPass);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans select-none">
      <div className="max-w-md w-full bg-[#090A0F] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#8B24F0]/10 border border-[#8B24F0]/30 flex items-center justify-center text-[#8B24F0]">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#8B24F0]/15 border border-[#8B24F0]/30 text-[11px] font-mono text-[#A855F7] tracking-wider uppercase">
              NXTGEN • Admin Portal
            </div>
            <h1 className="text-2xl font-bold font-heading text-white mt-2 tracking-tight">
              Acesso Administrativo
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Gestão de membros, alteração de níveis, benefícios e vouchers
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 flex items-start gap-3 text-left">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs text-red-200">
              <strong className="block font-semibold text-red-300">Acesso Restrito:</strong>
              {errorMsg}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1 text-left">
            <label className="text-xs font-mono text-gray-300">E-mail Administrativo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nxtgen.app"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#030407] border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#8B24F0] focus:ring-1 focus:ring-[#8B24F0] transition-colors"
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-xs font-mono text-gray-300">Senha de Acesso</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#030407] border border-white/10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#8B24F0] focus:ring-1 focus:ring-[#8B24F0] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-[#8B24F0] hover:bg-[#781DD6] disabled:opacity-50 text-white text-sm font-semibold font-heading tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#8B24F0]/20"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Entrar no Painel Admin</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Fast Credentials Selector for Testing & Verification */}
        <div className="pt-4 border-t border-white/5 space-y-2">
          <p className="text-[11px] font-mono text-gray-500 uppercase tracking-wider text-center">
            Credenciais de Demonstração / Teste
          </p>
          <div className="grid grid-cols-2 gap-2 text-left">
            <button
              type="button"
              onClick={() => handleFillCredentials("admin@nxtgen.app", "AdminNxtgen2026!")}
              className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#8B24F0]/40 text-left transition-colors cursor-pointer"
            >
              <div className="text-[11px] font-semibold text-[#C084FC]">Admin Master</div>
              <div className="text-[10px] text-gray-400 font-mono truncate">admin@nxtgen.app</div>
            </button>

            <button
              type="button"
              onClick={() => handleFillCredentials("rafael.molina@nxtgen.app", "Nxtgen2026!")}
              className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-500/40 text-left transition-colors cursor-pointer"
            >
              <div className="text-[11px] font-semibold text-amber-300">Usuário Comum</div>
              <div className="text-[10px] text-gray-400 font-mono truncate">rafael.molina@...</div>
            </button>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center pt-2">
          <a
            href="/"
            className="text-xs text-gray-400 hover:text-gray-200 transition-colors font-mono"
          >
            ← Voltar para o site principal
          </a>
        </div>
      </div>
    </div>
  );
}
