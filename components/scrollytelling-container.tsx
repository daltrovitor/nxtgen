"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Phone3DModel } from "@/components/phone-3d-model";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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
    [14, 14, 8, 14, 2]
  );
  const rotateYDesktop = useTransform(
    smoothProgress,
    [0, 0.2, 0.45, 0.75, 1],
    [-18, -18, -34, 32, -8]
  );
  const rotateZDesktop = useTransform(
    smoothProgress,
    [0, 0.2, 0.45, 0.75, 1],
    [5, 5, -5, 6, 0]
  );
  const xDesktop = useTransform(
    smoothProgress,
    [0, 0.2, 0.45, 0.75, 1],
    [220, 220, 330, -330, -270]
  );
  const scaleDesktop = useTransform(
    smoothProgress,
    [0, 0.2, 0.45, 0.75, 1],
    [1.0, 1.0, 1.08, 1.08, 0.98]
  );

  // Mobile clamped transforms: dynamic tilts and dock positioning
  const rotateXMobile = useTransform(smoothProgress, [0, 0.35, 0.7, 1], [10, -6, 8, 2]);
  const rotateYMobile = useTransform(smoothProgress, [0, 0.35, 0.7, 1], [-14, 18, -14, 0]);
  const rotateZMobile = useTransform(smoothProgress, [0, 0.35, 0.7, 1], [3, -3, 3, 0]);
  const xMobile = useTransform(smoothProgress, [0, 1], [0, 0]);
  const yMobile = useTransform(
    smoothProgress,
    [0, 0.25, 0.55, 0.8, 1],
    [-185, -165, -165, -175, -200]
  );
  const scaleMobile = useTransform(smoothProgress, [0, 1], [0.55, 0.55]);

  const rotateX = isMobile ? rotateXMobile : rotateXDesktop;
  const rotateY = isMobile ? rotateYMobile : rotateYDesktop;
  const rotateZ = isMobile ? rotateZMobile : rotateZDesktop;
  const x = isMobile ? xMobile : xDesktop;
  const y = isMobile ? yMobile : undefined;
  const scale = isMobile ? scaleMobile : scaleDesktop;

  // Pure black start: ambient radial and tech grid fade in as scroll begins
  const ambientGlowOpacity = useTransform(smoothProgress, [0, 0.12], [0, 1]);

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

  // Smooth scroll via Lenis + GSAP ScrollTrigger synchronization
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      // Hero reveal
      gsap.fromTo(
        [".gsap-hero-tag", ".gsap-hero-title", ".gsap-hero-sub", ".gsap-hero-cta"],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power3.out", delay: 0.2 }
      );

      // Section 2: NXT PASS benefits reveal on scroll
      gsap.fromTo(
        [".gsap-pass-tag", ".gsap-pass-title", ".gsap-pass-desc"],
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#secao-pass",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
      gsap.fromTo(
        ".gsap-pass-item",
        { opacity: 0, x: -25 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#secao-pass",
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Section 3: Gamification reveal on scroll
      gsap.fromTo(
        [".gsap-gamify-tag", ".gsap-gamify-title", ".gsap-gamify-desc", ".gsap-gamify-card"],
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#secao-gamificacao",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Section 4: Auth reveal
      gsap.fromTo(
        ".gsap-auth-reveal",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#secao-login",
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, containerRef);

    return () => {
      ctx.revert();
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
    };
  }, []);

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
          setAuthSuccessMsg("Login realizado com sucesso! Redirecionando...");
          setTimeout(() => {
            router.push("/pass");
          }, 700);
        } else {
          setAuthErrorMsg(res.error || "Credenciais incorretas. Verifique seu e-mail e senha.");
        }
      } else {
        const res = await signup(authName, authEmail, authPass);
        if (res.success) {
          setAuthSuccessMsg("Conta criada com sucesso! Redirecionando...");
          setTimeout(() => {
            router.push("/pass");
          }, 700);
        } else {
          setAuthErrorMsg(res.error || "Não foi possível criar a conta.");
        }
      }
    } catch (err: any) {
      setAuthErrorMsg(err.message || "Erro ao conectar com o servidor.");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full bg-[#000000] text-[#F3F4F6]">
      
      {/* Ambient Radial Background & Technical Grid (fades in as user scrolls) */}
      <motion.div
        style={{ opacity: ambientGlowOpacity }}
        className="fixed inset-0 bg-tech-grid bg-radial-gradient pointer-events-none -z-10"
      />

      {/* =========================================================================
          STICKY 3D PHONE VIEWPORT
      ========================================================================= */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center pointer-events-none z-20 overflow-hidden">
        <motion.div
          style={{
            x,
            y,
            scale,
          }}
          className="pointer-events-auto transition-shadow"
        >
          <Phone3DModel
            highlightBenefits={currentSection === 1}
            animateXp={currentSection >= 2}
            glowIntensity={currentSection === 1 ? 1.4 : currentSection === 2 ? 1.6 : 1}
            rotationX={rotateX}
            rotationY={rotateY}
            rotationZ={rotateZ}
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
        <section className="min-h-screen flex flex-col justify-end pb-12 sm:justify-center px-4 sm:px-12 max-w-7xl mx-auto py-20 pointer-events-none">
          <div className="max-w-md lg:max-w-lg space-y-6 pointer-events-auto p-6 sm:p-0 rounded-3xl sm:rounded-none bg-[#08090C]/90 sm:bg-transparent backdrop-blur-xl sm:backdrop-blur-none border border-white/10 sm:border-none shadow-2xl sm:shadow-none">
            
            {/* Tagline Sem Balão */}
            <p className="gsap-hero-tag text-xs font-mono uppercase tracking-[0.25em] text-purple-400 font-semibold">
              Build. Don&apos;t Bet.
            </p>

            {/* Title */}
            <h1 className="gsap-hero-title font-heading text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.05]">
              The Future <br />
              <span className="bg-gradient-to-r from-purple-400 via-violet-200 to-cyan-300 bg-clip-text text-transparent">
                Pays More.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="gsap-hero-sub text-base sm:text-lg text-gray-400 font-sans leading-relaxed">
              O super app que transforma hábitos positivos em recompensas. 
              Substitua impulsos por salas VIP, cashback, investimentos e experiências reais.
            </p>

            {/* CTAs */}
            <div className="gsap-hero-cta pt-2 flex flex-wrap gap-4 font-mono text-xs">
              <a
                href="#secao-login"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-cyan-500 text-white font-bold uppercase tracking-wider shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
              >
                <span>Criar Conta</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#secao-pass"
                className="px-6 py-3.5 rounded-xl bg-[#121622]/80 border border-white/10 hover:border-purple-400/40 text-gray-300 hover:text-white font-bold uppercase tracking-wider transition-all"
              >
                Explorar Benefícios
              </a>
            </div>

            {/* Scroll Indicator Sem Ícones Exagerados */}
            <p className="pt-8 text-xs font-mono text-gray-500">
              Role para explorar ↓
            </p>
          </div>
        </section>

        {/* -----------------------------------------------------------------------
            SECTION 2: NXT PASS — CLUBE DE EXPERIÊNCIAS (Scroll 25% - 55%)
            Phone moves to the Right -> Content on the Left
        ----------------------------------------------------------------------- */}
        <section
          id="secao-pass"
          className="min-h-screen flex flex-col justify-end pb-12 sm:justify-center px-4 sm:px-12 max-w-7xl mx-auto py-24 pointer-events-none"
        >
          <div className="max-w-md lg:max-w-lg space-y-6 pointer-events-auto p-6 sm:p-0 rounded-3xl sm:rounded-none bg-[#08090C]/90 sm:bg-transparent backdrop-blur-xl sm:backdrop-blur-none border border-white/10 sm:border-none shadow-2xl sm:shadow-none">
            
            <p className="gsap-pass-tag text-xs font-mono uppercase tracking-[0.25em] text-cyan-400 font-semibold">
              NXT PASS • Clube de Benefícios
            </p>

            <h2 className="gsap-pass-title font-heading text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              Descontos reais. <br />
              <span className="text-cyan-400">Vantagens exclusivas.</span>
            </h2>

            <p className="gsap-pass-desc text-sm sm:text-base text-gray-400 leading-relaxed font-sans">
              Um marketplace independente direto no seu bolso. Acesse experiências únicas, gastronomia selecionada, moda streetwear e tecnologia com vantagens de verdade.
            </p>

            {/* Lista Editorial Limpa Sem Ícones Exagerados */}
            <div className="space-y-4 pt-2 font-sans">
              <div className="gsap-pass-item border-l-2 border-cyan-400/60 pl-4 py-1">
                <h3 className="text-sm font-bold text-white">Salas VIP & Viagens</h3>
                <p className="text-xs text-gray-400">Acesso a lounges em aeroportos e upgrades selecionados.</p>
              </div>

              <div className="gsap-pass-item border-l-2 border-purple-400/60 pl-4 py-1">
                <h3 className="text-sm font-bold text-white">Cashback Instantâneo via Pix</h3>
                <p className="text-xs text-gray-400">Economia real de 20% a 50% em estabelecimentos credenciados.</p>
              </div>

              <div className="gsap-pass-item border-l-2 border-blue-400/60 pl-4 py-1">
                <h3 className="text-sm font-bold text-white">Cupons Digitais Protegidos</h3>
                <p className="text-xs text-gray-400">Geração de códigos exclusivos direto no celular para uso no balcão.</p>
              </div>
            </div>
          </div>
        </section>

        {/* -----------------------------------------------------------------------
            SECTION 3: GAMIFICAÇÃO & EVOLUÇÃO (Scroll 55% - 80%)
            Phone moves to the Left -> Content on the Right
        ----------------------------------------------------------------------- */}
        <section
          id="secao-gamificacao"
          className="min-h-screen flex flex-col justify-end pb-12 sm:justify-center items-end px-4 sm:px-12 max-w-7xl mx-auto py-24 pointer-events-none"
        >
          <div className="max-w-md lg:max-w-lg space-y-6 pointer-events-auto text-left pl-0 md:pl-6 p-6 sm:p-0 rounded-3xl sm:rounded-none bg-[#08090C]/90 sm:bg-transparent backdrop-blur-xl sm:backdrop-blur-none border border-white/10 sm:border-none shadow-2xl sm:shadow-none">
            
            <p className="gsap-gamify-tag text-xs font-mono uppercase tracking-[0.25em] text-purple-400 font-semibold">
              NXT Score & Progressão
            </p>

            <h2 className="gsap-gamify-title font-heading text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              As bets lucram com a perda. <br />
              <span className="bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">
                Nós premiamos suas conquistas.
              </span>
            </h2>

            <p className="gsap-gamify-desc text-sm sm:text-base text-gray-400 leading-relaxed font-sans">
              Cada hábito saudável pontua no seu <strong className="text-white">NXT Level</strong>: economizar, completar metas e participar dos eventos da comunidade. 
              Suba de nível e desbloqueie limites diferenciados, anuidade zero e benefícios maiores.
            </p>

            <div className="gsap-gamify-card p-4 rounded-2xl bg-[#13111C] border border-purple-500/20 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-purple-300 font-medium">Temporada Atual</span>
                <span className="text-emerald-400 font-bold">+350 XP Hoje</span>
              </div>

              {/* Progress visual in text box */}
              <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/5">
                <div className="h-full w-[71.6%] bg-gradient-to-r from-purple-500 via-violet-400 to-cyan-400" />
              </div>

              <div className="flex justify-between text-[11px] font-mono text-gray-400">
                <span>NXT Level 3</span>
                <span className="text-white font-bold">2.150 / 3.000 XP</span>
              </div>
            </div>
          </div>
        </section>

        {/* -----------------------------------------------------------------------
            SECTION 4: ACESSO & CADASTRO (Scroll 80% - 100%)
            Phone aligned vertically on Left -> Auth Card on the Right
        ----------------------------------------------------------------------- */}
        <section
          id="secao-login"
          className="min-h-screen flex flex-col justify-end pb-12 sm:justify-center items-end px-4 sm:px-12 max-w-7xl mx-auto py-24 pointer-events-none"
        >
          <div className="gsap-auth-reveal max-w-md w-full pointer-events-auto space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-mono uppercase tracking-[0.25em] text-purple-400 font-semibold">
                Acesso à Plataforma
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Entre no NXTGEN
              </h2>
              <p className="text-xs text-gray-400 font-sans">
                Acesse sua carteira de benefícios ou cadastre-se para começar.
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
                    <span>Abrir Carteira de Benefícios</span>
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
              <Card className="bg-[#0F121C]/90 border border-purple-500/30 backdrop-blur-xl shadow-2xl">
                <CardHeader className="pb-4">
                  <Tabs value={authTab} onValueChange={(val) => setAuthTab(val as "login" | "signup")} className="w-full">
                    <TabsList className="grid grid-cols-2 bg-black/50 border border-white/10 p-1 w-full">
                      <TabsTrigger
                        value="login"
                        className="text-xs font-mono font-bold data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                      >
                        Entrar
                      </TabsTrigger>
                      <TabsTrigger
                        value="signup"
                        className="text-xs font-mono font-bold data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                      >
                        Criar Conta
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>

                <CardContent className="space-y-4">
                  {authSuccessMsg && (
                    <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
                      {authSuccessMsg}
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
                      <Input
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="rafael.molina@nxtgen.app"
                        required
                        className="bg-black/60 border-white/10 text-white placeholder-gray-600 focus-visible:border-purple-500 font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-gray-300 uppercase">Senha</label>
                      <Input
                        type="password"
                        value={authPass}
                        onChange={(e) => setAuthPass(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="bg-black/60 border-white/10 text-white placeholder-gray-600 focus-visible:border-purple-500 font-sans"
                      />
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
                        "Criar Conta"
                      )}
                    </Button>
                  </form>

                  {/* Preencher Demo Limpo */}
                  <div className="pt-2 border-t border-white/10 flex justify-end text-[11px] font-mono">
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
          FOOTER COM LOGO OFICIAL
      ========================================================================= */}
      <footer className="border-t border-white/10 py-8 px-6 sm:px-12 bg-[#050608] text-xs font-mono text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <Image
              src="/logonxtgen.png"
              alt="NXTGEN"
              width={130}
              height={36}
              className="h-7 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
          <div className="flex items-center space-x-6 text-gray-400">
            <a href="/pass" className="hover:text-white transition-colors">NXT PASS</a>
            <a href="/validador" className="hover:text-white transition-colors">Validador</a>
            <a href="#secao-login" className="hover:text-white transition-colors">Entrar</a>
          </div>
          <div className="text-gray-600">
            © 2026 NXTGEN. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
