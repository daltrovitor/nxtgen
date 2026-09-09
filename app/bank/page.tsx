'use client';

import React from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, CreditCard, ShieldCheck, Lock } from 'lucide-react';

export default function BankPage() {
  return (
    <div className="flex flex-col w-full min-h-[100dvh] px-4 pt-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase text-[#7928CA] tracking-widest bg-[#7928CA]/10 px-2.5 py-0.5 rounded-full border border-[#7928CA]/30">
            FINTECH • PRIORIDADE 2
          </span>
          <h1 className="text-xl font-black text-white mt-1">NXT BANK</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-[#7928CA]" />
        </div>
      </div>

      {/* Cartão de Saldo Digital */}
      <div className="double-bezel-shell">
        <div className="double-bezel-core p-5 space-y-4 bg-gradient-to-br from-[#111827] via-[#0B0F19] to-[#05070E]">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold">
            <span>Conta Digital NXT</span>
            <span className="text-[#00F0FF] text-[11px] font-mono">BaaS Conectado</span>
          </div>

          <div>
            <span className="text-xs text-neutral-500 font-medium">Saldo Disponível</span>
            <div className="text-3xl font-black text-white tracking-tight mt-0.5">
              R$ 1.250<span className="text-lg text-neutral-400">,00</span>
            </div>
          </div>

          {/* Ações Rápidas Pix */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <button className="flex flex-col items-center justify-center py-2.5 px-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-[#7928CA]/50 active:scale-95 transition-all">
              <ArrowUpRight className="w-4 h-4 text-[#00F0FF] mb-1" />
              <span className="text-[11px] font-bold text-white">Pagar Pix</span>
            </button>
            <button className="flex flex-col items-center justify-center py-2.5 px-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-[#7928CA]/50 active:scale-95 transition-all">
              <ArrowDownLeft className="w-4 h-4 text-[#7928CA] mb-1" />
              <span className="text-[11px] font-bold text-white">Receber</span>
            </button>
            <button className="flex flex-col items-center justify-center py-2.5 px-2 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-[#7928CA]/50 active:scale-95 transition-all">
              <CreditCard className="w-4 h-4 text-[#FF0080] mb-1" />
              <span className="text-[11px] font-bold text-white">Cartão</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tese Comportamental do Banco */}
      <div className="bg-[#0B0F19] rounded-2xl p-4 border border-white/[0.06] space-y-2">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#00F0FF]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Future Rewards™ Integrado</h3>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          "As bets recompensam impulsos. O NXT Bank recompensa escolhas inteligentes." Ciclos sem gastos em apostas geram bônus automáticos no seu NXT Score.
        </p>
      </div>
    </div>
  );
}
