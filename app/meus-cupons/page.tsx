"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { BottomNav } from "@/components/bottom-nav";
import { QRModal } from "@/components/qr-modal";
import { mockDb, DEMO_USER, Voucher, Partner, Benefit } from "@/lib/store/mock-db";
import { QrCode, Sparkles, CheckCircle, Clock, ChevronRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MeusCuponsPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [filter, setFilter] = useState<"valid" | "used">("valid");
  const [activeVoucher, setActiveVoucher] = useState<Voucher | null>(null);

  useEffect(() => {
    setVouchers(mockDb.getUserVouchers(DEMO_USER.id));
  }, []);

  const filteredVouchers = vouchers.filter((v) => {
    if (filter === "valid") return v.status === "valid";
    return v.status === "used" || v.status === "expired";
  });

  const handleOpenQR = (v: Voucher) => {
    setActiveVoucher(v);
  };

  // Resolve partner and benefit objects for modal
  const partnerObj = activeVoucher ? mockDb.getPartnerById(activeVoucher.partnerId) || null : null;
  const benefitObj = activeVoucher && partnerObj
    ? partnerObj.benefits.find((b) => b.id === activeVoucher.benefitId) || null
    : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-white">Meus Cupons & Passes</h1>
            <p className="text-xs text-gray-400">Apresente o QR Code no parceiro credenciado</p>
          </div>
          <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <QrCode className="w-5 h-5" />
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex rounded-xl p-1 glass-panel border border-white/5">
          <button
            onClick={() => setFilter("valid")}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-lg transition-all text-center",
              filter === "valid"
                ? "bg-indigo-600 text-white shadow-glow"
                : "text-gray-400 hover:text-white"
            )}
          >
            Disponíveis ({vouchers.filter((v) => v.status === "valid").length})
          </button>
          <button
            onClick={() => setFilter("used")}
            className={cn(
              "flex-1 py-2 text-xs font-bold rounded-lg transition-all text-center",
              filter === "used"
                ? "bg-indigo-600 text-white shadow-glow"
                : "text-gray-400 hover:text-white"
            )}
          >
            Histórico & Usados ({vouchers.filter((v) => v.status !== "valid").length})
          </button>
        </div>

        {/* Voucher List */}
        {filteredVouchers.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-2xl p-6 border border-white/5 space-y-3">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">
              {filter === "valid" ? "Nenhum cupom ativo no momento" : "Nenhum cupom no histórico"}
            </h3>
            <p className="text-xs text-gray-400 max-w-[240px] mx-auto">
              Navegue pelo NXT PASS e resgate ofertas com descontos exclusivos.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredVouchers.map((v) => (
              <div
                key={v.id}
                className="p-4 rounded-2xl glass-panel border border-white/5 hover:border-indigo-500/30 transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface border border-white/10 shrink-0">
                    <img
                      src={v.partnerLogo}
                      alt={v.partnerName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-white">{v.partnerName}</span>
                      <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20">
                        {v.discountLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-300 line-clamp-1 mt-0.5">{v.benefitTitle}</p>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{v.code}</p>
                  </div>
                </div>

                {v.status === "valid" ? (
                  <button
                    onClick={() => handleOpenQR(v)}
                    className="p-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 transition-colors flex items-center space-x-1 text-xs font-bold"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Abrir</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-1 rounded-md">
                    <CheckCircle className="w-3 h-3 mr-1 text-gray-400" />
                    Utilizado
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* QR Code Modal for Selected Voucher */}
      {activeVoucher && partnerObj && benefitObj && (
        <QRModal
          partner={partnerObj}
          benefit={benefitObj}
          onClose={() => setActiveVoucher(null)}
        />
      )}

      <BottomNav />
    </div>
  );
}
