"use client";

import React from "react";
import { Search } from "lucide-react";
import { NXT_CATEGORIES, Category } from "@/lib/pass-data";

interface PassCategoriesBarProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function PassCategoriesBar({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}: PassCategoriesBarProps) {
  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar benefício ou parceiro..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090A0F] border border-white/10 text-sm font-heading text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-heading text-gray-400 hover:text-white cursor-pointer"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Categories Horizontal Pills (Clean Typography) */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {NXT_CATEGORIES.map((cat: Category) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-heading whitespace-nowrap transition-colors cursor-pointer border ${
                isSelected
                  ? "bg-[#8B24F0] text-white border-[#8B24F0] font-bold"
                  : "bg-[#090A0F] text-gray-400 border-white/10 hover:text-white hover:border-white/20"
              }`}
            >
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
