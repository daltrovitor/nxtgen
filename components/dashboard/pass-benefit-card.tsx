"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Benefit } from "@/lib/pass-data";

interface PassBenefitCardProps {
  benefit: Benefit;
  onSelect: (benefit: Benefit) => void;
  isAlreadyRedeemed?: boolean;
}

export function PassBenefitCard({ benefit, onSelect, isAlreadyRedeemed = false }: PassBenefitCardProps) {
  const [imageError, setImageError] = useState(false);

  const rawBanner = benefit.partnerBanner?.trim();
  const rawLogo = benefit.partnerLogo?.trim();
  const validSrc = (!imageError && (rawBanner || rawLogo)) || null;

  return (
    <div
      onClick={() => onSelect(benefit)}
      className={`group rounded-xl bg-card text-card-foreground border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer ${
        isAlreadyRedeemed
          ? "border-emerald-500/40 hover:border-emerald-500/80 bg-emerald-500/[0.02]"
          : "border-border hover:border-purple-500/50"
      }`}
    >
      {/* Cover Image / Fallback */}
      <div className="relative h-40 w-full overflow-hidden bg-muted flex items-center justify-center">
        {validSrc ? (
          <Image
            src={validSrc}
            alt={benefit.partnerName || "Benefício"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-muted to-muted/80 p-4 text-center">
            <span className="text-3xl font-extrabold font-heading text-purple-600 dark:text-purple-400 tracking-wider">
              {(benefit.partnerName || "NXT").slice(0, 2).toUpperCase()}
            </span>
            <span className="text-xs font-heading font-medium text-muted-foreground mt-1">
              {benefit.partnerName}
            </span>
          </div>
        )}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-md bg-[#8B24F0] text-white text-[11px] font-heading font-bold shadow-md">
            {benefit.discountLabel}
          </span>
          {isAlreadyRedeemed && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-heading font-bold shadow-md">
              ✓ Resgatado
            </span>
          )}
        </div>
      </div>

      {/* Card Info */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-heading text-muted-foreground">
            <span>{benefit.partnerName}</span>
            <span>{benefit.partnerLocation}</span>
          </div>
          <h3 className="font-heading font-bold text-foreground text-base leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
            {benefit.title}
          </h3>
          <p className="text-xs text-muted-foreground font-heading line-clamp-2 leading-relaxed">
            {benefit.description}
          </p>
        </div>

        <div className="pt-2 border-t border-border flex items-center justify-between text-xs font-heading">
          <span className="text-muted-foreground">
            {isAlreadyRedeemed ? "Voucher no balcão" : "Benefício do Clube"}
          </span>
          <span
            className={
              isAlreadyRedeemed
                ? "text-emerald-600 dark:text-emerald-400 font-semibold group-hover:underline"
                : "text-purple-600 dark:text-purple-400 font-semibold group-hover:underline"
            }
          >
            {isAlreadyRedeemed ? "Ver meu voucher →" : "Usar benefício →"}
          </span>
        </div>
      </div>
    </div>
  );
}
