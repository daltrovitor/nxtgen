"use client";

import React from "react";
import { User } from "@/hooks/use-auth";

interface PassLevelBannerProps {
  user: User;
}

export function PassLevelBanner({ user }: PassLevelBannerProps) {
  const level = user.nxtLevel ?? 1;
  const score = user.nxtScore ?? 0;
  const levelTarget = 1000;
  const percent = Math.min(100, Math.round((score / levelTarget) * 100));

  return (
    <div className="rounded-2xl bg-[#090A0F] border border-white/10 p-5 sm:p-7">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        {/* Left Side: Greeting & Status */}
        <div className="space-y-1">
          <p className="text-xs font-heading font-medium text-gray-400">
            Olá, {(user?.name || (user as any)?.fullName || "Membro").split(" ")[0]}
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
            Você está evoluindo!
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-heading">
            Continue assim para desbloquear novas recompensas.
          </p>
        </div>

        {/* Right Side: Level Card with XP Track */}
        <div className="w-full md:w-80 p-4 rounded-xl bg-black/60 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-heading text-gray-400 uppercase tracking-wider block">
                Seu nível atual
              </span>
              <span className="text-base font-bold font-heading text-white">
                NXT Level {level}
              </span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-[#8B24F0] flex items-center justify-center font-heading font-extrabold text-sm text-white">
              {level}
            </div>
          </div>

          {/* XP Track */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-heading text-gray-400">
              <span>{score.toLocaleString("pt-BR")} / {levelTarget.toLocaleString("pt-BR")} XP</span>
              <span className="text-purple-400 font-semibold">{percent}%</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#8B24F0] rounded-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
