"use client";

import { Partner, Benefit } from "@/lib/store/mock-db";
import { formatCurrency } from "@/lib/utils";
import { MapPin, Star, ArrowRight, Check } from "lucide-react";

interface PartnerCardProps {
  partner: Partner;
  onSelectBenefit: (partner: Partner, benefit: Benefit) => void;
}

export function PartnerCard({ partner, onSelectBenefit }: PartnerCardProps) {
  const primaryBenefit = partner.benefits[0];

  return (
    <div className="border border-white/10 bg-[#0f1015] hover:border-white/30 transition-all font-sans">
      {/* Banner / Cover */}
      <div className="relative h-36 w-full overflow-hidden bg-black">
        <img
          src={partner.bannerUrl}
          alt={partner.name}
          className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1015] via-transparent to-transparent" />

        <div className="absolute top-3 left-3 bg-black/80 px-2 py-0.5 border border-white/15 text-[10px] font-mono uppercase tracking-wider text-white">
          {partner.categoryName}
        </div>

        <div className="absolute top-3 right-3 flex items-center space-x-1 bg-black/80 px-2 py-0.5 border border-white/15 font-mono text-[10px] text-amber-400 font-bold">
          <Star className="w-3 h-3 fill-amber-400" />
          <span>{partner.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 border border-white/15 overflow-hidden bg-black shrink-0 -mt-6 relative z-10">
              <img
                src={partner.logoUrl}
                alt={partner.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold uppercase text-white tracking-tight">
                {partner.name}
              </h3>
              <p className="text-[11px] text-gray-400 flex items-center mt-0.5 font-mono">
                <MapPin className="w-3 h-3 mr-1 text-gray-500" />
                {partner.location}
              </p>
            </div>
          </div>
        </div>

        {primaryBenefit && (
          <div className="pt-2 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-black text-brand-cyan tracking-wider uppercase border border-brand-cyan/30 px-2 py-0.5 bg-brand-cyan/5">
                {primaryBenefit.discountLabel}
              </span>
              {primaryBenefit.originalPrice && primaryBenefit.promotionalPrice && (
                <div className="text-right font-mono text-xs">
                  <span className="text-gray-500 line-through mr-1.5 text-[11px]">
                    {formatCurrency(primaryBenefit.originalPrice)}
                  </span>
                  <span className="font-bold text-emerald-400">
                    {formatCurrency(primaryBenefit.promotionalPrice)}
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs font-semibold text-white">
              {primaryBenefit.title}
            </p>
            <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed font-sans">
              {primaryBenefit.description}
            </p>

            <button
              onClick={() => onSelectBenefit(partner, primaryBenefit)}
              className="mt-2 w-full py-2.5 px-4 bg-white text-black hover:bg-gray-200 active:scale-[0.99] font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all"
            >
              <span>Resgatar Benefício</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
