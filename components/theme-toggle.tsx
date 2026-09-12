"use client";

import React from "react";
import { useTheme } from "./theme-provider";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  variant?: "header" | "floating" | "inline";
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({
  variant = "header",
  className,
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();

  // Prevent hydration mismatch by rendering a consistent default until mounted
  const isDark = mounted ? theme === "dark" : true;

  if (variant === "floating") {
    return (
      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center print:hidden select-none",
          className
        )}
      >
        <button
          onClick={toggleTheme}
          type="button"
          aria-label={isDark ? "Alternar para modo claro" : "Alternar para modo escuro"}
          title={isDark ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
          className={cn(
            "group relative flex items-center gap-2 px-3.5 py-2.5 rounded-full transition-all duration-300 shadow-xl cursor-pointer",
            "backdrop-blur-xl border",
            isDark
              ? "bg-[#0A0B10]/85 border-white/15 text-white shadow-purple-500/10 hover:border-purple-500/50 hover:shadow-purple-500/20"
              : "bg-white/90 border-slate-200 text-slate-800 shadow-slate-900/10 hover:border-purple-400 hover:shadow-purple-500/15"
          )}
        >
          <div className="relative w-4 h-4 flex items-center justify-center">
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-purple-600 transition-transform duration-300 group-hover:-rotate-12" />
            )}
          </div>
          <span className="text-xs font-mono font-medium tracking-wider">
            {isDark ? "LIGHT" : "DARK"}
          </span>
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full animate-pulse",
              isDark ? "bg-amber-400" : "bg-purple-600"
            )}
          />
        </button>
      </div>
    );
  }

  // Header / Inline variant
  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={isDark ? "Alternar para modo claro" : "Alternar para modo escuro"}
      title={isDark ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
      className={cn(
        "relative p-2 rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer border",
        isDark
          ? "bg-white/5 hover:bg-white/10 border-white/10 text-gray-300 hover:text-white"
          : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900",
        className
      )}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 hover:scale-110" />
        ) : (
          <Moon className="w-4 h-4 text-purple-600 transition-transform duration-200 hover:scale-110" />
        )}
      </div>

      {showLabel && (
        <span className="ml-2 text-xs font-mono font-medium hidden sm:inline">
          {isDark ? "Modo Claro" : "Modo Escuro"}
        </span>
      )}
    </button>
  );
}

export function FloatingThemeToggle() {
  return <ThemeToggle variant="floating" />;
}
