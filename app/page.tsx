"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ScrollytellingContainer } from "@/components/scrollytelling-container";
import { Preloader } from "@/components/preloader";
import { UserDashboard } from "@/components/user-dashboard";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, LogOut, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  const { user, loading, logout } = useAuth();
  const [viewMode, setViewMode] = useState<"dashboard" | "showcase">("dashboard");

  // 1. Instant auth resolution check (prevents guest showcase from flashing when user is logged in)
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-[#8B24F0] animate-spin" />
        <p className="font-mono text-xs text-gray-500 tracking-wider">CARREGANDO...</p>
      </div>
    );
  }

  // 2. If user is logged in: GO STRAIGHT TO THE DASHBOARD
  if (user && viewMode === "dashboard") {
    return (
      <main className="min-h-screen bg-background text-foreground selection:bg-purple-600 selection:text-white">
        <UserDashboard onViewShowcase={() => setViewMode("showcase")} />
      </main>
    );
  }

  // 3. If user is logged in and explicitly chose to explore the 3D showcase
  if (user && viewMode === "showcase") {
    return (
      <main className="min-h-screen bg-background text-foreground selection:bg-purple-600 selection:text-white">
        {/* Top Fixed Header with Back to Dashboard Button */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border px-6 sm:px-10 py-2.5 sm:py-3.5 flex items-center justify-between transition-colors">
          <div
            className="flex items-center group cursor-pointer"
            onClick={() => setViewMode("dashboard")}
          >
            <Image
              src="/logonxtgen.png"
              alt="NXTGEN"
              width={2065}
              height={762}
              className="h-8 sm:h-9 md:h-14 w-auto object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-[0_0_20px_rgba(139,92,246,0.35)]"
              style={{ width: "auto" }}
              priority
            />
          </div>

          <div className="flex items-center space-x-3 font-mono text-xs">
            <ThemeToggle variant="header" />
            <button
              onClick={() => setViewMode("dashboard")}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B24F0] to-[#701AC5] text-white font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(139,36,240,0.5)] hover:brightness-110 cursor-pointer flex items-center space-x-2"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>VOLTAR AO MEU DASHBOARD</span>
            </button>
            <button
              onClick={() => logout()}
              title="Sair da Conta"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Main 3D Scrollytelling Showcase with return handler */}
        <ScrollytellingContainer onGoToDashboard={() => setViewMode("dashboard")} />
      </main>
    );
  }

  // 4. Guest / Unauthenticated: Render full promotional showcase with preloader and login form
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-purple-600 selection:text-white">
      {/* Fast 4s Animated Futuristic Preloader for guests */}
      <Preloader durationMs={3800} />

      {/* Top Fixed Header with Official Logo */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border px-6 sm:px-10 py-2.5 sm:py-3.5 flex items-center justify-between transition-colors">
        <div
          className="flex items-center group cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <Image
            src="/logonxtgen.png"
            alt="NXTGEN"
            width={2065}
            height={762}
            className="h-8 sm:h-9 md:h-14 w-auto object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-[0_0_20px_rgba(139,92,246,0.35)]"
            style={{ width: "auto" }}
            priority
          />
        </div>

        <nav className="flex items-center space-x-3 sm:space-x-5 text-gray-400 text-xs font-mono">
          <a href="#secao-pass" className="hover:text-cyan-400 transition-colors hidden sm:inline">
            NXT PASS
          </a>
          <a
            href="#secao-gamificacao"
            className="hover:text-purple-400 transition-colors hidden sm:inline"
          >
            GAMIFICAÇÃO
          </a>

          <ThemeToggle variant="header" />

          <a
            href="#secao-login"
            className="relative group px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600/40 via-violet-600/40 to-cyan-500/30 hover:from-purple-600 hover:to-cyan-500 text-white border border-purple-500/50 font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:shadow-[0_0_30px_rgba(139,92,246,0.7)] hover:scale-105 active:scale-95 cursor-pointer overflow-hidden"
          >
            <span className="relative z-10 flex items-center space-x-2">
              <span>ENTRAR / CADASTRO</span>
            </span>
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
          </a>
        </nav>
      </header>

      {/* Main 3D Scrollytelling Showcase */}
      <ScrollytellingContainer onGoToDashboard={() => setViewMode("dashboard")} />
    </main>
  );
}
