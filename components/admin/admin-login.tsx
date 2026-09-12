"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, ShieldAlert, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

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
    if (!email || !password) {
      setErrorMsg("Preencha todos os campos.");
      return;
    }

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
        throw new Error(data.error || "Credenciais administrativas inválidas.");
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem("nxtgen_tab_active", "true");
        localStorage.setItem("nxtgen_remember_me", "true");
      }

      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro de conexão ao servidor.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-6 font-sans select-none transition-colors duration-200 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle variant="header" />
      </div>
      <div className="max-w-md w-full bg-card text-card-foreground border border-border rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-[#8B24F0]/10 border border-purple-300 dark:border-[#8B24F0]/30 flex items-center justify-center text-purple-700 dark:text-[#8B24F0]">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-[#8B24F0]/15 border border-purple-300 dark:border-[#8B24F0]/30 text-[11px] font-mono text-purple-700 dark:text-[#A855F7] tracking-wider uppercase">
              NXTGEN • Admin Portal
            </div>
            <h1 className="text-2xl font-bold font-heading text-foreground mt-2 tracking-tight">
              Acesso Administrativo
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Gestão de membros, alteração de níveis, benefícios e vouchers
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-500/40 flex items-start gap-3 text-left">
            <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs text-red-800 dark:text-red-200">
              <strong className="block font-semibold text-red-900 dark:text-red-300">Acesso Restrito:</strong>
              {errorMsg}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1 text-left">
            <label className="text-xs font-mono text-foreground font-medium">E-mail Administrativo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nxtgen.app"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#030407] border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-[#8B24F0] focus:ring-1 focus:ring-[#8B24F0] transition-colors"
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-xs font-mono text-foreground font-medium">Senha de Acesso</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#030407] border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-[#8B24F0] focus:ring-1 focus:ring-[#8B24F0] transition-colors"
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

        {/* Back Link */}
        <div className="text-center pt-2">
          <a
            href={
              typeof window !== "undefined" && window.location.hostname.includes("localhost")
                ? "http://localhost:3000"
                : "https://nxtgen.app"
            }
            className="text-xs text-muted-foreground hover:text-foreground transition-colors font-mono"
          >
            ← Voltar para o site principal
          </a>
        </div>
      </div>
    </div>
  );
}
