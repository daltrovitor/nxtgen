"use client";

import React from "react";
import Image from "next/image";
import { LogOut, QrCode } from "lucide-react";
import { User } from "@/hooks/use-auth";

interface PassHeaderProps {
  user: User;
  onLogout: () => void;
  onViewShowcase?: () => void;
  activeVouchersCount: number;
  onOpenVouchers: () => void;
}

export function PassHeader({
  user,
  onLogout,
  onViewShowcase,
  activeVouchersCount,
  onOpenVouchers,
}: PassHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#000000] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onViewShowcase}>
          <Image
            src="/logonxtgen.png"
            alt="NXTGEN"
            width={2065}
            height={762}
            className="h-8 sm:h-9 w-auto object-contain"
            style={{ width: "auto" }}
            priority
          />
          <span className="hidden sm:inline text-xs font-heading font-bold uppercase tracking-wider text-purple-400">
            NXT PASS
          </span>
        </div>

        {/* Right Section: Vouchers Button, User info, Logout */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Meus Vouchers Button */}
          <button
            onClick={onOpenVouchers}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white font-heading text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-purple-400" />
            <span>Meus Vouchers</span>
            {activeVouchersCount > 0 && (
              <span className="px-1.5 py-0.2 rounded bg-[#8B24F0] text-white text-[10px] font-bold">
                {activeVouchersCount}
              </span>
            )}
          </button>

          {/* User Name & Level */}
          <div className="flex items-center space-x-2 text-xs font-heading">
            <span className="text-gray-300 font-medium hidden sm:inline">
              {(user?.name || (user as any)?.fullName || "Membro").split(" ")[0]}
            </span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-purple-300 text-[11px] font-bold">
              Level {user.nxtLevel || 3}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            title="Sair"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
