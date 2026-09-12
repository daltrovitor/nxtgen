"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { X, Check, Copy } from "lucide-react";
import { UserVoucher } from "@/lib/pass-data";

interface PassVouchersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  vouchers: UserVoucher[];
  onUseVoucher: (voucherId: string) => void;
}

export function PassVouchersDrawer({
  isOpen,
  onClose,
  vouchers,
  onUseVoucher,
}: PassVouchersDrawerProps) {
  const [selectedVoucher, setSelectedVoucher] = useState<UserVoucher | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState(false);

  const sortedVouchers = React.useMemo(() => {
    return [...vouchers].sort((a, b) => {
      if (a.status === "valid" && b.status !== "valid") return -1;
      if (a.status !== "valid" && b.status === "valid") return 1;
      return 0;
    });
  }, [vouchers]);

  useEffect(() => {
    if (isOpen && vouchers.length > 0) {
      const stillExists = selectedVoucher && vouchers.find((v) => v.id === selectedVoucher.id);
      if (!stillExists) {
        const firstValid = sortedVouchers.find((v) => v.status === "valid");
        setSelectedVoucher(firstValid || sortedVouchers[0]);
      } else {
        const updated = vouchers.find((v) => v.id === selectedVoucher.id);
        if (updated && updated.status !== selectedVoucher.status) {
          setSelectedVoucher(updated);
        }
      }
    }
  }, [isOpen, vouchers, selectedVoucher, sortedVouchers]);

  useEffect(() => {
    if (selectedVoucher) {
      QRCode.toDataURL(selectedVoucher.qrPayload, {
        width: 220,
        margin: 1,
        color: { dark: "#000000", light: "#FFFFFF" },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch(console.error);
    }
  }, [selectedVoucher]);

  const handleCopy = (code: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-card text-card-foreground border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div>
            <h3 className="text-base font-bold font-heading text-foreground">
              Meus Vouchers do Passe
            </h3>
            <p className="text-xs font-heading text-muted-foreground">
              {vouchers.filter((v) => v.status === "valid").length} ativos prontos para uso
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-background/80 hover:bg-background text-foreground border border-border/50 flex items-center justify-center transition-colors cursor-pointer shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Vouchers List / Selection */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {vouchers.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <p className="text-sm font-heading text-muted-foreground">
                Você ainda não resgatou nenhum benefício.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-[#8B24F0] text-white font-heading text-xs font-bold shadow-md"
              >
                Ver Benefícios
              </button>
            </div>
          ) : (
            <>
              {/* Voucher Tabs */}
              <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
                {sortedVouchers.map((v) => {
                  const isSelected = selectedVoucher?.id === v.id;
                  const isValid = v.status === "valid";
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVoucher(v)}
                      className={`px-3 py-2 rounded-lg border text-left font-heading text-xs whitespace-nowrap cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#8B24F0] text-white border-[#8B24F0] font-bold shadow-sm"
                          : "bg-muted/50 text-muted-foreground border-border hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{v.partnerName}</span>
                        <span className="text-[10px] opacity-80">
                          {isValid ? "• Ativo" : "• Usado"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Voucher Presentation */}
              {selectedVoucher && (
                <div className="p-5 rounded-xl bg-muted/20 border border-border space-y-4 text-center">
                  <div className="space-y-0.5">
                    <p className="text-xs font-heading font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                      {selectedVoucher.discountLabel}
                    </p>
                    <h4 className="text-lg font-bold font-heading text-foreground">
                      {selectedVoucher.partnerName}
                    </h4>
                    <p className="text-xs font-heading text-muted-foreground">
                      {selectedVoucher.benefitTitle}
                    </p>
                  </div>

                  {/* QR Code */}
                  <div className="w-48 h-48 mx-auto p-3 bg-white rounded-xl shadow-md flex items-center justify-center border border-border/40">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="QR Code do Voucher"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="animate-pulse bg-gray-200 w-full h-full rounded" />
                    )}
                  </div>

                  {/* Token Numérico */}
                  <div className="p-3 rounded-lg bg-card border border-border space-y-1 shadow-sm">
                    <div className="flex items-center justify-between text-[11px] font-heading text-muted-foreground">
                      <span>Código de validação manual</span>
                      <button
                        onClick={() => handleCopy(selectedVoucher.code)}
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 cursor-pointer font-bold"
                      >
                        {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCode ? "Copiado" : "Copiar"}</span>
                      </button>
                    </div>
                    <p className="text-base font-mono font-bold text-foreground tracking-widest">
                      {selectedVoucher.code}
                    </p>
                  </div>

                  <p className="text-xs font-heading text-muted-foreground leading-snug">
                    Apresente este QR Code ou código no caixa para usufruir do benefício.
                  </p>

                  {/* Status do voucher */}
                  {selectedVoucher.status === "valid" ? (
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <span className="text-xs font-heading font-medium text-emerald-700 dark:text-emerald-300">
                        Voucher ativo • Apresente ao atendente para validação
                      </span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-muted border border-border text-center">
                      <span className="text-xs font-heading font-medium text-muted-foreground">
                        ✓ Este voucher já foi validado no estabelecimento.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
