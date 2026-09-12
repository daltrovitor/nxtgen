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

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold font-heading text-white">
            Benefícios Resgatados
          </h2>
          {vouchers.length > 0 && (
            <span className="text-[11px] font-heading font-semibold px-2 py-0.5 rounded-full bg-[#8B24F0]/20 text-purple-300 border border-[#8B24F0]/30">
              {validVouchers.length} {validVouchers.length === 1 ? "ativo" : "ativos"}
            </span>
          )}
        </div>

        {vouchers.length > 0 && onOpenVouchers && (
          <button
            onClick={onOpenVouchers}
            className="text-xs font-heading text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Ver todos ({vouchers.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Content */}
      {vouchers.length === 0 ? (
        <div className="p-6 rounded-xl bg-[#090A0F] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-[#8B24F0]/10 border border-[#8B24F0]/20 flex items-center justify-center shrink-0">
              <Ticket className="w-6 h-6 text-[#8B24F0]" />
            </div>
            <div>
              <p className="text-sm font-bold font-heading text-white">
                Você ainda não resgatou nenhum benefício
              </p>
              <p className="text-xs font-heading text-gray-400 mt-0.5">
                Escolha uma das ofertas no catálogo abaixo e resgate para gerar seu voucher com QR Code exclusivo.
              </p>
            </div>
          </div>
          {onExploreBenefits && (
            <button
              onClick={onExploreBenefits}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-heading text-white transition-all whitespace-nowrap cursor-pointer"
            >
              Explorar Catálogo
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {vouchers.slice(0, 3).map((voucher) => {
            const isValid = voucher.status === "valid";
            return (
              <div
                key={voucher.id}
                className="p-4 rounded-xl bg-[#090A0F] border border-white/10 flex flex-col justify-between space-y-3 hover:border-white/20 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-heading text-purple-400 uppercase tracking-wider">
                      {voucher.partnerName}
                    </span>
                    {isValid ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-heading font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Pronto para usar
                      </span>
                    ) : (
                      <span className="text-[10px] font-heading font-medium px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10">
                        Utilizado
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-bold font-heading text-white line-clamp-1">
                    {voucher.benefitTitle}
                  </p>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-500/30">
                      {voucher.discountLabel}
                    </span>
                    <span className="text-[11px] font-heading text-gray-500">
                      Cód: {voucher.code}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] font-heading text-gray-500">
                    {voucher.redeemedAt}
                  </span>
                  {onOpenVouchers && (
                    <button
                      onClick={onOpenVouchers}
                      className="inline-flex items-center gap-1 text-xs font-heading font-medium text-white hover:text-purple-300 transition-colors cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5 text-[#8B24F0]" />
                      <span>Ver QR Code</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const PassRedeemedBenefits = PassQuickStats;
