"use client";

import { Navbar } from "@/components/navbar";
import { BottomNav } from "@/components/bottom-nav";
import { DEMO_USER } from "@/lib/store/mock-db";
import { Sparkles, Trophy, Award, Shield, Lock, Bell, ChevronRight } from "lucide-react";

export default function PerfilPage() {
  const badges = [
    { icon: "🏃", label: "NXT RUN", desc: "Corredor Oficial" },
    { icon: "🚀", label: "FUNDADORES", desc: "Early Adopter Alpha" },
    { icon: "🎟️", label: "NXT AO VIVO", desc: "Acesso a Festivais" },
    { icon: "💡", label: "NÍVEL NXT", desc: "Mentoria Ativa" },
    { icon: "🧠", label: "NXT EU", desc: "Mentalidade de Crescimento" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 px-4 py-4 space-y-4">
        {/* Profile Card */}
        <div className="p-5 rounded-3xl glass-panel-glow border border-indigo-500/30 text-center relative overflow-hidden">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-indigo-500 mx-auto shadow-glow">
            <img
              src={DEMO_USER.avatarUrl}
              alt={DEMO_USER.name}
              className="w-full h-full object-cover"
            />
          </div>

          <h2 className="text-lg font-black text-white mt-3">{DEMO_USER.name}</h2>
          <p className="text-xs text-gray-400">{DEMO_USER.email}</p>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10">
            <div className="p-2.5 rounded-2xl bg-surface/80 border border-white/5">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400">
                Nível NXT
              </span>
              <p className="text-lg font-black text-indigo-400">
                Nível {DEMO_USER.nxtLevel.toString().padStart(2, "0")}
              </p>
            </div>
            <div className="p-2.5 rounded-2xl bg-surface/80 border border-white/5">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400">
                Pontuação NXT
              </span>
              <p className="text-lg font-black text-amber-400">
                {DEMO_USER.nxtScore.toLocaleString()} PTS
              </p>
            </div>
          </div>
        </div>

        {/* Badges / Distintivos */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 flex items-center">
            <Trophy className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
            Distintivos & Conquistas
          </h3>

          <div className="grid grid-cols-3 gap-2">
            {badges.map((b) => (
              <div
                key={b.label}
                className="p-3 rounded-2xl glass-panel border border-white/5 text-center flex flex-col items-center justify-center space-y-1 hover:border-indigo-500/30 transition-all"
              >
                <span className="text-2xl">{b.icon}</span>
                <span className="text-[11px] font-bold text-white line-clamp-1">{b.label}</span>
                <span className="text-[9px] text-gray-400 line-clamp-1">{b.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Settings */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 flex items-center">
            <Shield className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            Segurança & Conta
          </h3>

          <div className="space-y-2">
            <div className="p-3 rounded-2xl glass-panel border border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Autenticação Blindada</h4>
                  <p className="text-[10px] text-gray-400">Sem confirmação de e-mail obrigatória</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Ativo
              </span>
            </div>

            <div className="p-3 rounded-2xl glass-panel border border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Tokens Criptográficos</h4>
                  <p className="text-[10px] text-gray-400">Proteção anti-screenshot HMAC SHA-256</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                Seguro
              </span>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
