"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Phone3DModel } from "@/components/phone-3d-model";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  AlertCircle,
  Loader2,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Gamepad2,
  ChevronDown,
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

  // Smooth spring physics for silky real-time scroll tracking with momentum
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 22,
    mass: 0.55,
    restDelta: 0.0005,
  });

  // =========================================================================
  // 3D PHONE MOTION TRANSFORMATIONS
  // Fluid, dynamic trajectory: sweeps, rolls and pitches across sections,
  // and settles smoothly at the exact user-specified anchor point beside the auth card.
  // =========================================================================
  const rotateXDesktop = useTransform(
    smoothProgress,
    [0, 0.20, 0.38, 0.54, 0.72, 0.88, 1],
    [7, 14, 8, 14, 10, 5, 2]
  );
  const rotateYDesktop = useTransform(
    smoothProgress,
    [0, 0.20, 0.38, 0.54, 0.72, 0.88, 1],
    [-18, -32, -26, 32, 26, 14, 10]
  );
  const rotateZDesktop = useTransform(
    smoothProgress,
    [0, 0.20, 0.38, 0.54, 0.72, 0.88, 1],
    [2, -4, -2, 5, 3, 1, 0]
  );
  const xDesktop = useTransform(
    smoothProgress,
    [0, 0.20, 0.38, 0.54, 0.72, 0.88, 1],
    [260, 280, 280, -280, -285, -270, -270]
  );
  const scaleDesktop = useTransform(
    smoothProgress,
    [0, 0.20, 0.38, 0.54, 0.72, 0.88, 1],
    [0.91, 0.93, 0.94, 0.94, 0.92, 0.86, 0.85]
  );

  // Vertical trajectory: elevates squarely to -45px at the end,
  // perfectly aligned with the auth card and never descending into the footer.
  const yDesktop = useTransform(
    smoothProgress,
    [0, 0.20, 0.38, 0.54, 0.72, 0.88, 1],
    [0, 30, 45, 30, 0, -35, -45]
  );

  // Mobile responsive transforms:
  // Stationary top stage on mobile, larger heroic presence
  const rotateXMobile = useTransform(smoothProgress, [0, 1], [6, 6]);
  const rotateYMobile = useTransform(smoothProgress, [0, 1], [-10, -10]);
  const rotateZMobile = useTransform(smoothProgress, [0, 1], [1, 1]);
  const xMobile = useTransform(smoothProgress, [0, 1], [0, 0]);
  const yMobile = useTransform(smoothProgress, [0, 1], [0, 0]);
  const scaleMobile = useTransform(smoothProgress, [0, 1], [0.82, 0.82]);
  // Phone is ALWAYS 100% visible on mobile, never hidden!
  const opacityMobile = useTransform(smoothProgress, [0, 1], [1, 1]);
  const opacityDesktop = useTransform(smoothProgress, [0, 1], [1, 1]);

  const rotateX = isMobile ? rotateXMobile : rotateXDesktop;
  const rotateY = isMobile ? rotateYMobile : rotateYDesktop;
  const rotateZ = isMobile ? rotateZMobile : rotateZDesktop;
  const x = isMobile ? xMobile : xDesktop;
  const y = isMobile ? yMobile : yDesktop;
  const scale = isMobile ? scaleMobile : scaleDesktop;
  const opacity = isMobile ? opacityMobile : opacityDesktop;

  // Track dynamic state on phone screen based on scroll range
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    return smoothProgress.on("change", (latest) => {
      if (latest < 0.22) setCurrentSection(0);
      else if (latest < 0.50) setCurrentSection(1);
      else if (latest < 0.78) setCurrentSection(2);
      else setCurrentSection(3);
    });
  }, [smoothProgress]);

  // Smooth scroll via Lenis + GSAP ScrollTrigger synchronization
  useEffect(() => {
    const isTouch = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);
    const lenis = new Lenis({
      duration: isTouch ? 0.9 : 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: isTouch ? 1.0 : 1.5,
      syncTouch: false,
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

      // Section 4: Auth Header reveal
      gsap.fromTo(
        ".gsap-auth-header",
        { opacity: 0, y: 25 },
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

      // Section 4: Auth Card Entrance Animation (smooth float-up, de-blur, and 3D scale)
      gsap.fromTo(
        ".gsap-auth-card",
        {
          opacity: 0,
          y: 65,
          scale: 0.92,
          filter: "blur(10px)",
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#secao-login",
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Section 4: Neon Ambient Glow bloom
      gsap.fromTo(
        ".gsap-auth-glow",
        { opacity: 0, scale: 0.8 },
        {
          opacity: 0.85,
          scale: 1,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#secao-login",
            start: "top 80%",
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
  const { login, signup, loginWithGoogle, user: currentUser, logout } = useAuth();
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [authName, setAuthName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authErrorMsg, setAuthErrorMsg] = useState("");
  const [authSuccessMsg, setAuthSuccessMsg] = useState("");

  const handleGoogleAuth = async () => {
    try {
      setGoogleLoading(true);
      setAuthErrorMsg("");
      setAuthSuccessMsg("");
      const res = await loginWithGoogle();
      if (res.success) {
        setAuthSuccessMsg(
          authTab === "login"
            ? "Conectado com o Google com sucesso!"
            : "Conta criada e conectada com o Google!"
        );
      } else {
        setAuthErrorMsg(res.error || "Falha ao autenticar com o Google.");
      }
    } catch (err: any) {
      setAuthErrorMsg(err.message || "Erro de conexão com o Google.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorMsg("");
    setAuthSuccessMsg("");
    setAuthLoading(true);

    try {
      if (authTab === "login") {
        const res = await login(authEmail, authPass);
        if (res.success) {
          setAuthSuccessMsg("Login realizado com sucesso! Bem-vindo ao NXTGEN.");
        } else {
          setAuthErrorMsg(res.error || "Credenciais incorretas. Verifique seu e-mail e senha.");
        }
      } else {
        const res = await signup(authName, authEmail, authPass);
        if (res.success) {
          setAuthSuccessMsg("Conta criada com sucesso! Bem-vindo ao NXTGEN.");
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

  const scrollToSection = (index: number) => {
    if (!containerRef.current) return;
    const totalHeight = containerRef.current.scrollHeight;
    const offsets = [0, 0.28, 0.56, 0.84];
    const targetScroll = containerRef.current.offsetTop + totalHeight * offsets[index];
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  return (
    <div className="relative w-full bg-[#000000] text-[#F3F4F6]">
      {/* =========================================================================
          DEDICATED SCROLLYTELLING CONTAINER (EXCLUDING FOOTER)
      ========================================================================= */}
      <div ref={containerRef} className="relative w-full">

        {/* =========================================================================
            3D PHONE VIEWPORT
            - On Desktop: Fullscreen sticky stage (h-screen) with 2-column lateral trajectory
            - On Mobile: Stationary at top (relative, below header), scrolls away naturally
        ========================================================================= */}
        <div className="relative md:sticky md:top-0 w-full flex items-center justify-center pointer-events-none z-20 overflow-hidden mt-[52px] md:mt-0 h-[calc(100vh-52px-45px)] min-h-[500px] md:h-screen bg-[#000000] border-b border-white/10 md:bg-transparent md:border-b-0">
          {/* Subtle Mobile Ambient Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.22),transparent_70%)] pointer-events-none md:hidden" />

          <motion.div
            style={{
              x,
              y,
              scale,
              opacity,
            }}
            className={cn(
              "transition-shadow",
              isMobile ? "pointer-events-none" : "pointer-events-auto"
            )}
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

          {/* Simple static "Role para explorar" under the phone - ONLY on mobile */}
          <div className="md:hidden absolute bottom-2 left-0 right-0 flex items-center justify-center pointer-events-none z-30">
            <span className="text-[11px] font-mono tracking-wider text-gray-400/80 flex items-center space-x-1.5">
              <span>Role para explorar</span>
              <span className="text-xs text-gray-500">↓</span>
            </span>
          </div>
        </div>

      {/* =========================================================================
          SCROLLYTELLING SECTIONS - DESKTOP 2-COLUMN VIEW (md:block)
      ========================================================================= */}
      <div className="hidden md:block relative z-30 -mt-[100vh]">

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
          className="min-h-[135vh] flex flex-col justify-end pb-12 sm:justify-center px-4 sm:px-12 max-w-7xl mx-auto py-36 pointer-events-none"
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
          className="min-h-[135vh] flex flex-col justify-end pb-12 sm:justify-center items-end px-4 sm:px-12 max-w-7xl mx-auto py-36 pointer-events-none"
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
          className="min-h-screen flex flex-col justify-center items-end px-4 sm:px-12 max-w-7xl mx-auto py-16 sm:py-24 pointer-events-none"
        >
          <div className="max-w-md w-full pointer-events-auto space-y-6">
            <div className="gsap-auth-header space-y-2">
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
                    <div className="flex items-center space-x-2">
                      <h3 className="font-heading text-white font-bold">{currentUser.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        currentUser.role === "admin"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                          : "bg-white/10 text-gray-300"
                      }`}>
                        role: {currentUser.role}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-gray-400">{currentUser.email} • Nível {currentUser.nxtLevel}</p>
                  </div>
                </div>
                <div className="pt-2 flex flex-col gap-2 font-mono text-xs">
                  {currentUser.role === "admin" ? (
                    <a
                      href="/admin"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:brightness-110 text-white font-bold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(16,185,129,0.5)] cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Acessar Painel de Admin (/admin)</span>
                    </a>
                  ) : (
                    <a
                      href="/admin"
                      className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-amber-300/80 hover:text-amber-300 border border-amber-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                      <span>Testar Bloqueio de Admin (role = &apos;user&apos;)</span>
                    </a>
                  )}
                  <button
                    onClick={() => {
                      const el = document.getElementById("secao-pass");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-cyan-500 text-white font-bold uppercase tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(139,92,246,0.6)] cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <span>Explorar Benefícios do Meu Nível</span>
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
              <motion.div
                initial={{ opacity: 0, y: 55, scale: 0.94, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="relative group/auth w-full max-w-md mx-auto"
              >
                {/* Futuristic ambient neon bloom behind the card */}
                <div className="gsap-auth-glow absolute -inset-2 rounded-[36px] bg-gradient-to-r from-purple-600/40 via-violet-600/30 to-cyan-500/40 blur-2xl -z-10 pointer-events-none" />

                {/* Animated Entrance Auth Card */}
                <div className="gsap-auth-card relative overflow-hidden rounded-[32px] bg-[#0A0D18]/90 backdrop-blur-3xl border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-7 sm:p-9 text-white w-full">
                  {/* Official Logo Header */}
                  <div className="text-center space-y-2 mb-6">
                    <div className="flex justify-center items-center">
                      <Image
                        src="/logonxtgen.png"
                        alt="NXTGEN"
                        width={2065}
                        height={762}
                        className="h-12 sm:h-14 w-auto object-contain drop-shadow-[0_0_25px_rgba(139,92,246,0.6)]"
                        style={{ width: "auto" }}
                      />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-400 font-sans">
                      Seu ecossistema de benefícios aguarda
                    </p>
                  </div>

                {authSuccessMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{authSuccessMsg}</span>
                  </div>
                )}

                {authErrorMsg && (
                  <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{authErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authTab === "signup" && (
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="Nome completo"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 text-sm transition-all font-sans"
                      />
                    </div>
                  )}

                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="Endereço de e-mail"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 text-sm transition-all font-sans"
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={authPass}
                      onChange={(e) => setAuthPass(e.target.value)}
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
                    disabled={authLoading}
                    className="relative overflow-hidden group w-full py-3.5 mt-1 bg-gradient-to-r from-[#8B24F0] via-[#9d3df3] to-[#8B24F0] hover:brightness-110 text-white font-bold text-sm rounded-xl shadow-[0_0_25px_rgba(139,36,240,0.55)] hover:shadow-[0_0_40px_rgba(139,36,240,0.9)] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                    <span className="relative z-10 flex items-center justify-center space-x-2">
                      {authLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Processando...</span>
                        </>
                      ) : (
                        <>
                          <span>{authTab === "login" ? "Entrar no NXTGEN" : "Criar Conta NXTGEN"}</span>
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
                  onClick={handleGoogleAuth}
                  disabled={authLoading || googleLoading}
                  className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 flex items-center justify-center space-x-2.5 text-gray-200 hover:text-white transition-all cursor-pointer group shadow-sm disabled:opacity-50"
                  title={authTab === "login" ? "Continuar com o Google" : "Cadastrar com o Google"}
                >
                  {googleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  ) : (
                    <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path d="M12.24 10.285V13.4h6.887C18.2 16.14 15.645 18 12.24 18c-3.315 0-6-2.685-6-6s2.685-6 6-6c1.455 0 2.785.525 3.82 1.39l2.405-2.405C16.92 3.55 14.73 2.6 12.24 2.6 7.07 2.6 2.88 6.79 2.88 12s4.19 9.4 9.36 9.4c5.4 0 8.98-3.79 8.98-9.14 0-.61-.06-1.22-.17-1.975H12.24z" />
                    </svg>
                  )}
                  <span className="text-xs font-semibold font-sans">
                    {googleLoading
                      ? "Conectando ao Google..."
                      : authTab === "login"
                      ? "Continuar com o Google"
                      : "Cadastrar com o Google"}
                  </span>
                </button>

                {/* Footer mode switch */}
                <div className="text-center text-xs text-gray-400 pt-5">
                  {authTab === "login" ? (
                    <>
                      Não tem uma conta?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthTab("signup");
                          setAuthErrorMsg("");
                          setAuthSuccessMsg("");
                        }}
                        className="font-bold text-white hover:text-purple-400 transition-colors ml-1 cursor-pointer"
                      >
                        Criar Conta
                      </button>
                    </>
                  ) : (
                    <>
                      Já tem uma conta?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthTab("login");
                          setAuthErrorMsg("");
                          setAuthSuccessMsg("");
                        }}
                        className="font-bold text-white hover:text-purple-400 transition-colors ml-1 cursor-pointer"
                      >
                        Entrar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
            )}
          </div>
        </section>

      </div>

        {/* =========================================================================
            MOBILE STORYTELLING SECTIONS (md:hidden)
            - Clean vertical layout with tight, continuous spacing between sections
            - Smooth scroll reveal animations on every section & card
            - PC-identical Auth card with official logo, glow, toggle switch & Google auth
        ========================================================================= */}
        <div className="md:hidden relative z-10 divide-y divide-white/10">
          
          {/* Section 1: Hero */}
          <section id="mob-hero" className="scroll-mt-16 py-10 px-5 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-purple-400 font-semibold flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                <span>BUILD. DON&apos;T BET.</span>
              </p>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-white leading-[1.1]">
                The Future <br />
                <span className="bg-gradient-to-r from-purple-400 via-violet-200 to-cyan-300 bg-clip-text text-transparent">
                  Pays More.
                </span>
              </h1>
              <p className="text-sm text-gray-400 font-sans leading-relaxed">
                O super app que transforma hábitos positivos em recompensas reais. Substitua impulsos por salas VIP, cashback e experiências de verdade.
              </p>
              <div className="pt-2 flex flex-col gap-2.5 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("mob-login");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-cyan-500 text-white font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(139,92,246,0.5)] flex items-center justify-center space-x-2 cursor-pointer active:scale-95 transition-all"
                >
                  <span>Criar Conta</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("mob-pass");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#121622]/80 border border-white/10 text-gray-300 hover:text-white font-bold uppercase tracking-wider text-center cursor-pointer transition-all"
                >
                  Explorar Benefícios
                </button>
              </div>
            </motion.div>
          </section>

          {/* Section 2: NXT PASS */}
          <section id="mob-pass" className="scroll-mt-16 py-10 px-5 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-2"
            >
              <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-cyan-400 font-semibold">
                NXT PASS • Clube de Benefícios
              </p>
              <h2 className="font-heading text-2xl font-bold text-white tracking-tight leading-tight">
                Descontos reais. <br />
                <span className="text-cyan-400">Vantagens exclusivas.</span>
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Um marketplace exclusivo direto no seu bolso. Acesse salas VIP em aeroportos, cashback instantâneo via Pix e cupons digitais protegidos.
              </p>
            </motion.div>

            <div className="space-y-3 pt-2 font-sans">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="p-3.5 rounded-xl bg-[#0d1017] border border-cyan-500/20 space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <h3 className="text-xs font-bold text-white">Salas VIP & Lounges</h3>
                </div>
                <p className="text-[11px] text-gray-400 pl-4">Acesso a lounges em aeroportos e upgrades selecionados.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="p-3.5 rounded-xl bg-[#0d1017] border border-purple-500/20 space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                  <h3 className="text-xs font-bold text-white">Cashback via Pix</h3>
                </div>
                <p className="text-[11px] text-gray-400 pl-4">Economia real de 20% a 50% em estabelecimentos credenciados.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="p-3.5 rounded-xl bg-[#0d1017] border border-blue-500/20 space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <h3 className="text-xs font-bold text-white">Cupons Digitais Protegidos</h3>
                </div>
                <p className="text-[11px] text-gray-400 pl-4">Geração de códigos únicos para validação direta no balcão.</p>
              </motion.div>
            </div>
          </section>

          {/* Section 3: Gamificação */}
          <section id="mob-gamify" className="scroll-mt-16 py-10 px-5 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-2"
            >
              <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-purple-400 font-semibold">
                NXT Score & Progressão
              </p>
              <h2 className="font-heading text-2xl font-bold text-white tracking-tight leading-tight">
                As bets lucram com a perda. <br />
                <span className="bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">
                  Nós premiamos você.
                </span>
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                Cada hábito saudável pontua no seu <strong className="text-white">NXT Level</strong>: economizar, completar metas e participar dos eventos.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="p-4 rounded-2xl bg-[#13111C] border border-purple-500/20 space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-purple-300 font-medium">Temporada Atual</span>
                <span className="text-emerald-400 font-bold">+350 XP Hoje</span>
              </div>
              <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  initial={{ width: "0%" }}
                  whileInView={{ width: "71.6%" }}
                  viewport={{ once: false }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-purple-500 via-violet-400 to-cyan-400"
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-gray-400">
                <span>NXT Level 3</span>
                <span className="text-white font-bold">2.150 / 3.000 XP</span>
              </div>
            </motion.div>
          </section>

          {/* Section 4: Login & Cadastro (Identical to Desktop) */}
          <section id="mob-login" className="scroll-mt-16 py-10 px-4 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-center space-y-1"
            >
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-purple-400 font-semibold">
                Acesso à Plataforma
              </p>
              <h2 className="font-heading text-2xl font-bold text-white tracking-tight">
                {currentUser ? "Sua Conta NXTGEN" : authTab === "login" ? "Entre no NXTGEN" : "Crie sua Conta"}
              </h2>
              <p className="text-xs text-gray-400 font-sans">
                Acesse sua carteira de benefícios ou cadastre-se para começar.
              </p>
            </motion.div>

            {currentUser ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                className="p-5 rounded-3xl bg-[#0F121C] border border-emerald-500/40 space-y-4 shadow-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600/30 border border-purple-400/50 flex items-center justify-center font-mono font-bold text-white text-base">
                    {currentUser.name ? currentUser.name[0] : "U"}
                  </div>
                  <div>
                    <h3 className="font-heading text-white font-bold text-sm">{currentUser.name}</h3>
                    <p className="text-xs font-mono text-gray-400">{currentUser.email} • Nível {currentUser.nxtLevel}</p>
                  </div>
                </div>
                <div className="space-y-2.5 font-mono text-xs">
                  {currentUser.role === "admin" && (
                    <a
                      href="/admin"
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold uppercase tracking-wider flex items-center justify-center space-x-2 text-center text-xs"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Painel Admin</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="w-full py-2.5 rounded-xl bg-white/5 text-gray-400 hover:text-white border border-white/10 text-center cursor-pointer text-xs"
                  >
                    Sair da Conta
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 35, scale: 0.95, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative group/auth w-full max-w-md mx-auto"
              >
                {/* Futuristic ambient neon bloom behind the card */}
                <div className="absolute -inset-2 rounded-[36px] bg-gradient-to-r from-purple-600/35 via-violet-600/25 to-cyan-500/35 blur-xl -z-10 pointer-events-none" />

                {/* Exact PC Match Auth Card */}
                <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] bg-[#0A0D18]/90 backdrop-blur-3xl border border-white/10 shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-6 sm:p-8 text-white w-full">
                  {/* Official Logo Header */}
                  <div className="text-center space-y-1.5 mb-5">
                    <div className="flex justify-center items-center">
                      <Image
                        src="/logonxtgen.png"
                        alt="NXTGEN"
                        width={2065}
                        height={762}
                        className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_0_20px_rgba(139,92,246,0.6)]"
                        style={{ width: "auto" }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 font-sans">
                      Seu ecossistema de benefícios aguarda
                    </p>
                  </div>

                  {authSuccessMsg && (
                    <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>{authSuccessMsg}</span>
                    </div>
                  )}

                  {authErrorMsg && (
                    <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{authErrorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                    {authTab === "signup" && (
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          placeholder="Nome completo"
                          required
                          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 text-sm transition-all font-sans"
                        />
                      </div>
                    )}

                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="Endereço de e-mail"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 text-sm transition-all font-sans"
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={authPass}
                        onChange={(e) => setAuthPass(e.target.value)}
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
                      disabled={authLoading}
                      className="relative overflow-hidden group w-full py-3.5 mt-1 bg-gradient-to-r from-[#8B24F0] via-[#9d3df3] to-[#8B24F0] hover:brightness-110 text-white font-bold text-sm rounded-xl shadow-[0_0_25px_rgba(139,36,240,0.55)] hover:shadow-[0_0_40px_rgba(139,36,240,0.9)] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                      <span className="relative z-10 flex items-center justify-center space-x-2">
                        {authLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Processando...</span>
                          </>
                        ) : (
                          <>
                            <span>{authTab === "login" ? "Entrar no NXTGEN" : "Criar Conta NXTGEN"}</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </span>
                    </button>
                  </form>

                  {/* Quick access separator */}
                  <div className="relative flex py-3.5 items-center">
                    <div className="flex-grow border-t border-white/10"></div>
                    <span className="flex-shrink mx-3 text-gray-400 text-xs font-sans">
                      acesso rápido via
                    </span>
                    <div className="flex-grow border-t border-white/10"></div>
                  </div>

                  {/* Google Button */}
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={authLoading || googleLoading}
                    className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 flex items-center justify-center space-x-2.5 text-gray-200 hover:text-white transition-all cursor-pointer group shadow-sm disabled:opacity-50"
                  >
                    {googleLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                    ) : (
                      <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                        <path d="M12.24 10.285V13.4h6.887C18.2 16.14 15.645 18 12.24 18c-3.315 0-6-2.685-6-6s2.685-6 6-6c1.455 0 2.785.525 3.82 1.39l2.405-2.405C16.92 3.55 14.73 2.6 12.24 2.6 7.07 2.6 2.88 6.79 2.88 12s4.19 9.4 9.36 9.4c5.4 0 8.98-3.79 8.98-9.14 0-.61-.06-1.22-.17-1.975H12.24z" />
                      </svg>
                    )}
                    <span className="text-xs font-semibold font-sans">
                      {googleLoading
                        ? "Conectando ao Google..."
                        : authTab === "login"
                        ? "Continuar com o Google"
                        : "Cadastrar com o Google"}
                    </span>
                  </button>

                  {/* Footer mode switch */}
                  <div className="text-center text-xs text-gray-400 pt-4">
                    {authTab === "login" ? (
                      <>
                        Não tem uma conta?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setAuthTab("signup");
                            setAuthErrorMsg("");
                            setAuthSuccessMsg("");
                          }}
                          className="font-bold text-white hover:text-purple-400 transition-colors ml-1 cursor-pointer"
                        >
                          Criar Conta
                        </button>
                      </>
                    ) : (
                      <>
                        Já tem uma conta?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setAuthTab("login");
                            setAuthErrorMsg("");
                            setAuthSuccessMsg("");
                          }}
                          className="font-bold text-white hover:text-purple-400 transition-colors ml-1 cursor-pointer"
                        >
                          Entrar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </section>

        </div>
      </div>

      {/* =========================================================================
          FOOTER COM LOGO OFICIAL (Visible and functional on Mobile & Desktop)
      ========================================================================= */}
      <footer className="border-t border-white/10 pt-8 pb-14 sm:py-8 px-6 sm:px-12 bg-[#000000] text-xs font-mono text-gray-500 relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
            <Image
              src="/logonxtgen.png"
              alt="NXTGEN"
              width={2065}
              height={762}
              className="h-10 sm:h-12 md:h-14 w-auto object-contain opacity-95 hover:opacity-100 hover:scale-105 transition-all drop-shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              style={{ width: "auto" }}
            />
          </div>
          <div className="flex flex-wrap justify-center items-center gap-6 text-gray-400">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById(isMobile ? "mob-pass" : "secao-pass");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              NXT PASS
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById(isMobile ? "mob-gamify" : "secao-gamificacao");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Evolução
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById(isMobile ? "mob-login" : "secao-login");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Entrar
            </button>
          </div>
          <div className="text-gray-600 text-center sm:text-right">
            © 2026 NXTGEN. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
