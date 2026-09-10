"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { signup, loginWithGoogle } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleGoogleSignup = async () => {
    try {
      setGoogleLoading(true);
      setError(null);
      const res = await loginWithGoogle();
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 500);
      } else {
        setError(res.error || "Falha ao cadastrar com o Google.");
      }
    } catch (err: any) {
      setError(err.message || "Erro de conexão com o Google.");
    } finally {
      setGoogleLoading(false);
    }
  };

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
        setSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 600);
      } else {
        setError(res.error || "Erro ao registrar conta. Tente novamente.");
      }
    } catch (err: any) {
      setError(err.message || "Erro de comunicação com o servidor.");
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
            width={2065}
            height={762}
            className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-opacity group-hover:opacity-85 drop-shadow-[0_0_20px_rgba(139,92,246,0.35)]"
            style={{ width: "auto" }}
            priority
          />
        </Link>
        <Link
          href="/login"
          className="font-mono text-xs text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-wider flex items-center space-x-1 cursor-pointer"
        >
          <span>Já tem conta? Entrar</span>
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
              Crie sua conta no ecossistema
            </p>
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
              <span>Conta ativada com sucesso! Redirecionando...</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nome completo"
                required
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 text-sm transition-all font-sans"
              />
            </div>

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
                placeholder="Senha de acesso (mínimo 6 caracteres)"
                required
                minLength={6}
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

            {/* Terms toggle */}
            <div className="flex items-center justify-between text-xs text-gray-400 pt-0.5 select-none">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <button
                  type="button"
                  role="switch"
                  aria-checked={agreeTerms}
                  onClick={() => setAgreeTerms(!agreeTerms)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                    agreeTerms ? "bg-[#8B24F0]" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      agreeTerms ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-gray-300">Concordo com os termos</span>
              </label>

              <span className="text-[11px] text-purple-400 font-mono">Sem confirmação de e-mail</span>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="relative overflow-hidden group w-full py-3.5 mt-1 bg-gradient-to-r from-[#8B24F0] via-[#9d3df3] to-[#8B24F0] hover:brightness-110 text-white font-bold text-sm rounded-xl shadow-[0_0_25px_rgba(139,36,240,0.55)] hover:shadow-[0_0_40px_rgba(139,36,240,0.9)] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
              <span className="relative z-10 flex items-center justify-center space-x-2">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Ativando Conta...</span>
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Conta Criada e Ativa</span>
                  </>
                ) : (
                  <>
                    <span>Criar Conta NXTGEN</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
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

          {/* Google Only */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={loading || googleLoading || success}
            className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 flex items-center justify-center space-x-2.5 text-gray-200 hover:text-white transition-all cursor-pointer group shadow-sm disabled:opacity-50"
            title="Cadastro via Google"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
            ) : (
              <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887C18.2 16.14 15.645 18 12.24 18c-3.315 0-6-2.685-6-6s2.685-6 6-6c1.455 0 2.785.525 3.82 1.39l2.405-2.405C16.92 3.55 14.73 2.6 12.24 2.6 7.07 2.6 2.88 6.79 2.88 12s4.19 9.4 9.36 9.4c5.4 0 8.98-3.79 8.98-9.14 0-.61-.06-1.22-.17-1.975H12.24z" />
              </svg>
            )}
            <span className="text-xs font-semibold font-sans">
              {googleLoading ? "Conectando ao Google..." : "Continuar com o Google"}
            </span>
          </button>

          {/* Footer mode switch */}
          <div className="text-center text-xs text-gray-400 pt-5">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="font-bold text-white hover:text-purple-400 transition-colors ml-1 cursor-pointer"
            >
              Entrar
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
