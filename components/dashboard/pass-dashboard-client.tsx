"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Benefit,
  UserVoucher,
  NXT_CATEGORIES,
  INITIAL_BENEFITS,
  INITIAL_VOUCHERS,
  PASS_MISSIONS,
  PassMission,
} from "@/lib/pass-data";
import { PassHeader } from "./pass-header";
import { PassLevelBanner } from "./pass-level-banner";
import { PassQuickStats } from "./pass-quick-stats";
import { PassCategoriesBar } from "./pass-categories-bar";
import { PassBenefitGrid } from "./pass-benefit-grid";
import { PassBenefitModal } from "./pass-benefit-modal";
import { PassVouchersDrawer } from "./pass-vouchers-drawer";
import { PassMissionsCard } from "./pass-missions-card";

interface PassDashboardClientProps {
  onViewShowcase?: () => void;
}

export function PassDashboardClient({ onViewShowcase }: PassDashboardClientProps) {
  const { user, logout } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedBenefit, setSelectedBenefit] = useState<Benefit | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isVouchersDrawerOpen, setIsVouchersDrawerOpen] = useState(false);

  // Dynamic live state from shared store
  const [liveUser, setLiveUser] = useState(user);
  const [benefitsList, setBenefitsList] = useState<Benefit[]>(INITIAL_BENEFITS);
  const [missionsList, setMissionsList] = useState<PassMission[]>(PASS_MISSIONS);
  const [vouchers, setVouchers] = useState<UserVoucher[]>(INITIAL_VOUCHERS);

  // Sync user prop
  useEffect(() => {
    if (user) {
      setLiveUser((prev) => prev ? { ...prev, ...user } : user);
    }
  }, [user]);

  // Fetch live store data from API
  const fetchLiveData = useCallback(async () => {
    try {
      const res = await fetch("/api/pass/data");
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.benefits) setBenefitsList(data.benefits);
        if (data.missions) setMissionsList(data.missions);
        if (data.vouchers && data.vouchers.length > 0) setVouchers(data.vouchers);
        if (data.currentUser) {
          setLiveUser((prev: any) => ({
            ...prev,
            name: data.currentUser.name || prev?.name || "Rafael Molina",
            nxtLevel: data.currentUser.nxtLevel,
            nxtScore: data.currentUser.nxtScore,
            walletBalance: data.currentUser.walletBalance,
          }));
        }
      }
    } catch (err) {
      console.warn("Aviso ao sincronizar dados do NXT Pass:", err);
    }
  }, []);

  useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  // Filtered Benefits
  const filteredBenefits = useMemo(() => {
    return benefitsList.filter((item) => {
      if (selectedCategory !== "all" && item.categoryId !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchPartner = item.partnerName.toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        const matchLocation = item.partnerLocation.toLowerCase().includes(query);
        if (!matchTitle && !matchPartner && !matchDesc && !matchLocation) {
          return false;
        }
      }
      return true;
    });
  }, [benefitsList, selectedCategory, searchQuery]);

  const selectedCategoryObj = NXT_CATEGORIES.find((c) => c.id === selectedCategory);
  const selectedCategoryName = selectedCategoryObj?.name || "Todos";

  if (!liveUser) {
    return null;
  }

  const handleSelectBenefit = (benefit: Benefit) => {
    setSelectedBenefit(benefit);
    setIsDetailModalOpen(true);
  };

  // Direct redemption: call API and open wallet
  const handleRedeemBenefit = async (benefit: Benefit) => {
    try {
      const res = await fetch("/api/pass/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ benefitId: benefit.id }),
      });

      const data = await res.json();
      if (res.ok && data.voucher) {
        setVouchers((prev) => [data.voucher, ...prev]);
      } else {
        // Fallback local voucher
        const uniqueToken = `NXT-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(
          1000 + Math.random() * 9000
        )}`;
        const fallbackVoucher: UserVoucher = {
          id: `vouch-${Date.now()}`,
          code: uniqueToken,
          benefitId: benefit.id,
          benefitTitle: benefit.title,
          partnerId: benefit.partnerId,
          partnerName: benefit.partnerName,
          discountLabel: benefit.discountLabel,
          status: "valid",
          qrPayload: `NXTGEN_PASS::${uniqueToken}::${benefit.partnerName.replace(/\s+/g, "")}`,
          redeemedAt: "Agora mesmo",
          terms: benefit.terms[0] || "Apresente o QR Code no balcão ao pedir a conta.",
        };
        setVouchers((prev) => [fallbackVoucher, ...prev]);
      }
    } catch {
      // Local fallback
      const uniqueToken = `NXT-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;
      const fallbackVoucher: UserVoucher = {
        id: `vouch-${Date.now()}`,
        code: uniqueToken,
        benefitId: benefit.id,
        benefitTitle: benefit.title,
        partnerId: benefit.partnerId,
        partnerName: benefit.partnerName,
        discountLabel: benefit.discountLabel,
        status: "valid",
        qrPayload: `NXTGEN_PASS::${uniqueToken}::${benefit.partnerName.replace(/\s+/g, "")}`,
        redeemedAt: "Agora mesmo",
        terms: benefit.terms[0] || "Apresente o QR Code no balcão.",
      };
      setVouchers((prev) => [fallbackVoucher, ...prev]);
    }

    setIsDetailModalOpen(false);
    setIsVouchersDrawerOpen(true);
  };

  const handleUseVoucher = async (voucherId: string) => {
    try {
      await fetch("/api/admin/vouchers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: voucherId, status: "used" }),
      });
    } catch (e) {
      console.error(e);
    }
    setVouchers((prev) =>
      prev.map((v) => (v.id === voucherId ? { ...v, status: "used" } : v))
    );
  };

  const activeVouchersCount = vouchers.filter((v) => v.status === "valid").length;

  return (
    <div className="min-h-screen bg-[#000000] text-[#F3F4F6] pb-20">
      {/* 1. Header */}
      <PassHeader
        user={liveUser}
        onLogout={logout}
        onViewShowcase={onViewShowcase}
        activeVouchersCount={activeVouchersCount}
        onOpenVouchers={() => setIsVouchersDrawerOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* 2. Banner de Nível */}
        <PassLevelBanner user={liveUser} />

        {/* 3. Benefícios Resgatados */}
        <PassQuickStats
          vouchers={vouchers}
          onOpenVouchers={() => setIsVouchersDrawerOpen(true)}
          onExploreBenefits={() => {
            setSelectedCategory("all");
            setSearchQuery("");
          }}
        />

        {/* 4. Categorias & Busca */}
        <PassCategoriesBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* 5. Grade de Benefícios */}
        <PassBenefitGrid
          benefits={filteredBenefits}
          onSelectBenefit={handleSelectBenefit}
          selectedCategoryName={selectedCategoryName}
          onResetFilters={() => {
            setSelectedCategory("all");
            setSearchQuery("");
          }}
        />

        {/* 9. Missões do Passe */}
        <PassMissionsCard missions={missionsList} />
      </main>

      {/* 6. Modal de Detalhes do Benefício */}
      <PassBenefitModal
        benefit={selectedBenefit}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onRedeemBenefit={handleRedeemBenefit}
      />

      {/* 7. Carteira de Vouchers com QR Code */}
      <PassVouchersDrawer
        isOpen={isVouchersDrawerOpen}
        onClose={() => setIsVouchersDrawerOpen(false)}
        vouchers={vouchers}
        onUseVoucher={handleUseVoucher}
      />
    </div>
  );
}
