"use client";

import React from "react";
import { Benefit, UserVoucher } from "@/lib/pass-data";
import { PassBenefitCard } from "./pass-benefit-card";

interface PassBenefitGridProps {
  benefits: Benefit[];
  onSelectBenefit: (benefit: Benefit) => void;
  selectedCategoryName: string;
  onResetFilters?: () => void;
  activeVouchers?: UserVoucher[];
}

export function PassBenefitGrid({
  benefits,
  onSelectBenefit,
  selectedCategoryName,
  onResetFilters,
  activeVouchers = [],
}: PassBenefitGridProps) {
  const activeBenefitIds = React.useMemo(() => {
    const ids = new Set<string>();
    activeVouchers
      .filter((v) => v.status === "valid")
      .forEach((v) => {
        if (v.benefitId) ids.add(v.benefitId);
      });
    return ids;
  }, [activeVouchers]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold font-heading text-foreground">
          {selectedCategoryName === "Todos" ? "Todos os Benefícios" : selectedCategoryName}
        </h2>
        <span className="text-xs font-heading text-muted-foreground">
          {benefits.length} {benefits.length === 1 ? "parceiro" : "parceiros"}
        </span>
      </div>

      {/* Grid */}
      {benefits.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((benefit) => {
            const isRedeemed = activeBenefitIds.has(benefit.id);

            return (
              <PassBenefitCard
                key={benefit.id}
                benefit={benefit}
                onSelect={onSelectBenefit}
                isAlreadyRedeemed={isRedeemed}
              />
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-xl bg-card border border-border text-center space-y-3 shadow-sm">
          <p className="text-sm font-heading text-muted-foreground">
            {selectedCategoryName === "Todos"
              ? "Nenhum benefício cadastrado no momento. Cadastre novas ofertas pelo Painel Admin para exibi-las aqui!"
              : "Nenhum benefício encontrado nesta categoria."}
          </p>
          {onResetFilters && (
            <button
              onClick={onResetFilters}
              className="px-4 py-2 rounded-lg bg-[#8B24F0] text-white font-heading text-xs font-bold hover:brightness-110 transition-all cursor-pointer shadow-md"
            >
              Ver todos os parceiros
            </button>
          )}
        </div>
      )}
    </div>
  );
}
