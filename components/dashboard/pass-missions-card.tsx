"use client";

import React from "react";
import { PassMission } from "@/lib/pass-data";

interface PassMissionsCardProps {
  missions: PassMission[];
}

export function PassMissionsCard({ missions }: PassMissionsCardProps) {
  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold font-heading text-white">
          Missões do Passe
        </h2>
        <span className="text-xs font-heading text-purple-400">
          Pontos para subir de nível
        </span>
      </div>

      {missions.length === 0 ? (
        <div className="p-6 rounded-xl bg-[#090A0F] border border-white/10 text-center">
          <p className="text-xs font-heading text-gray-400">
            Nenhuma missão disponível no momento. Novas tarefas serão adicionadas em breve!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {missions.map((m) => {
          const percent = Math.min(100, Math.round((m.progress / m.total) * 100));
          return (
            <div
              key={m.id}
              className="p-4 rounded-xl bg-[#090A0F] border border-white/10 space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-heading">
                <span className="font-bold text-white">{m.title}</span>
                <span className="text-purple-400 font-bold">+{m.xpReward} XP</span>
              </div>
              <p className="text-xs font-heading text-gray-400">{m.description}</p>

              {/* Progress bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] font-heading text-gray-500">
                  <span>Progresso</span>
                  <span>
                    {m.isCompleted ? "Concluído" : `${m.progress} / ${m.total}`}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      m.isCompleted ? "bg-emerald-400" : "bg-[#8B24F0]"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
