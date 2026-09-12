"use client";

import React, { useState } from "react";
import QRCode from "qrcode";
import {
  X,
  CreditCard,
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Benefit } from "@/lib/pass-data";

interface PassCheckoutModalProps {
  benefit: Benefit | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (benefit: Benefit) => void;
}

export function PassCheckoutModal({
  benefit,
  isOpen,
  onClose,
  onPaymentSuccess,
}: PassCheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [pixQrUrl, setPixQrUrl] = useState<string>("");
  const [pixCopyPaste, setPixCopyPaste] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  // Generate simulated Pix QR code when opened
  React.useEffect(() => {
    if (isOpen && benefit && paymentMethod === "pix") {
      const simulatedPixPayload = `00020126580014BR.GOV.BCB.PIX0136nxtgen-${benefit.id}-partner-${benefit.partnerId}520400005303986540${benefit.promotionalPrice?.toFixed(2)}5802BR5916NXTGEN PLATAFORMA6009SAO PAULO62070503***6304`;
      setPixCopyPaste(simulatedPixPayload);
      QRCode.toDataURL(simulatedPixPayload, {
        width: 220,
        margin: 1,
      })
        .then((url) => setPixQrUrl(url))
        .catch(console.error);
    }
  }, [isOpen, benefit, paymentMethod]);

  if (!isOpen || !benefit) return null;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess(benefit);
    }, 1500);
  };

  const handleCopyPix = () => {
    if (typeof window !== "undefined" && pixCopyPaste) {
      navigator.clipboard.writeText(pixCopyPaste);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#0B0D18] border border-white/15 overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">
              CHECKOUT SEGURO • NXT PASS
            </span>
            <h3 className="text-base font-bold font-heading text-white">
              Garantir Oferta com Desconto
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Order Summary */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-mono text-gray-400">{benefit.partnerName}</p>
                <h4 className="text-sm font-bold font-heading text-white">{benefit.title}</h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-500/30">
                {benefit.discountLabel}
              </span>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-between items-baseline text-sm">
              <span className="text-gray-400 font-sans">Valor com Desconto NXT:</span>
              <div className="text-right">
                <span className="text-xs font-mono text-gray-500 line-through mr-2">
                  R$ {benefit.originalPrice?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xl font-extrabold font-heading text-white">
                  R$ {benefit.promotionalPrice?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-black/60 border border-white/10">
            <button
              onClick={() => setPaymentMethod("pix")}
              className={`py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                paymentMethod === "pix"
                  ? "bg-[#8B24F0] text-white shadow-[0_0_15px_rgba(139,36,240,0.5)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Pix Instantâneo</span>
            </button>
            <button
              onClick={() => setPaymentMethod("card")}
              className={`py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                paymentMethod === "card"
                  ? "bg-[#8B24F0] text-white shadow-[0_0_15px_rgba(139,36,240,0.5)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Cartão 1-Clique</span>
            </button>
          </div>

          {/* Pix Body */}
          {paymentMethod === "pix" && (
            <div className="space-y-3 text-center">
              <div className="w-44 h-44 mx-auto rounded-2xl bg-white p-2.5 shadow-xl flex items-center justify-center">
                {pixQrUrl ? (
                  <img src={pixQrUrl} alt="QR Code Pix" className="w-full h-full object-contain" />
                ) : (
                  <div className="animate-pulse bg-gray-200 w-full h-full rounded-xl" />
                )}
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleCopyPix}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-gray-200 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  {copiedPix ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Código Pix Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-purple-400" />
                      <span>Copiar Chave Pix (Copia e Cola)</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-gray-500 font-sans">
                  A confirmação é imediata via Webhook seguro. O voucher com QR Code é emitido instantaneamente.
                </p>
              </div>
            </div>
          )}

          {/* Card Body */}
          {paymentMethod === "card" && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-violet-950/20 to-black border border-white/15 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono text-gray-300">
                  <span className="text-white font-bold">Cartão Principal Cadastrado</span>
                  <span className="text-emerald-400">Tokenizado</span>
                </div>
                <p className="font-mono text-base tracking-widest text-white">•••• •••• •••• 4096</p>
                <div className="flex justify-between text-[11px] font-mono text-gray-400">
                  <span>Membro NXT</span>
                  <span>12/28</span>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 font-sans text-center">
                Transação protegida por 3DS2 e criptografia PCI-DSS de ponta a ponta.
              </p>
            </div>
          )}

          <div className="flex items-center justify-center space-x-1.5 text-[11px] font-mono text-gray-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Divisão Automática de Pagamento (Split Seguro)</span>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-white/10 bg-[#0A0D18]">
          <button
            onClick={handleSimulatePayment}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#8B24F0] via-[#9d3df3] to-[#8B24F0] hover:brightness-110 text-white font-bold text-sm font-sans flex items-center justify-center space-x-2 shadow-[0_0_25px_rgba(139,36,240,0.5)] transition-all cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processando Pagamento...</span>
              </>
            ) : (
              <>
                <span>Confirmar Pagamento e Emitir Voucher</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
