"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { BottomNav } from "@/components/bottom-nav";
import { INITIAL_PARTNERS, Voucher } from "@/lib/store/mock-db";
import { ScanLine, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, Store } from "lucide-react";

export default function ValidadorPage() {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(INITIAL_PARTNERS[0].id);
  const [tokenOrCode, setTokenOrCode] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    voucher?: Voucher;
  } | null>(null);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenOrCode.trim()) return;

    try {
      setLoading(true);
      setResult(null);

      const res = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerId: selectedPartnerId,
          qrTokenOrCode: tokenOrCode.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setResult({
          success: false,
          message: data.error || "Erro na validação do voucher.",
        });
      } else {
        setResult({
          success: true,
          message: data.message,
          voucher: data.voucher,
        });
        setTokenOrCode("");
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || "Erro de conexão ao validar.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 px-4 py-4 space-y-4">
        <div>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            STAFF & PARCEIROS
          </span>
          <h1 className="text-lg font-black text-white mt-1">Validador de Benefícios</h1>
          <p className="text-xs text-gray-400">Verificação criptográfica em tempo real</p>
        </div>

        {/* Partner Selector */}
        <div className="p-4 rounded-2xl glass-panel border border-white/5 space-y-2">
          <label className="text-xs font-bold text-gray-300 flex items-center">
            <Store className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
            Estabelecimento Parceiro Ativo
          </label>
          <select
            value={selectedPartnerId}
            onChange={(e) => {
              setSelectedPartnerId(e.target.value);
              setResult(null);
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-surface border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            {INITIAL_PARTNERS.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#12141d] text-white">
                {p.name} ({p.categoryName})
              </option>
            ))}
          </select>
        </div>

        {/* Scan & Validate Form */}
        <form onSubmit={handleValidate} className="p-5 rounded-2xl glass-panel-glow border border-indigo-500/30 space-y-3.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white flex items-center">
              <ScanLine className="w-4 h-4 mr-1.5 text-cyan-400" />
              Inserir Token QR ou Código Manual
            </label>
            <span className="text-[10px] text-gray-400">Anti-Fraude Ativo</span>
          </div>

          <textarea
            rows={3}
            value={tokenOrCode}
            onChange={(e) => setTokenOrCode(e.target.value)}
            placeholder="Cole o token do QR Code ou digite o código do voucher (ex: NXT-ABCD-1234)..."
            className="w-full p-3 rounded-xl bg-[#0a0b10] border border-white/10 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 font-mono"
          />

          <button
            type="submit"
            disabled={loading || !tokenOrCode.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-extrabold shadow-glow flex items-center justify-center space-x-2 transition-all"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Validando Assinatura Criptográfica...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>VALIDAR E CONSUMIR BENEFÍCIO</span>
              </>
            )}
          </button>
        </form>

        {/* Validation Result Box */}
        {result && (
          <div
            className={`p-5 rounded-2xl border transition-all ${
              result.success
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                : "bg-red-950/40 border-red-500/40 text-red-300"
            }`}
          >
            <div className="flex items-start space-x-3">
              {result.success ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white">
                  {result.success ? "Benefício Validado com Sucesso!" : "Validação Recusada"}
                </h3>
                <p className="text-xs mt-1 leading-relaxed">{result.message}</p>

                {result.voucher && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-1 text-[11px] text-gray-300">
                    <p><strong className="text-white">Cliente:</strong> {result.voucher.userName}</p>
                    <p><strong className="text-white">Benefício:</strong> {result.voucher.benefitTitle}</p>
                    <p><strong className="text-white">Desconto Aplicado:</strong> {result.voucher.discountLabel}</p>
                    <p><strong className="text-white">Código:</strong> <span className="font-mono text-cyan-300">{result.voucher.code}</span></p>
                    <p><strong className="text-white">Status:</strong> <span className="text-emerald-400 font-bold uppercase">Utilizado Agora</span></p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
