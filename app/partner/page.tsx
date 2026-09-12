"use client";

import React, { useEffect, useState, useCallback } from "react";
import { PartnerLogin } from "@/components/partner/partner-login";
import { PartnerDashboard, PartnerUser } from "@/components/partner/partner-dashboard";
import { ShieldAlert, LogOut, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PartnerPage() {
  const [authStatus, setAuthStatus] = useState<"loading" | "unauthenticated" | "wrong_role" | "authenticated">("loading");
  const [partnerUser, setPartnerUser] = useState<PartnerUser | null>(null);
  const [wrongRoleUser, setWrongRoleUser] = useState<any | null>(null);

  const checkPartnerAuth = useCallback(async () => {
    try {
      setAuthStatus("loading");
      const res = await fetch("/api/partner/me");
      const data = await res.json();

      if (res.ok && data.authenticated && data.isPartner) {
        setPartnerUser(data.user);
        setAuthStatus("authenticated");
      } else if (data.authenticated && !data.isPartner) {
        setWrongRoleUser(data.user);
        setAuthStatus("wrong_role");
      } else {
        setPartnerUser(null);
        setAuthStatus("unauthenticated");
      }
    } catch {
      setPartnerUser(null);
      setAuthStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    checkPartnerAuth();
  }, [checkPartnerAuth]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    setPartnerUser(null);
    setWrongRoleUser(null);
    setAuthStatus("unauthenticated");
  };

  // 1. Loading state
  if (authStatus === "loading") {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center text-white font-mono space-y-3">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-400">Verificando credenciais de parceiro...</p>
      </div>
    );
  }

  // 2. Logged in with wrong role (e.g. 'user' or 'admin')
  if (authStatus === "wrong_role") {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-[#090A0F] border border-red-500/30 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold font-heading text-white">
              Acesso Restrito a Parceiros
            </h1>
            <p className="text-xs text-gray-400 leading-relaxed">
              Você está conectado como <strong className="text-white">{wrongRoleUser?.email}</strong> com o papel{" "}
              <span className="font-mono px-1.5 py-0.5 rounded bg-white/10 text-amber-300">
                {wrongRoleUser?.role}
              </span>
              . Este terminal é exclusivo para contas credenciadas com a função{" "}
              <span className="font-mono text-emerald-400 font-bold">partner</span>.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleLogout}
              className="flex-1 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-xs font-heading font-semibold text-red-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Trocar de Conta</span>
            </button>

            <a
              href={
                typeof window !== "undefined" && window.location.hostname.includes("localhost")
                  ? "http://localhost:3000"
                  : "https://nxtgen.app"
              }
              className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Início</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 3. Unauthenticated -> Partner Login
  if (authStatus === "unauthenticated" || !partnerUser) {
    return <PartnerLogin onSuccess={checkPartnerAuth} />;
  }

  // 4. Authenticated Partner Dashboard
  return <PartnerDashboard user={partnerUser} onLogout={handleLogout} />;
}
