'use client';

import React from 'react';
import { TrendingUp, PieChart, ShieldCheck, Sparkles } from 'lucide-react';

export default function InvestPage() {
  return (
    <div className="flex flex-col w-full min-h-[100dvh] px-4 pt-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase text-[#10B981] tracking-widest bg-[#10B981]/10 px-2.5 py-0.5 rounded-full border border-[#10B981]/30">
            INVESTIMENTOS • PRIORIDADE 4
          </span>
          <h1 className="text-xl font-black text-white mt-1">NXT INVEST</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-[#10B981]" />
        </div>
      </div>

      <div className="double-bezel-shell">
        <div className="double-bezel-core p-5 space-y-4">
          <span className="text-xs text-neutral-400 font-semibold">"Seu dinheiro pode trabalhar para você."</span>
          <div className="text-2xl font-black text-white">
            R$ 8.450<span className="text-sm text-neutral-400">,80</span>
          </div>
          <div className="text-xs text-[#10B981] font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> +14,2% acumulado neste ciclo
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="bg-[#05070E] p-3 rounded-xl border border-white/[0.06]">
              <span className="text-[10px] text-neutral-500 font-bold block">Fundo Futuro Alpha</span>
              <span className="text-xs font-black text-white">CDI + 2.5% a.a.</span>
            </div>
            <div className="bg-[#05070E] p-3 rounded-xl border border-white/[0.06]">
              <span className="text-[10px] text-neutral-500 font-bold block">Meu Primeiro Aporte</span>
              <span className="text-xs font-black text-[#00F0FF]">A partir de R$ 10</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
