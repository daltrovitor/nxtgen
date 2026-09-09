"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, ShieldCheck, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await signup(fullName, email, password);
      if (res.success) {
        router.push("/");
      } else {
        setError(res.error || "Erro ao registrar conta.");
      }
    } catch (err: any) {
      setError(err.message || "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-[#ededef] flex flex-col justify-between p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-white">
          NXTGEN<span className="text-brand-cyan">.</span>
        </Link>
        <Link href="/login" className="font-mono text-xs text-gray-400 hover:text-white uppercase tracking-wider">
          Já tem conta? Entrar →
        </Link>
      </div>

      {/* Signup Box */}
      <div className="max-w-md w-full mx-auto my-auto py-12 space-y-6">
        <div className="space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">
            [ ONBOARDING INSTANTÂNEO • ZERO CONFIRMAÇÃO DE E-MAIL ]
          </span>
          <h1 className="font-display text-3xl font-bold text-white uppercase tracking-tight">
            Criar Conta NXT
          </h1>
          <p className="text-xs text-gray-400 font-sans">
            Acesso liberado imediatamente. Sem links de verificação ou esperas.
          </p>
        </div>

        {error && (
          <div className="p-3 border border-red-500/40 bg-red-950/20 text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div className="space-y-1.5">
            <label className="text-gray-400 uppercase tracking-wider block">Nome Completo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex: Vitor Daltro"
              required
              className="w-full p-3.5 bg-[#0f1015] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 uppercase tracking-wider block">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@exemplo.com"
              required
              className="w-full p-3.5 bg-[#0f1015] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 uppercase tracking-wider block">Senha de Acesso</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              className="w-full p-3.5 bg-[#0f1015] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <div className="p-3 bg-white/5 border border-white/10 text-[11px] text-gray-400 space-y-1">
            <div className="flex items-center space-x-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <strong className="text-white">Sem confirmação de e-mail</strong>
            </div>
            <p>Sua conta é ativada no mesmo instante com 250 pontos iniciais de bônus.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white hover:bg-gray-200 disabled:opacity-50 text-black font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Registrando Conta...</span>
              </>
            ) : (
              <>
                <span>Ativar Conta & Acessar</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-white/10 flex items-center justify-center space-x-2 text-[11px] font-mono text-gray-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Políticas de Segurança e RLS Automáticas</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center font-mono text-[10px] text-gray-600 border-t border-white/10 pt-4">
        NXTGEN PLATFORM • BUILD. DON&apos;T BET.
      </div>
    </div>
  );
}
