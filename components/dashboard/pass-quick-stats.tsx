"use client";

import React from "react";
import { UserVoucher } from "@/lib/pass-data";
import { QrCode, Ticket, ChevronRight, CheckCircle2 } from "lucide-react";

interface PassQuickStatsProps {
  vouchers: UserVoucher[];
  onOpenVouchers?: () => void;
  onExploreBenefits?: () => void;
}

export function PassQuickStats({
  vouchers = [],
  onOpenVouchers,
  onExploreBenefits,
}: PassQuickStatsProps) {
  const validVouchers = vouchers.filter((v) => v.status === "valid");
  const usedVouchersCount = vouchers.filter((v) => v.status === "used").length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold font-heading text-foreground">
            Benefícios Resgatados
          </h2>
          {validVouchers.length > 0 && (
            <span className="text-[11px] font-heading font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
              {validVouchers.length} {validVouchers.length === 1 ? "ativo" : "ativos"}
            </span>
          )}
        </div>

        {vouchers.length > 0 && onOpenVouchers && (
          <button
            onClick={onOpenVouchers}
            className="text-xs font-heading text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>
              {validVouchers.length > 0
                ? `Ver vouchers (${validVouchers.length})`
                : `Histórico (${usedVouchersCount} utilizado${usedVouchersCount === 1 ? "" : "s"})`}
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Content */}
      {validVouchers.length === 0 ? (
        <div className="p-6 rounded-xl bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Ticket className="w-6 h-6 text-[#8B24F0]" />
            </div>
            <div>
              <p className="text-sm font-bold font-heading text-foreground">
                {usedVouchersCount > 0
                  ? "Nenhum voucher pendente de uso"
                  : "Você ainda não resgatou nenhum benefício"}
              </p>
              <p className="text-xs font-heading text-muted-foreground mt-0.5">
                {usedVouchersCount > 0
                  ? "Todos os seus benefícios resgatados anteriores já foram validados e baixados pelos parceiros."
                  : "Escolha uma das ofertas no catálogo abaixo e resgate para gerar seu voucher com QR Code exclusivo."}
              </p>
            </div>
          </div>
          {onExploreBenefits && (
            <button
              onClick={onExploreBenefits}
              className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 border border-border text-xs font-heading text-foreground transition-all whitespace-nowrap cursor-pointer shadow-sm"
            >
              Explorar Catálogo
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {validVouchers.slice(0, 3).map((voucher) => (
            <div
              key={voucher.id}
              className="p-4 rounded-xl bg-card border border-border flex flex-col justify-between space-y-3 hover:border-purple-500/30 transition-colors shadow-sm"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-heading text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    {voucher.partnerName}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-heading font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Pronto para usar
                  </span>
                </div>

                <p className="text-sm font-bold font-heading text-foreground line-clamp-1">
                  {voucher.benefitTitle}
                </p>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
                    {voucher.discountLabel}
                  </span>
                  <span className="text-[11px] font-heading text-muted-foreground">
                    Cód: {voucher.code}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-[11px] font-heading text-muted-foreground">
                  {voucher.redeemedAt}
                </span>
                {onOpenVouchers && (
                  <button
                    onClick={onOpenVouchers}
                    className="inline-flex items-center gap-1 text-xs font-heading font-medium text-foreground hover:text-purple-600 dark:hover:text-purple-300 transition-colors cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#8B24F0]" />
                    <span>Ver QR Code</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const PassRedeemedBenefits = PassQuickStats;
