"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminMembersTab, AdminUser } from "@/components/admin/admin-members-tab";
import { AdminBenefitsTab } from "@/components/admin/admin-benefits-tab";
import { AdminMissionsTab } from "@/components/admin/admin-missions-tab";
import { AdminVouchersTab } from "@/components/admin/admin-vouchers-tab";
import { Benefit, PassMission } from "@/lib/pass-data";
import { SystemVoucher } from "@/lib/pass-store";
import { Users, Gift, CheckSquare, Ticket, LogOut, Shield, ArrowUpRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

type TabKey = "members" | "benefits" | "missions" | "vouchers";

export default function AdminPage() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("members");

  // Data states
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [missions, setMissions] = useState<PassMission[]>([]);
  const [vouchers, setVouchers] = useState<SystemVoucher[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Check admin session
  const checkAdminAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/me");
      const data = await res.json();
      if (res.ok && data.authenticated && data.isAdmin) {
        setIsAdminAuthenticated(true);
        setAdminUser(data.user);
      } else {
        setIsAdminAuthenticated(false);
        setAdminUser(null);
      }
    } catch {
      setIsAdminAuthenticated(false);
      setAdminUser(null);
    }
  }, []);

  // Fetch all admin data
  const fetchAllData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [resUsers, resBenefits, resMissions, resVouchers] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/benefits"),
        fetch("/api/admin/missions"),
        fetch("/api/admin/vouchers"),
      ]);

      const [dataUsers, dataBenefits, dataMissions, dataVouchers] = await Promise.all([
        resUsers.json(),
        resBenefits.json(),
        resMissions.json(),
        resVouchers.json(),
      ]);

      if (dataUsers.users) setUsers(dataUsers.users);
      if (dataBenefits.benefits) setBenefits(dataBenefits.benefits);
      if (dataMissions.missions) setMissions(dataMissions.missions);
      if (dataVouchers.vouchers) setVouchers(dataVouchers.vouchers);
    } catch (err) {
      console.error("Erro ao carregar dados administrativos:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    checkAdminAuth();
  }, [checkAdminAuth]);

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchAllData();
    }
  }, [isAdminAuthenticated, fetchAllData]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    setIsAdminAuthenticated(false);
    setAdminUser(null);
  };

  // 1. Loading screen
  if (isAdminAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center font-mono space-y-3">
        <div className="w-7 h-7 border-2 border-[#8B24F0] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-muted-foreground">Verificando privilégios administrativos...</p>
      </div>
    );
  }

  // 2. Unauthenticated as Admin -> Show Admin Login
  if (!isAdminAuthenticated) {
    return <AdminLogin onSuccess={checkAdminAuth} />;
  }

  // 3. Authenticated Admin Dashboard
  return (
    <div className="min-h-screen bg-background text-foreground pb-24 font-sans selection:bg-[#8B24F0] selection:text-white transition-colors duration-200">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="font-heading font-black text-xl tracking-tight text-foreground">
                NXTGEN
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#8B24F0]/20 border border-[#8B24F0]/40 text-[10px] font-mono font-bold text-[#C084FC] uppercase tracking-wider">
                ADMIN
              </span>
            </Link>

            <span className="hidden md:inline-block text-xs text-muted-foreground font-mono pl-2 border-l border-border">
              adminng.nxtgen.app
            </span>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            <a
              href={
                typeof window !== "undefined" && window.location.hostname.includes("localhost")
                  ? "http://localhost:3000"
                  : "https://nxtgen.app"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 hover:bg-muted text-xs font-mono text-muted-foreground hover:text-foreground border border-border transition-colors"
              title="Abrir o painel do associado em nova aba"
            >
              <span>Ver Dashboard Usuário</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
            </a>

            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-foreground font-heading leading-tight">
                  {adminUser?.name || "Administrador"}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  {adminUser?.email || "admin@nxtgen.app"}
                </div>
              </div>

              <div className="w-8 h-8 rounded-lg bg-[#8B24F0]/20 border border-[#8B24F0]/40 flex items-center justify-center text-[#C084FC]">
                <Shield className="w-4 h-4" />
              </div>

              <ThemeToggle variant="header" />

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition-colors cursor-pointer"
                title="Sair da sessão administrativa"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto scrollbar-none border-t border-border">
          <button
            onClick={() => setActiveTab("members")}
            className={`inline-flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-heading font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "members"
                ? "border-[#8B24F0] text-purple-700 dark:text-white bg-purple-50 dark:bg-[#8B24F0]/10"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <Users className="w-4 h-4 text-[#8B24F0]" />
            <span>1. Membros & Níveis ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("benefits")}
            className={`inline-flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-heading font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "benefits"
                ? "border-[#8B24F0] text-purple-700 dark:text-white bg-purple-50 dark:bg-[#8B24F0]/10"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <Gift className="w-4 h-4 text-[#8B24F0]" />
            <span>2. Benefícios ({benefits.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("missions")}
            className={`inline-flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-heading font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "missions"
                ? "border-[#8B24F0] text-purple-700 dark:text-white bg-purple-50 dark:bg-[#8B24F0]/10"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <CheckSquare className="w-4 h-4 text-[#8B24F0]" />
            <span>3. Tarefas & Missões ({missions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("vouchers")}
            className={`inline-flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-heading font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "vouchers"
                ? "border-[#8B24F0] text-purple-700 dark:text-white bg-purple-50 dark:bg-[#8B24F0]/10"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <Ticket className="w-4 h-4 text-[#8B24F0]" />
            <span>4. Vouchers Resgatados ({vouchers.length})</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {activeTab === "members" && (
          <AdminMembersTab users={users} onRefresh={fetchAllData} />
        )}

        {activeTab === "benefits" && (
          <AdminBenefitsTab benefits={benefits} onRefresh={fetchAllData} />
        )}

        {activeTab === "missions" && (
          <AdminMissionsTab missions={missions} onRefresh={fetchAllData} />
        )}

        {activeTab === "vouchers" && (
          <AdminVouchersTab vouchers={vouchers} onRefresh={fetchAllData} />
        )}
      </main>
    </div>
  );
}
