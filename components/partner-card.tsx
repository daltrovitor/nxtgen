"use client";

import { Partner, Benefit } from "@/lib/store/mock-db";
import { formatCurrency } from "@/lib/utils";
import { MapPin, Star, Sparkles, CheckCircle2, ChevronRight, ArrowRight } from "lucide-react";

interface PartnerCardProps {
  partner: Partner;
  onSelectBenefit: (partner: Partner, benefit: Benefit) => void;
}

export function PartnerCard({ partner, onSelectBenefit }: PartnerCardProps) {
  const primaryBenefit = partner.benefits[0];

  return (
    <div className="rounded-2xl glass-panel overflow-hidden border border-white/5 hover:border-indigo-500/30 transition-all duration-300 group">
      {/* Banner / Header */}
      <div className="relative h-32 w-full overflow-hidden">
        <img
          src={partner.bannerUrl}
          alt={partner.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b10] via-[#0a0b10]/40 to-transparent" />

        {/* Rating & Verified Badges */}
        <div className="absolute top-3 right-3 flex items-center space-x-1.5">
          <span className="flex items-center space-x-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-[11px] font-bold text-amber-400">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{partner.rating.toFixed(1)}</span>
          </span>
        </div>

        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span className="bg-indigo-950/80 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-indigo-500/40 text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
            {partner.categoryName}
          </span>
        </div>
      </div>

      {/* Partner Info */}
      <div className="p-4 pt-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 -mt-7 bg-[#12141d] relative z-10 shadow-lg shrink-0">
              <img
                src={partner.logoUrl}
                alt={partner.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {partner.name}
                </h3>
                {partner.verified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
                )}
              </div>
              <p className="text-[11px] text-gray-400 flex items-center mt-0.5">
                <MapPin className="w-3 h-3 mr-1 text-gray-500" />
                {partner.location}
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        {primaryBenefit && (
          <div className="mt-3.5 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-black bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-glow">
                <Sparkles className="w-3 h-3 mr-1" />
                {primaryBenefit.discountLabel}
              </span>
              {primaryBenefit.originalPrice && primaryBenefit.promotionalPrice && (
                <div className="text-right">
                  <span className="text-[11px] text-gray-500 line-through mr-1.5">
                    {formatCurrency(primaryBenefit.originalPrice)}
                  </span>
                  <span className="text-xs font-bold text-emerald-400">
                    {formatCurrency(primaryBenefit.promotionalPrice)}
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs font-medium text-gray-200 mt-2 line-clamp-1">
              {primaryBenefit.title}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
              {primaryBenefit.description}
            </p>

            {/* Redeem CTA Button */}
            <button
              onClick={() => onSelectBenefit(partner, primaryBenefit)}
              className="mt-3.5 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-all duration-150 shadow-glow"
            >
              <span>USAR BENEFÍCIO</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
