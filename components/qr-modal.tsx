"use client";

import { useEffect, useState } from "react";
import { Partner, Benefit, Voucher } from "@/lib/store/mock-db";
import { X, ShieldCheck, Copy, Check, RefreshCw, AlertTriangle, Clock } from "lucide-react";

interface QRModalProps {
  partner: Partner | null;
  benefit: Benefit | null;
  onClose: () => void;
}

export function QRModal({ partner, benefit, onClose }: QRModalProps) {
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [copied, setCopied] = useState(false);

  // Function to request/refresh dynamic QR token
  async function fetchRedemption() {
    if (!partner || !benefit) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/vouchers/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerId: partner.id,
          benefitId: benefit.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao resgatar benefício.");
      }

      setVoucher(data.voucher);
      setQrDataUrl(data.qrDataUrl);
      setTimeLeft(60); // Reset countdown
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRedemption();
  }, [partner, benefit]);

  // Rolling countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      // Auto-refresh dynamic token when timer hits 0
      fetchRedemption();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleCopyCode = () => {
    if (!voucher) return;
    navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!partner || !benefit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-3xl glass-panel-glow p-6 text-center border border-white/10 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-center space-x-2 mb-1">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            NXT PASS • VALE BENEFÍCIO
          </span>
        </div>

        <h2 className="text-lg font-bold text-white mt-1">
          {benefit.title}
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {partner.name} • {partner.location}
        </p>

        {/* Error State */}
        {error && (
          <div className="my-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span className="text-left">{error}</span>
          </div>
        )}

        {/* QR Code Card */}
        <div className="my-4 p-4 rounded-2xl bg-white flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
          {loading ? (
            <div className="h-56 flex flex-col items-center justify-center space-y-2 text-gray-900">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
              <span className="text-xs font-semibold">Gerando Token Criptográfico...</span>
            </div>
          ) : qrDataUrl ? (
            <>
              <img
                src={qrDataUrl}
                alt="QR Code Dinâmico"
                className="w-52 h-52 object-contain"
              />
              <div className="w-full mt-2 pt-2 border-t border-gray-200 flex items-center justify-between text-gray-800">
                <span className="text-[10px] font-bold tracking-widest text-gray-500">
                  TOKEN DINÂMICO
                </span>
                <span className="text-[11px] font-mono font-black text-indigo-700">
                  {voucher?.code}
                </span>
              </div>
            </>
          ) : null}
        </div>

        {/* Rolling Timer & Anti-Tamper Badge */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-gray-400 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-indigo-400" />
              Atualiza em:
            </span>
            <span className="font-mono font-bold text-indigo-400">
              {timeLeft}s
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-1000 ease-linear"
              style={{ width: `${(timeLeft / 60) * 100}%` }}
            />
          </div>

          {/* Voucher Code Copy Bar */}
          {voucher && (
            <div className="flex items-center justify-between bg-surface/80 p-2.5 rounded-xl border border-white/5 mt-3">
              <span className="font-mono text-xs font-bold text-gray-300 tracking-wider">
                {voucher.code}
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center space-x-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Security Seal */}
          <div className="pt-2 flex items-center justify-center space-x-1.5 text-[10px] text-emerald-400/90">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Assinatura HMAC SHA-256 Anti-Fraude Ativa</span>
          </div>
        </div>
      </div>
    </div>
  );
}
