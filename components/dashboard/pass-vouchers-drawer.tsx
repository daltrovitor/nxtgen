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

  useEffect(() => {
    if (isOpen && vouchers.length > 0 && !selectedVoucher) {
      setSelectedVoucher(vouchers[0]);
    }
  }, [isOpen, vouchers, selectedVoucher]);

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
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#0B0C12] border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/50">
          <div>
            <h3 className="text-base font-bold font-heading text-white">
              Meus Vouchers do Passe
            </h3>
            <p className="text-xs font-heading text-gray-400">
              {vouchers.filter((v) => v.status === "valid").length} ativos prontos para uso
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Vouchers List / Selection */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {vouchers.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <p className="text-sm font-heading text-gray-400">
                Você ainda não resgatou nenhum benefício.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-[#8B24F0] text-white font-heading text-xs font-bold"
              >
                Ver Benefícios
              </button>
            </div>
          ) : (
            <>
              {/* Voucher Tabs */}
              <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
                {vouchers.map((v) => {
                  const isSelected = selectedVoucher?.id === v.id;
                  const isValid = v.status === "valid";
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVoucher(v)}
                      className={`px-3 py-2 rounded-lg border text-left font-heading text-xs whitespace-nowrap cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#8B24F0] text-white border-[#8B24F0] font-bold"
                          : "bg-black/40 text-gray-400 border-white/10 hover:text-white"
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
                <div className="p-5 rounded-xl bg-black/60 border border-white/10 space-y-4 text-center">
                  <div className="space-y-0.5">
                    <p className="text-xs font-heading font-bold text-purple-400 uppercase tracking-wider">
                      {selectedVoucher.discountLabel}
                    </p>
                    <h4 className="text-lg font-bold font-heading text-white">
                      {selectedVoucher.partnerName}
                    </h4>
                    <p className="text-xs font-heading text-gray-400">
                      {selectedVoucher.benefitTitle}
                    </p>
                  </div>

                  {/* QR Code */}
                  <div className="w-48 h-48 mx-auto p-2 bg-white rounded-xl shadow-md flex items-center justify-center">
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
                  <div className="p-3 rounded-lg bg-[#0E1018] border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-heading text-gray-400">
                      <span>Código de validação manual</span>
                      <button
                        onClick={() => handleCopy(selectedVoucher.code)}
                        className="text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer font-bold"
                      >
                        {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCode ? "Copiado" : "Copiar"}</span>
                      </button>
                    </div>
                    <p className="text-base font-mono font-bold text-white tracking-widest">
                      {selectedVoucher.code}
                    </p>
                  </div>

                  <p className="text-xs font-heading text-gray-400 leading-snug">
                    Apresente este QR Code ou código no caixa para usufruir do benefício.
                  </p>

                  {/* Simulate usage */}
                  {selectedVoucher.status === "valid" ? (
                    <button
                      onClick={() => onUseVoucher(selectedVoucher.id)}
                      className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-heading text-gray-300 hover:text-white transition-colors cursor-pointer"
                    >
                      Simular Validação (Marcar como Usado)
                    </button>
                  ) : (
                    <span className="block py-2 text-xs font-heading text-gray-500">
                      Este voucher já foi validado no estabelecimento.
                    </span>
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
