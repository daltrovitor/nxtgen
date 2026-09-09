"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Wifi,
  Signal,
  Battery,
  Bell,
  Plane,
  Sparkles,
  CreditCard,
  ChevronRight,
  Home,
  Wallet,
  TrendingUp,
  Gift,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Phone3DProps {
  highlightBenefits?: boolean;
  animateXp?: boolean;
  className?: string;
  glowIntensity?: number;
}

export function Phone3D({
  highlightBenefits = false,
  animateXp = false,
  className,
  glowIntensity = 1,
}: Phone3DProps) {
  return (
    <div
      className={cn(
        "relative select-none perspective-1200 transition-transform duration-300",
        className
      )}
    >
      {/* Background Multi-layer Ambient Backlight (Glow Purple & Glow Cyan) */}
      <div
        className="absolute -inset-4 rounded-[60px] bg-gradient-to-tr from-purple-600/30 via-violet-500/20 to-cyan-400/25 blur-2xl -z-10 transition-opacity duration-700 pointer-events-none"
        style={{ opacity: glowIntensity }}
      />
      <div
        className="absolute -inset-10 rounded-[80px] bg-purple-600/15 blur-3xl -z-20 pointer-events-none animate-pulse"
        style={{ animationDuration: "6s" }}
      />

      {/* Outer Titanium Chassis (Deep Titanium Violet Finish) */}
      <div className="relative w-[310px] sm:w-[330px] h-[640px] sm:h-[680px] rounded-[52px] p-[10px] bg-gradient-to-b from-[#2E243F] via-[#1E172B] to-[#14101E] border border-purple-400/25 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_-5px_rgba(139,92,246,0.35)]">
        
        {/* Chamfered Metallic Edge Highlight */}
        <div className="absolute inset-0 rounded-[52px] ring-1 ring-white/15 pointer-events-none" />

        {/* Side Hardware Buttons */}
        {/* Left: Action Button & Volume */}
        <div className="absolute -left-[3px] top-[105px] w-[3px] h-[26px] bg-gradient-to-b from-purple-400/60 to-purple-800/80 rounded-l-sm" />
        <div className="absolute -left-[3px] top-[148px] w-[3px] h-[46px] bg-gradient-to-b from-purple-400/60 to-purple-800/80 rounded-l-sm" />
        <div className="absolute -left-[3px] top-[204px] w-[3px] h-[46px] bg-gradient-to-b from-purple-400/60 to-purple-800/80 rounded-l-sm" />

        {/* Right: Power / Siri Button */}
        <div className="absolute -right-[3px] top-[150px] w-[3px] h-[72px] bg-gradient-to-b from-purple-400/60 to-purple-800/80 rounded-r-sm" />

        {/* Inner Black OLED Bezel */}
        <div className="relative w-full h-full rounded-[44px] bg-[#050608] overflow-hidden border border-black/80 flex flex-col justify-between shadow-inner">
          
          {/* Top Glass Glare Overlay (Diagonal Sheen) */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.08] pointer-events-none z-30" />

          {/* =========================================================
              STATUS BAR & DYNAMIC ISLAND
          ========================================================= */}
          <div className="relative z-20 pt-3 px-6 flex items-center justify-between text-[11px] font-mono text-gray-200">
            {/* Time */}
            <span className="font-bold tracking-tight text-white/90">9:41</span>

            {/* Dynamic Island */}
            <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-[96px] h-[26px] bg-black rounded-full flex items-center justify-between px-2.5 shadow-md border border-white/5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#0d0f17] ring-1 ring-white/10 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-blue-950/80" />
              </div>
              <div className="w-2 h-2 rounded-full bg-[#0a0c12] ring-1 ring-white/5" />
            </div>

            {/* Status Icons */}
            <div className="flex items-center space-x-1.5 text-gray-300">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <div className="relative flex items-center">
                <Battery className="w-4 h-4 text-gray-200" />
                <div className="absolute left-[2px] top-[4.5px] w-[8px] h-[4px] bg-white rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* =========================================================
              PHONE SCREEN CONTENT (Fiel à interface do usuário)
          ========================================================= */}
          <div className="flex-1 px-4 pt-4 pb-2 flex flex-col justify-between overflow-y-auto scrollbar-none relative z-10">
            
            {/* Top Bar with Bell */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-purple-950/40 border border-purple-500/30 text-[10px] font-mono text-purple-300">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                <span>NXT PASS ATIVO</span>
              </div>

              <div className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                <Bell className="w-4 h-4 text-gray-300" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full ring-2 ring-black" />
              </div>
            </div>

            {/* Header Greeting */}
            <div className="space-y-1 mt-1">
              <div className="flex items-center space-x-1.5">
                <h3 className="font-sans text-base sm:text-lg font-bold text-white tracking-tight">
                  Bom dia, Rafael 👋
                </h3>
              </div>
              <p className="text-xs font-semibold text-purple-300">
                Você está evoluindo!
              </p>
              <p className="text-[11px] text-gray-400 leading-tight">
                Continue assim para desbloquear novas recompensas.
              </p>
            </div>

            {/* Card de Nível: NXT Level 3 com Badge Hexagonal */}
            <div className="rounded-2xl p-3.5 bg-gradient-to-br from-[#1A1528] via-[#120F1D] to-[#0D0B14] border border-purple-500/30 shadow-[0_4px_20px_-5px_rgba(139,92,246,0.25)] relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                    Seu nível atual
                  </span>
                  <span className="text-sm font-bold text-white font-heading">
                    NXT Level 3
                  </span>
                </div>

                {/* Hexagonal Neon Badge com o número 3 */}
                <div className="relative flex items-center justify-center">
                  <div className="w-9 h-9 bg-purple-600/30 rounded-lg rotate-45 border border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)] flex items-center justify-center">
                    <span className="-rotate-45 font-mono font-black text-sm text-white">
                      3
                    </span>
                  </div>
                </div>
              </div>

              {/* Barra de Progresso XP com Animação em Tempo Real */}
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-purple-300 font-medium">XP da Temporada</span>
                  <span className="text-gray-300 font-bold">2.150 / 3.000 XP</span>
                </div>

                <div className="w-full h-2 bg-black/60 rounded-full p-[1px] overflow-hidden border border-white/5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 via-violet-400 to-cyan-400 shadow-[0_0_12px_rgba(139,92,246,0.8)]"
                    initial={{ width: "45%" }}
                    animate={{ width: animateXp ? "71.6%" : "60%" }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </div>

            {/* Grid de Benefícios: 3 Cards Estilizados */}
            <div
              className={cn(
                "space-y-2 rounded-2xl p-2.5 transition-all duration-500",
                highlightBenefits
                  ? "bg-purple-950/25 ring-1 ring-purple-500/50 shadow-[0_0_25px_rgba(139,92,246,0.3)]"
                  : "bg-transparent"
              )}
            >
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-gray-300 font-heading">
                  Seus benefícios
                </span>
                <span className="text-[10px] font-mono text-purple-400 hover:text-purple-300 cursor-pointer flex items-center">
                  Ver todos <ChevronRight className="w-3 h-3 ml-0.5" />
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* 1. Salas VIP (Avião Roxo) */}
                <div className="p-2.5 rounded-xl bg-[#141220]/90 border border-purple-500/20 flex flex-col items-center text-center space-y-1 hover:border-purple-400/40 transition-all">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                    <Plane className="w-3.5 h-3.5 text-purple-300" />
                  </div>
                  <span className="text-[10px] font-bold text-white leading-tight">
                    Salas VIP
                  </span>
                  <span className="text-[8px] text-purple-300/80 font-mono">
                    Ilimitado
                  </span>
                </div>

                {/* 2. Cashback R$ 45,00 (Ciano) */}
                <div className="p-2.5 rounded-xl bg-[#0F1622]/90 border border-cyan-500/20 flex flex-col items-center text-center space-y-1 hover:border-cyan-400/40 transition-all">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  </div>
                  <span className="text-[10px] font-bold text-white leading-tight">
                    Cashback
                  </span>
                  <span className="text-[8px] text-cyan-300 font-mono font-bold">
                    R$ 45,00
                  </span>
                </div>

                {/* 3. Anuidade Grátis (Azul) */}
                <div className="p-2.5 rounded-xl bg-[#101526]/90 border border-blue-500/20 flex flex-col items-center text-center space-y-1 hover:border-blue-400/40 transition-all">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                    <CreditCard className="w-3.5 h-3.5 text-blue-300" />
                  </div>
                  <span className="text-[10px] font-bold text-white leading-tight">
                    Anuidade
                  </span>
                  <span className="text-[8px] text-blue-300/80 font-mono">
                    Grátis
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Micro-Banner: Build. Don't Bet. */}
            <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-950/60 to-cyan-950/40 border border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-mono text-gray-300">Meta Semanal: Poupança</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400">+150 XP</span>
            </div>
          </div>

          {/* =========================================================
              BOTTOM NAVIGATION BAR (Início, Conta, Investir, Benefícios, Perfil)
          ========================================================= */}
          <div className="relative z-20 px-3 py-2.5 bg-[#090A0E] border-t border-white/10 flex items-center justify-around text-gray-400">
            <button className="flex flex-col items-center space-y-0.5 hover:text-white transition-colors">
              <Home className="w-3.5 h-3.5" />
              <span className="text-[8px] font-mono">Início</span>
            </button>

            <button className="flex flex-col items-center space-y-0.5 hover:text-white transition-colors">
              <Wallet className="w-3.5 h-3.5" />
              <span className="text-[8px] font-mono">Conta</span>
            </button>

            <button className="flex flex-col items-center space-y-0.5 hover:text-white transition-colors">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-[8px] font-mono">Investir</span>
            </button>

            {/* Active Tab: Benefícios (Destaque Roxo Neon) */}
            <button className="flex flex-col items-center space-y-0.5 text-purple-400 relative">
              <div className="p-1 rounded-md bg-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.5)]">
                <Gift className="w-3.5 h-3.5 text-purple-300" />
              </div>
              <span className="text-[8px] font-mono font-bold text-white">Benefícios</span>
              <div className="w-3 h-0.5 bg-purple-400 rounded-full" />
            </button>

            <button className="flex flex-col items-center space-y-0.5 hover:text-white transition-colors">
              <User className="w-3.5 h-3.5" />
              <span className="text-[8px] font-mono">Perfil</span>
            </button>
          </div>

          {/* iOS Home Indicator Bar */}
          <div className="w-full pb-1.5 flex justify-center bg-[#090A0E]">
            <div className="w-32 h-1 bg-white/30 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
