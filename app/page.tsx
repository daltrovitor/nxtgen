"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { BottomNav } from "@/components/bottom-nav";
import { PartnerCard } from "@/components/partner-card";
import { QRModal } from "@/components/qr-modal";
import { CATEGORIES, INITIAL_PARTNERS, Partner, Benefit } from "@/lib/store/mock-db";
import { Search, Sparkles, SlidersHorizontal, Flame, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activePartner, setActivePartner] = useState<Partner | null>(null);
  const [activeBenefit, setActiveBenefit] = useState<Benefit | null>(null);

  // Filter partners based on search query and category
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
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 px-4 py-4 space-y-5">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar benefícios, sneakers, restaurantes..."
            className="w-full pl-10 pr-10 py-3 rounded-2xl glass-panel border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-gray-400 hover:text-white"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Featured Hero Banner: Build. Don't Bet. */}
        <div className="relative rounded-2xl overflow-hidden glass-panel-glow p-5 border border-indigo-500/30">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -top-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center space-x-1.5 text-indigo-400 text-xs font-black uppercase tracking-wider mb-1">
              <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
              <span>NXT PASS • CLUBE DE BENEFÍCIOS</span>
            </div>
            <h2 className="text-xl font-black text-white leading-tight">
              Build. Don&apos;t Bet.
            </h2>
            <p className="text-xs text-gray-300 mt-1 max-w-[260px] leading-relaxed">
              Resgate vantagens reais em marcas que aceleram o seu futuro.
            </p>

            <div className="flex items-center space-x-3 mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center space-x-1 text-[11px] font-bold text-amber-400">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                <span>Até 35% OFF</span>
              </div>
              <div className="h-3 w-[1px] bg-white/10" />
              <span className="text-[11px] text-gray-400">Zero taxas de intermediários</span>
            </div>
          </div>
        </div>

        {/* Categories Carousel */}
        <div>
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
              Categorias
            </h3>
            <span className="text-[11px] text-indigo-400 font-medium">
              {CATEGORIES.length} disponíveis
            </span>
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar -mx-4 px-4">
            <button
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border flex items-center space-x-1.5",
                selectedCategory === "all"
                  ? "bg-indigo-600 text-white border-indigo-400 shadow-glow"
                  : "glass-panel text-gray-300 border-white/5 hover:border-white/20"
              )}
            >
              <span>🔥</span>
              <span>Todos</span>
            </button>

            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border flex items-center space-x-1.5",
                  selectedCategory === cat.id
                    ? "bg-indigo-600 text-white border-indigo-400 shadow-glow"
                    : "glass-panel text-gray-300 border-white/5 hover:border-white/20"
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
          <div className="flex items-center justify-between px-0.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
              Destaques NXT PASS ({filteredPartners.length})
            </h3>
          </div>

          {filteredPartners.length === 0 ? (
            <div className="text-center py-12 glass-panel rounded-2xl p-6 border border-white/5">
              <span className="text-3xl">🔍</span>
              <h4 className="text-sm font-bold text-white mt-2">Nenhum parceiro encontrado</h4>
              <p className="text-xs text-gray-400 mt-1">
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
