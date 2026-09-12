"use client";

import React from "react";
import Image from "next/image";
import { Benefit } from "@/lib/pass-data";

interface PassBenefitCardProps {
  benefit: Benefit;
  onSelect: (benefit: Benefit) => void;
}

export function PassBenefitCard({ benefit, onSelect }: PassBenefitCardProps) {
  return (
    <div
      onClick={() => onSelect(benefit)}
      className="group rounded-xl bg-[#090A0F] border border-white/10 hover:border-purple-500/50 transition-colors overflow-hidden flex flex-col cursor-pointer"
    >
      {/* Cover Image */}
      <div className="relative h-40 w-full overflow-hidden bg-black/50">
        <Image
          src={benefit.partnerBanner}
          alt={benefit.partnerName}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-102 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-md bg-[#8B24F0] text-white text-[11px] font-heading font-bold shadow-md">
            {benefit.discountLabel}
          </span>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-heading text-gray-400">
            <span>{benefit.partnerName}</span>
            <span>{benefit.partnerLocation}</span>
          </div>
          <h3 className="font-heading font-bold text-white text-base leading-snug group-hover:text-purple-300 transition-colors">
            {benefit.title}
          </h3>
          <p className="text-xs text-gray-400 font-heading line-clamp-2 leading-relaxed">
            {benefit.description}
          </p>
        </div>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-heading">
          <span className="text-gray-400">Benefício do Clube</span>
          <span className="text-purple-400 font-semibold group-hover:underline">
            Usar benefício →
          </span>
        </div>
      </div>
    </div>
  );
}
