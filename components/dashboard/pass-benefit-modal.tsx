"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Loader2 } from "lucide-react";
import { Benefit } from "@/lib/pass-data";

interface PassBenefitModalProps {
  benefit: Benefit | null;
  isOpen: boolean;
  onClose: () => void;
  onRedeemBenefit: (benefit: Benefit) => Promise<void>;
  isAlreadyRedeemed?: boolean;
  onOpenVoucherDrawer?: () => void;
}

export function PassBenefitModal({
  benefit,
  isOpen,
  onClose,
  onRedeemBenefit,
  isAlreadyRedeemed = false,
  onOpenVoucherDrawer,
}: PassBenefitModalProps) {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!isOpen || !benefit) return null;

  const rawBanner = benefit.partnerBanner?.trim();
  const rawLogo = benefit.partnerLogo?.trim();
  const validSrc = (!imageError && (rawBanner || rawLogo)) || null;

  const handleRedeem = async () => {
    try {
      setIsRedeeming(true);
      await onRedeemBenefit(benefit);
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-card text-card-foreground border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Image / Fallback */}
        <div className="relative h-44 w-full bg-muted flex items-center justify-center overflow-hidden">
          {validSrc ? (
            <Image
              src={validSrc}
              alt={benefit.partnerName || "Benefício"}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-muted to-muted/80 p-4 text-center">
              <span className="text-4xl font-extrabold font-heading text-purple-600 dark:text-purple-400 tracking-wider">
                {(benefit.partnerName || "NXT").slice(0, 2).toUpperCase()}
              </span>
              <span className="text-xs font-heading font-medium text-muted-foreground mt-1">
                {benefit.partnerName}
              </span>
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-background/80 hover:bg-background text-foreground border border-border/50 flex items-center justify-center cursor-pointer transition-colors shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-3 z-10">
            <span className="px-2.5 py-1 rounded bg-[#8B24F0] text-white text-xs font-heading font-bold shadow-md">
              {benefit.discountLabel}
            </span>
          </div>
        </div>

        {/* Modal Info */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-heading text-muted-foreground">
              <span>{benefit.partnerName}</span>
              <span>{benefit.partnerLocation}</span>
            </div>
            <h2 className="text-xl font-bold font-heading text-foreground">
              {benefit.title}
            </h2>
            <p className="text-xs text-muted-foreground font-heading leading-relaxed">
              {benefit.description}
            </p>
          </div>

          {/* Rules */}
          <div className="space-y-2 pt-2 border-t border-border">
            <h4 className="text-xs font-heading font-bold text-foreground/80 uppercase tracking-wider">
              Regras do Benefício
            </h4>
            <ul className="space-y-1 text-xs font-heading text-foreground/90 list-disc list-inside">
              {benefit.terms.map((term, i) => (
                <li key={i}>{term}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 border-t border-border bg-muted/30">
          {isAlreadyRedeemed ? (
            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-xs font-heading font-medium text-emerald-700 dark:text-emerald-300">
                  ✓ Você já possui um voucher ativo para este benefício!
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenVoucherDrawer?.();
                }}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-bold text-sm flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-md"
              >
                <span>VER MEU QR CODE ATIVO</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleRedeem}
              disabled={isRedeeming}
              className="w-full py-3 rounded-xl bg-[#8B24F0] hover:bg-[#701AC5] text-white font-heading font-bold text-sm flex items-center justify-center space-x-2 transition-colors cursor-pointer disabled:opacity-50 shadow-md"
            >
              {isRedeeming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gerando QR Code...</span>
                </>
              ) : (
                <span>USAR BENEFÍCIO (GERAR VOUCHER)</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
