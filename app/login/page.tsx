"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Lock, ArrowRight, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await login(email, password);
      if (res.success) {
        router.push("/pass");
      } else {
        setError(res.error || "Credenciais inválidas.");
      }
    } catch (err: any) {
      setError(err.message || "Erro de autenticação.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoUser = () => {
    setEmail("rafael.molina@nxtgen.app");
    setPassword("Nxtgen2026!");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-[#ededef] flex flex-col justify-between p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-white">
          NXTGEN<span className="text-brand-cyan">.</span>
        </Link>
        <Link href="/signup" className="font-mono text-xs text-gray-400 hover:text-white uppercase tracking-wider">
          Criar Conta →
        </Link>
      </div>

      {/* Main Login Box */}
      <div className="max-w-md w-full mx-auto my-auto py-12 space-y-6">
        <div className="space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-brand-cyan">
            [ AUTENTICAÇÃO SEGURA • RLS ATIVO ]
          </span>
          <h1 className="font-display text-3xl font-bold text-white uppercase tracking-tight">
            Entrar no Ecossistema
          </h1>
          <p className="text-xs text-gray-400 font-sans">
            Acesse seu NXT PASS, carteira de benefícios e histórico de utilizações.
          </p>
        </div>

        {/* Demo Credentials Quick Button */}
        <button
          type="button"
          onClick={fillDemoUser}
          className="w-full p-3 border border-dashed border-brand-cyan/40 bg-brand-cyan/5 hover:bg-brand-cyan/10 text-brand-cyan font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-colors"
        >
          <span>Preencher com Conta Demo (Rafael Molina)</span>
          <span>⚡</span>
        </button>

        {error && (
          <div className="p-3 border border-red-500/40 bg-red-950/20 text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
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
            <div className="flex items-center justify-between">
              <label className="text-gray-400 uppercase tracking-wider">Senha</label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full p-3.5 bg-[#0f1015] border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-white transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white hover:bg-gray-200 disabled:opacity-50 text-black font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verificando Credenciais...</span>
              </>
            ) : (
              <>
                <span>Acessar NXT PASS</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-white/10 flex items-center justify-center space-x-2 text-[11px] font-mono text-gray-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Sessão assinada por JWT com HMAC SHA-256</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center font-mono text-[10px] text-gray-600 border-t border-white/10 pt-4">
        NXTGEN PLATFORM • PROTEGIDO POR ROW LEVEL SECURITY
      </div>
    </div>
  );
}
