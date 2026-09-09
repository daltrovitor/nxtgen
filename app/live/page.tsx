'use client';

import React from 'react';
import { Ticket, Calendar, MapPin, QrCode, Sparkles } from 'lucide-react';

export default function LivePage() {
  return (
    <div className="flex flex-col w-full min-h-[100dvh] px-4 pt-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase text-[#FF0080] tracking-widest bg-[#FF0080]/10 px-2.5 py-0.5 rounded-full border border-[#FF0080]/30">
            EVENTOS • PRIORIDADE 3
          </span>
          <h1 className="text-xl font-black text-white mt-1">NXT LIVE</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center">
          <Ticket className="w-4 h-4 text-[#FF0080]" />
        </div>
      </div>

      <div className="double-bezel-shell">
        <div className="double-bezel-core p-4 space-y-3">
          <div className="relative h-36 rounded-2xl overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop&q=80" 
              alt="NXT Founders Event"
              className="w-full h-full object-cover" 
            />
            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black text-[#FF0080] border border-[#FF0080]/30">
              PRÓXIMO EVENTO
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#00F0FF] uppercase tracking-wider">NXT UP • INGRESSOS</span>
            <h3 className="text-sm font-black text-white">NXT Founders Summit 2026</h3>
            <div className="flex items-center gap-3 text-neutral-400 text-xs mt-1">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> 24 Out • 19h</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> JK Iguatemi, SP</span>
            </div>
          </div>

          <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FF0080] to-[#7928CA] text-white font-black text-xs tracking-wide shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5">
            <QrCode className="w-4 h-4" />
            <span>Garantir Ingresso com QR Dinâmico</span>
          </button>
        </div>
      </div>
    </div>
  );
}
