"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { BottomNav } from "@/components/bottom-nav";
import { PartnerCard } from "@/components/partner-card";
import { QRModal } from "@/components/qr-modal";
import { CATEGORIES, INITIAL_PARTNERS, Partner, Benefit } from "@/lib/store/mock-db";
import { useAuth } from "@/hooks/use-auth";
import { Search, Flame, Zap, ArrowLeft, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PassAppPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activePartner, setActivePartner] = useState<Partner | null>(null);
  const [activeBenefit, setActiveBenefit] = useState<Benefit | null>(null);

  const filteredPartners = INITIAL_PARTNERS.filter((partner) => {
    const matchCategory = selectedCategory === "all" || partner.categoryId === selectedCategory;
    const matchQuery =
      !searchQuery.trim() ||
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.benefits.some(
        (b) =>
          b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.discountLabel.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchCategory && matchQuery;
  });

  const handleSelectBenefit = (partner: Partner, benefit: Benefit) => {
    setActivePartner(partner);
    setActiveBenefit(benefit);
  };

  return (
    <div className="mx-auto max-w-md min-h-screen flex flex-col bg-[#08080a] border-x border-white/10 pb-20 shadow-2xl relative">
      <Navbar />

      <main className="flex-1 px-4 py-4 space-y-4">
        {/* Back link to Landing */}
        <div className="flex items-center justify-between text-xs font-mono">
          <Link href="/" className="text-gray-400 hover:text-white flex items-center space-x-1">
            <ArrowLeft className="w-3 h-3" />
            <span>Voltar ao Manifesto</span>
          </Link>
          {!user && (
            <Link href="/login" className="text-brand-cyan hover:underline flex items-center space-x-1 font-bold">
              <LogIn className="w-3 h-3" />
              <span>Fazer Login</span>
            </Link>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar benefícios, streetwear, burgers..."
            className="w-full pl-10 pr-10 py-3 bg-[#0f1015] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-mono text-gray-400 hover:text-white"
            >
              LIMPAR
            </button>
          )}
        </div>

        {/* Categories Strip */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Categorias ({CATEGORIES.length})
            </span>
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar -mx-4 px-4 font-mono text-xs">
            <button
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "px-3 py-2 border transition-all whitespace-nowrap uppercase font-bold",
                selectedCategory === "all"
                  ? "bg-white text-black border-white"
                  : "bg-[#0f1015] text-gray-300 border-white/10 hover:border-white/30"
              )}
            >
              Todos
            </button>

            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-3 py-2 border transition-all whitespace-nowrap uppercase font-bold flex items-center space-x-1.5",
                  selectedCategory === cat.id
                    ? "bg-white text-black border-white"
                    : "bg-[#0f1015] text-gray-300 border-white/10 hover:border-white/30"
                )}
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Partners & Offers Grid */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Parceiros Ativos ({filteredPartners.length})
            </span>
          </div>

          {filteredPartners.length === 0 ? (
            <div className="text-center py-12 border border-white/10 bg-[#0f1015] p-6 space-y-2">
              <p className="font-display text-base font-bold text-white uppercase">Nenhum parceiro encontrado</p>
              <p className="text-xs text-gray-400 font-sans">
                Tente buscar com outro termo ou selecionar outra categoria.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPartners.map((partner) => (
                <PartnerCard
                  key={partner.id}
                  partner={partner}
                  onSelectBenefit={handleSelectBenefit}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* QR Code Redemption Modal */}
      {activePartner && activeBenefit && (
        <QRModal
          partner={activePartner}
          benefit={activeBenefit}
          onClose={() => {
            setActivePartner(null);
            setActiveBenefit(null);
          }}
        />
      )}

      <BottomNav />
    </div>
  );
}
