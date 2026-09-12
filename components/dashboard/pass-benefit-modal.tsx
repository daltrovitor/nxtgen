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
}

export function PassBenefitModal({
  benefit,
  isOpen,
  onClose,
  onRedeemBenefit,
}: PassBenefitModalProps) {
  const [isRedeeming, setIsRedeeming] = useState(false);

  if (!isOpen || !benefit) return null;

  const handleRedeem = async () => {
    try {
      setIsRedeeming(true);
      await onRedeemBenefit(benefit);
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#0B0C12] border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Image */}
        <div className="relative h-44 w-full bg-black">
          <Image
            src={benefit.partnerBanner}
            alt={benefit.partnerName}
            fill
            className="object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 text-gray-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 left-3">
            <span className="px-2.5 py-1 rounded bg-[#8B24F0] text-white text-xs font-heading font-bold">
              {benefit.discountLabel}
            </span>
          </div>
        </div>

        {/* Modal Info */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-heading text-gray-400">
              <span>{benefit.partnerName}</span>
              <span>{benefit.partnerLocation}</span>
            </div>
            <h2 className="text-xl font-bold font-heading text-white">
              {benefit.title}
            </h2>
            <p className="text-xs text-gray-300 font-heading leading-relaxed">
              {benefit.description}
            </p>
          </div>

          {/* Rules */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <h4 className="text-xs font-heading font-bold text-gray-400 uppercase tracking-wider">
              Regras do Benefício
            </h4>
            <ul className="space-y-1 text-xs font-heading text-gray-300 list-disc list-inside">
              {benefit.terms.map((term, i) => (
                <li key={i}>{term}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 border-t border-white/10 bg-[#090A0F]">
          <button
            onClick={handleRedeem}
            disabled={isRedeeming}
            className="w-full py-3 rounded-xl bg-[#8B24F0] hover:bg-[#701AC5] text-white font-heading font-bold text-sm flex items-center justify-center space-x-2 transition-colors cursor-pointer disabled:opacity-50"
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
        </div>
      </div>
    </div>
  );
}
