"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Phone3D } from "@/components/phone-3d";
import { useAuth } from "@/hooks/use-auth";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Lock,
  Mail,
  UserPlus,
  LogIn,
  Layers,
  Award,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function ScrollytellingContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Screen size listener for responsive 3D transforms
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Track scroll progress across the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth spring physics for silky 60fps interpolation
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 20,
    restDelta: 0.001,
  });

  // =========================================================================
  // 3D PHONE MOTION TRANSFORMATIONS
  // Keyframes: 0% -> 25% -> 55% -> 80% -> 100%
  // =========================================================================
  const rotateXDesktop = useTransform(
    smoothProgress,
    [0, 0.2, 0.45, 0.75, 1],
    [12, 12, 10, 8, 0]
  );
  const rotateYDesktop = useTransform(
    smoothProgress,
    [0, 0.2, 0.45, 0.75, 1],
    [-15, -15, -24, 20, -4]
  );
  const rotateZDesktop = useTransform(
    smoothProgress,
    [0, 0.2, 0.45, 0.75, 1],
    [4, 4, -2, 2, 0]
  );
  const xDesktop = useTransform(
    smoothProgress,
    [0, 0.2, 0.45, 0.75, 1],
    [0, 0, 290, -290, -260]
  );
  const scaleDesktop = useTransform(
    smoothProgress,
    [0, 0.2, 0.45, 0.75, 1],
    [1, 1, 1.05, 1.05, 0.95]
  );

  // Mobile clamped transforms: smooth vertical alignment, phone subtly scaled to 0.72, gentle Y offset
  const rotateXMobile = useTransform(smoothProgress, [0, 1], [0, 0]);
  const rotateYMobile = useTransform(smoothProgress, [0, 1], [0, 0]);
  const rotateZMobile = useTransform(smoothProgress, [0, 1], [0, 0]);
  const xMobile = useTransform(smoothProgress, [0, 1], [0, 0]);
  const yMobile = useTransform(smoothProgress, [0, 0.25, 0.55, 0.8, 1], [50, 40, 40, 40, 20]);
  const scaleMobile = useTransform(smoothProgress, [0, 1], [0.72, 0.72]);

  const rotateX = isMobile ? rotateXMobile : rotateXDesktop;
  const rotateY = isMobile ? rotateYMobile : rotateYDesktop;
  const rotateZ = isMobile ? rotateZMobile : rotateZDesktop;
  const x = isMobile ? xMobile : xDesktop;
  const y = isMobile ? yMobile : undefined;
  const scale = isMobile ? scaleMobile : scaleDesktop;

  // Track dynamic state on phone screen based on scroll range
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    return smoothProgress.on("change", (latest) => {
      if (latest < 0.25) setCurrentSection(0);
      else if (latest < 0.55) setCurrentSection(1);
      else if (latest < 0.8) setCurrentSection(2);
      else setCurrentSection(3);
    });
  }, [smoothProgress]);

  // Auth Integration (Connected to /api/auth and useAuth)
  const router = useRouter();
  const { login, signup, user: currentUser, logout } = useAuth();
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [authName, setAuthName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authErrorMsg, setAuthErrorMsg] = useState("");
  const [authSuccessMsg, setAuthSuccessMsg] = useState("");

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorMsg("");
    setAuthSuccessMsg("");
    setAuthLoading(true);

    try {
      if (authTab === "login") {
        const res = await login(authEmail, authPass);
        if (res.success) {
          setAuthSuccessMsg("Sessão autenticada via HMAC/JWT! Redirecionando para o NXT PASS...");
          setTimeout(() => {
            router.push("/pass");
          }, 800);
        } else {
          setAuthErrorMsg(res.error || "Credenciais inválidas. Tente o botão Preencher Demo.");
        }
      } else {
        const res = await signup(authName, authEmail, authPass);
        if (res.success) {
          setAuthSuccessMsg("Conta ativada com sucesso (Zero confirmação de e-mail)! Redirecionando...");
          setTimeout(() => {
            router.push("/pass");
          }, 800);
        } else {
          setAuthErrorMsg(res.error || "Falha ao criar conta.");
        }
      }
    } catch (err: any) {
      setAuthErrorMsg(err.message || "Erro de conexão.");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full bg-[#08090C] text-[#F3F4F6]">
      
      {/* Ambient Radial Background & Technical Grid */}
      <div className="fixed inset-0 bg-tech-grid bg-radial-gradient pointer-events-none -z-10" />

      {/* =========================================================================
          STICKY 3D PHONE VIEWPORT
      ========================================================================= */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center pointer-events-none z-20 overflow-hidden">
        <motion.div
          style={{
            rotateX,
            rotateY,
            rotateZ,
            x,
            y,
            scale,
            transformStyle: "preserve-3d",
          }}
          className="pointer-events-auto transition-shadow"
        >
          <Phone3D
            highlightBenefits={currentSection === 1}
            animateXp={currentSection >= 2}
            glowIntensity={currentSection === 1 ? 1.4 : currentSection === 2 ? 1.6 : 1}
          />
        </motion.div>
      </div>

      {/* =========================================================================
          SCROLLYTELLING SECTIONS (4 STAGES)
      ========================================================================= */}
      <div className="relative z-30 -mt-[100vh]">

        {/* -----------------------------------------------------------------------
            SECTION 1: HERO (Scroll 0% - 25%)
        ----------------------------------------------------------------------- */}
        <section className="min-h-screen flex flex-col justify-center px-4 sm:px-12 max-w-7xl mx-auto py-20 pointer-events-none">
          <div className="max-w-xl space-y-6 pointer-events-auto p-6 sm:p-0 rounded-3xl sm:rounded-none bg-[#08090C]/85 sm:bg-transparent backdrop-blur-xl sm:backdrop-blur-none border border-white/10 sm:border-none shadow-2xl sm:shadow-none">
            {/* Tag Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 font-mono text-xs shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span>BUILD. DON&apos;T BET.</span>
            </div>

            {/* Title */}
            <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.05]">
              The Future <br />
              <span className="bg-gradient-to-r from-purple-400 via-violet-200 to-cyan-300 bg-clip-text text-transparent">
                Pays More.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-gray-400 font-sans leading-relaxed">
              O super app da nova geração que transforma disciplina em recompensas. 
              Substitua a monetização de impulsos por salas VIP, cashback, investimentos e experiências reais.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap gap-4 font-mono text-xs">
              <a
                href="#secao-login"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-cyan-500 text-white font-bold uppercase tracking-wider shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
              >
                <span>Criar Conta Grátis</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#secao-pass"
                className="px-6 py-3.5 rounded-xl bg-[#121622]/80 border border-white/10 hover:border-purple-400/40 text-gray-300 hover:text-white font-bold uppercase tracking-wider transition-all"
              >
                Explorar Ecossistema ↓
              </a>
            </div>

            {/* Scroll Indicator */}
            <div className="pt-10 flex items-center space-x-3 text-xs font-mono text-gray-500">
              <span className="w-5 h-8 rounded-full border border-gray-600 flex items-start justify-center p-1">
                <span className="w-1 h-2 bg-purple-400 rounded-full animate-bounce" />
              </span>
              <span>Role para explorar a experiência em 3D</span>
            </div>
          </div>
        </section>

        {/* -----------------------------------------------------------------------
            SECTION 2: NXT PASS — CLUBE DE EXPERIÊNCIAS (Scroll 25% - 55%)
            Phone moves to the Right -> Content on the Left
        ----------------------------------------------------------------------- */}
        <section
          id="secao-pass"
          className="min-h-screen flex flex-col justify-center px-4 sm:px-12 max-w-7xl mx-auto py-24 pointer-events-none"
        >
          <div className="max-w-md lg:max-w-lg space-y-6 pointer-events-auto p-6 sm:p-0 rounded-3xl sm:rounded-none bg-[#08090C]/85 sm:bg-transparent backdrop-blur-xl sm:backdrop-blur-none border border-white/10 sm:border-none shadow-2xl sm:shadow-none">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono text-xs">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>NXT PASS • CLUBE DE BENEFÍCIOS</span>
            </div>

            <h2 className="font-heading text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              Descontos reais. <br />
              <span className="text-cyan-400">Zero taxas de loja.</span>
            </h2>

            <p className="text-sm sm:text-base text-gray-400 leading-relaxed font-sans">
              Um marketplace independente 100% web. Como operamos sem as comissões predatórias de 30% da Apple e do Google, 
              repassamos a vantagem diretamente para você e para os estabelecimentos credenciados.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-[#101420]/80 border border-cyan-500/20 flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Salas VIP & Viagens Globais</strong>
                  <span className="text-gray-400">Acesso a lounges em aeroportos e upgrades automáticos.</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#101420]/80 border border-purple-500/20 flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Cashback Instantâneo via Pix</strong>
                  <span className="text-gray-400">Economize de 20% a 50% em compras de vestuário, tech e gastronomia.</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#101420]/80 border border-blue-500/20 flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">QR Code Dinâmico Anti-Fraude</strong>
                  <span className="text-gray-400">Tokens criptográficos HMAC que expiram a cada 60 segundos.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* -----------------------------------------------------------------------
            SECTION 3: GAMIFICAÇÃO & FUTURE REWARDS™ (Scroll 55% - 80%)
            Phone moves to the Left -> Content on the Right
        ----------------------------------------------------------------------- */}
        <section className="min-h-screen flex flex-col justify-center items-end px-4 sm:px-12 max-w-7xl mx-auto py-24 pointer-events-none">
          <div className="max-w-md lg:max-w-lg space-y-6 pointer-events-auto text-left pl-0 md:pl-6 p-6 sm:p-0 rounded-3xl sm:rounded-none bg-[#08090C]/85 sm:bg-transparent backdrop-blur-xl sm:backdrop-blur-none border border-white/10 sm:border-none shadow-2xl sm:shadow-none">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 font-mono text-xs shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              <span>NXT SCORE & PROGRESSÃO</span>
            </div>

            <h2 className="font-heading text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              As bets lucram com a perda. <br />
              <span className="bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">
                Nós premiamos suas conquistas.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-gray-400 leading-relaxed font-sans">
              Cada hábito saudável pontua no seu <strong className="text-white">NXT Level</strong>: economizar, completar mentorias, participar das corridas do NXT RUN ou movimentar sua conta digital. 
              Suba do Nível 1 ao Nível 10 e desbloqueie limites de crédito, anuidade zero e participações em startups.
            </p>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1C152B]/80 to-[#100D1A]/80 border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-purple-300 font-bold">Temporada de Gamificação</span>
                <span className="text-emerald-400 font-bold">+350 XP Hoje</span>
              </div>

              {/* Progress visual in text box */}
              <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                <div className="h-full w-[71.6%] bg-gradient-to-r from-purple-500 via-violet-400 to-cyan-400 shadow-[0_0_15px_rgba(139,92,246,0.8)]" />
              </div>

              <div className="flex justify-between text-[11px] font-mono text-gray-400">
                <span>NXT Level 3</span>
                <span className="text-white font-bold">2.150 / 3.000 XP para Nível 4</span>
              </div>
            </div>
          </div>
        </section>

        {/* -----------------------------------------------------------------------
            SECTION 4: CALL TO ACTION & SUPABASE LOGIN (Scroll 80% - 100%)
            Phone aligned vertically on Left -> Auth Card on the Right
        ----------------------------------------------------------------------- */}
        <section
          id="secao-login"
          className="min-h-screen flex flex-col justify-center items-end px-4 sm:px-12 max-w-7xl mx-auto py-24 pointer-events-none"
        >
          <div className="max-w-md w-full pointer-events-auto space-y-6">
            <div className="space-y-2">
              <Badge className="bg-purple-950/60 border-purple-500/40 text-purple-300 font-mono text-xs">
                ACESSO IMEDIATO • RLS SEGURO
              </Badge>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Entre no NXTGEN
              </h2>
              <p className="text-xs text-gray-400 font-sans">
                Acesse sua carteira de benefícios ou crie sua conta sem confirmação de e-mail.
              </p>
            </div>

            {currentUser ? (
              <Card className="bg-[#0F121C]/90 border border-emerald-500/40 backdrop-blur-xl p-6 space-y-4 shadow-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600/30 border border-purple-400/50 flex items-center justify-center font-mono font-bold text-white">
                    {currentUser.name ? currentUser.name[0] : "U"}
                  </div>
                  <div>
                    <h3 className="font-heading text-white font-bold">{currentUser.name}</h3>
                    <p className="text-xs font-mono text-gray-400">{currentUser.email} • Nível {currentUser.nxtLevel}</p>
                  </div>
                </div>
                <div className="pt-2 flex flex-col gap-2 font-mono text-xs">
                  <button
                    onClick={() => router.push("/pass")}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-cyan-500 text-white font-bold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(139,92,246,0.6)] cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <span>Abrir Minha Carteira NXT PASS</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => logout()}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Sair da Conta
                  </button>
                </div>
              </Card>
            ) : (
              <Card className="bg-[#0F121C]/90 border border-purple-500/30 backdrop-blur-xl shadow-[0_15px_45px_rgba(0,0,0,0.8),0_0_25px_rgba(139,92,246,0.2)]">
                <CardHeader className="pb-4">
                  <Tabs value={authTab} onValueChange={(val) => setAuthTab(val as "login" | "signup")} className="w-full">
                    <TabsList className="grid grid-cols-2 bg-black/50 border border-white/10 p-1 w-full">
                      <TabsTrigger
                        value="login"
                        className="text-xs font-mono font-bold data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                      >
                        <LogIn className="w-3.5 h-3.5 mr-1.5" />
                        Entrar
                      </TabsTrigger>
                      <TabsTrigger
                        value="signup"
                        className="text-xs font-mono font-bold data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                      >
                        <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                        Criar Conta
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>

                <CardContent className="space-y-4">
                  {authSuccessMsg && (
                    <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center space-x-2 animate-pulse">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>{authSuccessMsg}</span>
                    </div>
                  )}

                  {authErrorMsg && (
                    <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{authErrorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                    {authTab === "signup" && (
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-gray-300 uppercase">Nome Completo</label>
                        <Input
                          type="text"
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          placeholder="Ex: Rafael Molina"
                          required
                          className="bg-black/60 border-white/10 text-white placeholder-gray-600 focus-visible:border-purple-500 font-sans"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-gray-300 uppercase">E-mail</label>
                      <div className="relative">
                        <Input
                          type="email"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          placeholder="rafael.molina@nxtgen.app"
                          required
                          className="bg-black/60 border-white/10 text-white placeholder-gray-600 focus-visible:border-purple-500 font-sans"
                        />
                        <Mail className="w-4 h-4 text-gray-500 absolute right-3 top-2.5 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-gray-300 uppercase">Senha</label>
                      <div className="relative">
                        <Input
                          type="password"
                          value={authPass}
                          onChange={(e) => setAuthPass(e.target.value)}
                          placeholder="••••••••••••"
                          required
                          className="bg-black/60 border-white/10 text-white placeholder-gray-600 focus-visible:border-purple-500 font-sans"
                        />
                        <Lock className="w-4 h-4 text-gray-500 absolute right-3 top-2.5 pointer-events-none" />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-5 bg-gradient-to-r from-purple-600 via-violet-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(139,92,246,0.6)] cursor-pointer"
                    >
                      {authLoading ? (
                        <span className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Processando...
                        </span>
                      ) : authTab === "login" ? (
                        "Acessar Plataforma"
                      ) : (
                        "Ativar Conta Instantânea"
                      )}
                    </Button>
                  </form>

                  {/* Quick Demo Credentials */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-gray-400">
                    <span className="flex items-center">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                      Auto-confirmação ativa
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthTab("login");
                        setAuthEmail("rafael.molina@nxtgen.app");
                        setAuthPass("Nxtgen2026!");
                        setAuthErrorMsg("");
                      }}
                      className="text-cyan-400 hover:underline cursor-pointer"
                    >
                      Preencher Demo
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

      </div>

      {/* =========================================================================
          TECHNICAL FOOTER
      ========================================================================= */}
      <footer className="border-t border-white/10 py-10 px-6 sm:px-12 bg-[#050608] text-xs font-mono text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-heading text-white font-bold text-sm tracking-tighter">NXTGEN</span>
            <span>• ECOSSISTEMA MULTI-TENANT & RLS BANCÁRIO</span>
          </div>
          <div className="flex items-center space-x-6 text-gray-400">
            <span>Fase 1: NXT PASS</span>
            <span>Fase 2: NXT BANK</span>
            <span>Fase 3: NXT LIVE</span>
          </div>
          <div className="text-gray-600">
            © 2026 NXTGEN. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
