"use client";

import React from "react";
import { Benefit } from "@/lib/pass-data";
import { PassBenefitCard } from "./pass-benefit-card";

interface PassBenefitGridProps {
  benefits: Benefit[];
  onSelectBenefit: (benefit: Benefit) => void;
  selectedCategoryName: string;
  onResetFilters?: () => void;
}

export function PassBenefitGrid({
  benefits,
  onSelectBenefit,
  selectedCategoryName,
  onResetFilters,
}: PassBenefitGridProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold font-heading text-white">
          {selectedCategoryName === "Todos" ? "Todos os Benefícios" : selectedCategoryName}
        </h2>
        <span className="text-xs font-heading text-gray-400">
          {benefits.length} {benefits.length === 1 ? "parceiro" : "parceiros"}
        </span>
      </div>

      {/* Grid */}
      {benefits.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((benefit) => (
            <PassBenefitCard
              key={benefit.id}
              benefit={benefit}
              onSelect={onSelectBenefit}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-xl bg-[#090A0F] border border-white/10 text-center space-y-3">
          <p className="text-sm font-heading text-gray-400">
            Nenhum benefício encontrado nesta categoria.
          </p>
          {onResetFilters && (
            <button
              onClick={onResetFilters}
              className="px-4 py-2 rounded-lg bg-[#8B24F0] text-white font-heading text-xs font-bold hover:brightness-110 transition-all cursor-pointer"
            >
              Ver todos os parceiros
            </button>
          )}
        </div>
      )}
    </div>
  );
}
