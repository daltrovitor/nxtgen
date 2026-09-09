"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tag, Wallet, Ticket, TrendingUp, HeartHandshake, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "PASS",
      href: "/pass",
      icon: Tag,
      color: "#00f0ff",
    },
    {
      label: "BANK",
      href: "/bank",
      icon: Wallet,
      color: "#7928ca",
    },
    {
      label: "LIVE",
      href: "/live",
      icon: Ticket,
      color: "#ff0080",
    },
    {
      label: "INVEST",
      href: "/invest",
      icon: TrendingUp,
      color: "#10b981",
    },
    {
      label: "NXT ME",
      href: "/me",
      icon: HeartHandshake,
      color: "#ffb800",
    },
    {
      label: "CUPONS",
      href: "/meus-cupons",
      icon: QrCode,
      color: "#00f0ff",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-[#08080a]/95 backdrop-blur-xl border-t border-white/10 py-1.5 px-2 font-mono">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center py-1 px-1.5 transition-all relative active:scale-95",
                isActive
                  ? "text-white font-bold"
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              <Icon 
                className="w-4 h-4 transition-colors" 
                style={{ color: isActive ? item.color : undefined }}
              />
              <span className="text-[8.5px] mt-0.5 tracking-tighter uppercase font-bold">
                {item.label}
              </span>
              {isActive && (
                <div 
                  className="absolute -bottom-1 w-3.5 h-0.5" 
                  style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}` }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
