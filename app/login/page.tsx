"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Gamepad2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await login(email, password);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 600);
      } else {
        setError(res.error || "Credenciais inválidas. Verifique seu e-mail e senha.");
      }
    } catch (err: any) {
      setError(err.message || "Erro de autenticação com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#F3F4F6] flex flex-col justify-between p-6 selection:bg-purple-500 selection:text-white">
      {/* Top Navigation */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between border-b border-white/10 pb-5">
        <Link href="/" className="flex items-center space-x-3 group">
          <Image
            src="/logonxtgen.png"
            alt="NXTGEN"
            width={220}
            height={60}
            className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-opacity group-hover:opacity-85 drop-shadow-[0_0_20px_rgba(139,92,246,0.35)]"
            priority
          />
        </Link>
        <Link
          href="/signup"
          className="font-mono text-xs text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
        >
          <span>Criar Conta</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main NexusGate Card */}
      <main className="max-w-md w-full mx-auto my-auto py-8">
        <div className="relative overflow-hidden rounded-[32px] bg-[#0A0D18]/85 backdrop-blur-3xl border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-7 sm:p-9 text-white">
          {/* Header */}
          <div className="text-center space-y-1.5 mb-6">
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              NXTGEN
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 font-sans">
              Seu ecossistema financeiro aguarda
            </p>
            <p className="text-[11px] font-mono text-gray-500">
              [Pressione Enter para acessar o ecossistema]
            </p>
            <div className="flex items-center justify-center space-x-2.5 text-base pt-1">
              <span>⚔️</span>
              <span>🎮</span>
              <span>🏆</span>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-4 p-3.5 rounded-xl border border-red-500/40 bg-red-950/30 text-red-300 text-xs font-mono flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 text-xs font-mono flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Autenticado com sucesso! Redirecionando...</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Endereço de e-mail"
                required
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 text-sm transition-all font-sans"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                required
                className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 text-sm transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Remember me and Forgot password */}
            <div className="flex items-center justify-between text-xs text-gray-400 pt-0.5 select-none">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <button
                  type="button"
                  role="switch"
                  aria-checked={rememberMe}
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                    rememberMe ? "bg-[#8B24F0]" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      rememberMe ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-gray-300">Lembrar de mim</span>
              </label>

              <button
                type="button"
                onClick={() => alert("Instruções de recuperação enviadas para o suporte.")}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                Esqueceu a senha?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3.5 mt-1 bg-[#8B24F0] hover:bg-[#9d3df3] text-white font-bold text-sm rounded-xl shadow-[0_0_25px_rgba(139,36,240,0.5)] hover:shadow-[0_0_35px_rgba(139,36,240,0.7)] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validando Credenciais...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Acesso Autorizado</span>
                </>
              ) : (
                <span>Entrar no NXTGEN</span>
              )}
            </button>
          </form>

          {/* Quick access separator */}
          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-3 text-gray-400 text-xs font-sans">
              acesso rápido via
            </span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Quick access buttons */}
          <div className="grid grid-cols-3 gap-3">
            {/* Google */}
            <button
              type="button"
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer group"
              title="Acesso via Google"
            >
              <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887C18.2 16.14 15.645 18 12.24 18c-3.315 0-6-2.685-6-6s2.685-6 6-6c1.455 0 2.785.525 3.82 1.39l2.405-2.405C16.92 3.55 14.73 2.6 12.24 2.6 7.07 2.6 2.88 6.79 2.88 12s4.19 9.4 9.36 9.4c5.4 0 8.98-3.79 8.98-9.14 0-.61-.06-1.22-.17-1.975H12.24z" />
              </svg>
            </button>

            {/* Twitter / X */}
            <button
              type="button"
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer group"
              title="Acesso via X / Twitter"
            >
              <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>

            {/* Discord / Gaming */}
            <button
              type="button"
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer group"
              title="Acesso via Gaming"
            >
              <Gamepad2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Footer mode switch */}
          <div className="text-center text-xs text-gray-400 pt-5">
            Não tem uma conta?{" "}
            <Link
              href="/signup"
              className="font-bold text-white hover:text-purple-400 transition-colors ml-1 cursor-pointer"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center font-mono text-[10px] text-gray-600 border-t border-white/10 pt-4">
        NXTGEN • BUILD. DON&apos;T BET.
      </footer>
    </div>
  );
}
