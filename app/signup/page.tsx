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
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Zap,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
            width={120}
            height={32}
            className="h-7 w-auto object-contain transition-opacity group-hover:opacity-80"
          />
        </Link>
        <Link
          href="/login"
          className="font-mono text-xs text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-wider flex items-center space-x-1"
        >
          <span>Já tem conta? Entrar</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Main Luxury Signup Card */}
      <main className="max-w-md w-full mx-auto my-auto py-10">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0F111A]/95 via-[#0A0C13]/95 to-[#06070B]/95 border border-purple-500/30 backdrop-blur-2xl shadow-[0_0_60px_rgba(139,92,246,0.18)] p-7 sm:p-9 space-y-6">
          {/* Top ambient hairline neon */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/90 to-transparent" />

          {/* Heading */}
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Acesso Imediato • Sem Confirmação de E-mail</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">
              Criar Conta NXT
            </h1>
            <p className="text-xs text-gray-400 font-sans">
              Entre para a nova geração. Sua conta é ativada instantaneamente.
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="p-3.5 rounded-xl border border-red-500/40 bg-red-950/30 text-red-300 text-xs font-mono flex items-center space-x-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 text-xs font-mono flex items-center space-x-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Conta criada e autenticada com sucesso! Redirecionando...</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
                Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/70" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex: Vitor Daltro"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all font-sans text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/70" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-black/60 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all font-sans text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-gray-400 uppercase tracking-wider block">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/70" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-3 bg-black/60 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all font-sans text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Instant Benefit Badge */}
            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs font-mono text-gray-300 flex items-start space-x-2.5">
              <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-white font-bold block">Acesso Instantâneo & Bônus</span>
                <span className="text-[11px] text-gray-400">
                  Nenhum link de confirmação necessário. Ganhe 250 pontos XP ao criar sua conta.
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-4 mt-2 bg-gradient-to-r from-purple-600 via-violet-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 disabled:opacity-50 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_0_24px_rgba(139,92,246,0.45)] hover:shadow-[0_0_36px_rgba(139,92,246,0.7)] flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Criando e Ativando Conta...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Conta Ativada com Sucesso</span>
                </>
              ) : (
                <>
                  <span>Criar Conta Instantânea</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Trust Footnote */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-center space-x-2 text-[11px] font-mono text-gray-500">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Segurança Criptográfica & Row Level Security</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center font-mono text-[10px] text-gray-600 border-t border-white/10 pt-4">
        NXTGEN • BUILD. DON&apos;T BET. • PROTEGIDO POR ROW LEVEL SECURITY
      </footer>
    </div>
  );
}
