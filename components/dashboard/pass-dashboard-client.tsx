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
  ReferralInfo,
} from "@/lib/pass-data";
import { PassHeader } from "./pass-header";
import { PassLevelBanner } from "./pass-level-banner";
import { PassReferralCard } from "./pass-referral-card";
import { PassQuickStats } from "./pass-quick-stats";
import { PassCategoriesBar } from "./pass-categories-bar";
import { PassBenefitGrid } from "./pass-benefit-grid";
import { PassBenefitModal } from "./pass-benefit-modal";
import { PassVouchersDrawer } from "./pass-vouchers-drawer";
import { PassMissionsCard } from "./pass-missions-card";

interface PassDashboardClientProps {
  onViewShowcase?: () => void;
}

const LOCAL_STORAGE_VOUCHERS_KEY = "nxtgen_pass_vouchers";

function loadCachedVouchers(): UserVoucher[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_VOUCHERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function saveCachedVouchers(list: UserVoucher[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_VOUCHERS_KEY, JSON.stringify(list));
  } catch {}
}

function mergeVouchers(base: UserVoucher[], incoming: UserVoucher[]): UserVoucher[] {
  const map = new Map<string, UserVoucher>();
  // 1. Put base vouchers first
  base.forEach((v) => {
    const key = v.code?.toUpperCase() || v.id;
    map.set(key, v);
  });
  // 2. Incoming from server overrides/updates base
  incoming.forEach((v) => {
    const key = v.code?.toUpperCase() || v.id;
    map.set(key, v);
  });
  return Array.from(map.values());
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
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);

  // Sync user prop
  useEffect(() => {
    if (user) {
      setLiveUser((prev) => (prev ? { ...prev, ...user } : user));
    }
  }, [user]);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    const cached = loadCachedVouchers();
    if (cached && cached.length > 0) {
      setVouchers((prev) => mergeVouchers(prev, cached));
    }
  }, []);

  // Fetch live store data from API
  const fetchLiveData = useCallback(async () => {
    try {
      const res = await fetch("/api/pass/data");
      const data = await res.json();
      if (res.ok && data.success) {
        if (Array.isArray(data.benefits)) setBenefitsList(data.benefits);
        if (data.missions && data.missions.length > 0) setMissionsList(data.missions);
        if (data.referralInfo) setReferralInfo(data.referralInfo);
        if (Array.isArray(data.vouchers)) {
          setVouchers(data.vouchers);
          saveCachedVouchers(data.vouchers);
        }
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

  // Real-time polling every 8s so that partner validation instantly updates user screen
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLiveData();
    }, 8000);
    return () => clearInterval(interval);
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

  const isBenefitActiveRedeemed = useCallback(
    (benefit: Benefit | null) => {
      if (!benefit) return false;
      return vouchers.some(
        (v) => v.benefitId === benefit.id && v.status === "valid"
      );
    },
    [vouchers]
  );

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
        setVouchers((prev) => {
          const next = [
            data.voucher,
            ...prev.filter(
              (v) =>
                v.id !== data.voucher.id &&
                v.code?.toUpperCase() !== data.voucher.code?.toUpperCase()
            ),
          ];
          saveCachedVouchers(next);
          return next;
        });
      } else {
        // Fallback local voucher (persisted to localStorage)
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
          redeemedAt: new Date().toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
          terms: benefit.terms[0] || "Apresente o QR Code no balcão ao pedir a conta.",
        };
        setVouchers((prev) => {
          const next = [fallbackVoucher, ...prev];
          saveCachedVouchers(next);
          return next;
        });
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
        redeemedAt: new Date().toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        terms: benefit.terms[0] || "Apresente o QR Code no balcão.",
      };
      setVouchers((prev) => {
        const next = [fallbackVoucher, ...prev];
        saveCachedVouchers(next);
        return next;
      });
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
    setVouchers((prev) => {
      const next = prev.map((v) =>
        v.id === voucherId ? { ...v, status: "used" as const } : v
      );
      saveCachedVouchers(next);
      return next;
    });
  };

  const activeVouchersCount = vouchers.filter((v) => v.status === "valid").length;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 transition-colors duration-200">
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

        {/* 2.5. Card de Indicação & Validação de Convite de Amigo */}
        <PassReferralCard
          referralInfo={
            referralInfo ||
            (liveUser
              ? {
                  userId: liveUser.id,
                  referralCode: liveUser.id.slice(0, 8).toUpperCase(),
                  friendsInvitedCount: 0,
                  referredBy: null,
                }
              : null)
          }
          onReferralSuccess={(newScore, newLevel) => {
            setLiveUser((prev: any) => ({
              ...prev,
              nxtScore: newScore,
              nxtLevel: newLevel,
            }));
            fetchLiveData();
          }}
        />

        {/* 3. Benefícios Resgatados (Some quando parceiro valida) */}
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
          activeVouchers={vouchers}
          onResetFilters={() => {
            setSelectedCategory("all");
            setSearchQuery("");
          }}
        />

        {/* 9. Missões do Passe */}
        <PassMissionsCard
          missions={missionsList}
          userId={liveUser?.id}
          onMissionUpdate={fetchLiveData}
          onScoreChange={(newScore, newLevel) => {
            setLiveUser((prev: any) => ({
              ...prev,
              nxtScore: newScore,
              nxtLevel: newLevel,
            }));
            fetchLiveData();
          }}
        />
      </main>

      {/* 6. Modal de Detalhes do Benefício */}
      <PassBenefitModal
        benefit={selectedBenefit}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onRedeemBenefit={handleRedeemBenefit}
        isAlreadyRedeemed={isBenefitActiveRedeemed(selectedBenefit)}
        onOpenVoucherDrawer={() => setIsVouchersDrawerOpen(true)}
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
