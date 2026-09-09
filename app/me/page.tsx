'use client';

import React from 'react';
import { HeartHandshake, ShieldCheck, Lock, UserCheck } from 'lucide-react';

export default function MePage() {
  return (
    <div className="flex flex-col w-full min-h-[100dvh] px-4 pt-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase text-[#F5A623] tracking-widest bg-[#F5A623]/10 px-2.5 py-0.5 rounded-full border border-[#F5A623]/30">
            SAÚDE EMOCIONAL • PRIORIDADE 5
          </span>
          <h1 className="text-xl font-black text-white mt-1">NXT ME</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center">
          <HeartHandshake className="w-4 h-4 text-[#F5A623]" />
        </div>
      </div>

      <div className="p-4 rounded-3xl bg-gradient-to-r from-[#F5A623]/15 to-[#7928CA]/15 border border-[#F5A623]/30 space-y-2">
        <h2 className="text-sm font-extrabold text-white">"Cuidar da cabeça também é subir de nível."</h2>
        <p className="text-xs text-neutral-300 leading-relaxed">
          Terapia e acolhimento com profissionais credenciados que entendem as cobranças e transições da sua geração.
        </p>
      </div>

      <div className="bg-[#0B0F19] rounded-2xl p-4 border border-white/[0.06] space-y-2.5">
        <div className="flex items-center gap-2 text-[#00F0FF]">
          <Lock className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wide">Blindagem Total de Privacidade (LGPD + RLS)</span>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Consultas e prontuários são criptografados e acessíveis estritamente entre você e seu especialista. Nenhum dado de saúde é exposto a terceiros ou empresas.
        </p>
      </div>
    </div>
  );
}
