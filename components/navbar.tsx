"use client";

import Link from "next/link";
import { Sparkles, Wallet, LogOut, LogIn, Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#08080a]/90 backdrop-blur-md border-b border-white/10 px-4 py-3 font-sans">
      <div className="flex items-center justify-between">
        {user ? (
          /* Logged In User Info */
          <div className="flex items-center space-x-3">
            <Link href="/perfil" className="relative group">
              <div className="w-9 h-9 rounded-none border border-white/20 overflow-hidden bg-surface">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-400 w-2 h-2" />
            </Link>
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-400 font-mono">Olá,</span>
                <span className="text-xs font-bold text-white tracking-tight">
                  {user.name.split(" ")[0]}
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-0.5 font-mono text-[10px]">
                <span className="text-brand-cyan font-bold">
                  {user.nxtScore.toLocaleString()} PTS
                </span>
                <span className="text-gray-500">|</span>
                <span className="text-gray-400 font-bold">
                  NVL {user.nxtLevel.toString().padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Guest Info */
          <div className="flex items-center space-x-2">
            <Link href="/" className="font-display font-black text-sm tracking-tight text-white">
              NXTGEN<span className="text-brand-cyan">.</span>
            </Link>
          </div>
        )}

        {/* Right Side: Wallet & Logout / Login */}
        <div className="flex items-center space-x-2">
          {user ? (
            <>
              <div className="flex items-center space-x-1.5 bg-[#0f1015] px-2.5 py-1.5 border border-white/10 font-mono">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400">
                  {formatCurrency(user.walletBalance)}
                </span>
              </div>

              <button
                onClick={logout}
                title="Encerrar Sessão"
                className="p-2 border border-white/10 bg-[#0f1015] text-gray-400 hover:text-white hover:border-white/30 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2 font-mono text-xs">
              <Link
                href="/login"
                className="px-3 py-1.5 border border-white/10 hover:border-white text-white transition-colors"
              >
                ENTRAR
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
