"use client";

import Link from "next/link";
import { Sparkles, Wallet, ShieldCheck, Bell } from "lucide-react";
import { DEMO_USER } from "@/lib/store/mock-db";
import { formatCurrency } from "@/lib/utils";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/5 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* User Info & Avatar */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-indigo-500/40 shadow-glow">
              <img
                src={DEMO_USER.avatarUrl}
                alt={DEMO_USER.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-[#0a0b10]" />
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-400">Olá,</span>
              <span className="text-xs font-semibold text-white">{DEMO_USER.name.split(" ")[0]} 👋</span>
            </div>
            {/* NXT Score Badge */}
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Sparkles className="w-2.5 h-2.5 mr-0.5 text-indigo-400" />
                {DEMO_USER.nxtScore.toLocaleString()} PTS
              </span>
              <span className="text-[10px] font-bold text-gray-400">
                NVL {DEMO_USER.nxtLevel.toString().padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Wallet & Alerts */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 bg-surface/80 px-2.5 py-1.5 rounded-lg border border-white/5">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400">
              {formatCurrency(DEMO_USER.walletBalance)}
            </span>
          </div>

          <button className="p-2 rounded-lg bg-surface/80 border border-white/5 text-gray-300 hover:text-white transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
}
