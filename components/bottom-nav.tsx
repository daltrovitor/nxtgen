"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Ticket, QrCode, ScanLine, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Início",
      href: "/",
      icon: Home,
    },
    {
      label: "NXT PASS",
      href: "/",
      icon: Ticket,
      highlight: true,
    },
    {
      label: "Meus Cupons",
      href: "/meus-cupons",
      icon: QrCode,
    },
    {
      label: "Validador",
      href: "/validador",
      icon: ScanLine,
    },
    {
      label: "Perfil",
      href: "/perfil",
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto glass-panel border-t border-white/5 py-2 px-3">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center py-1 px-2 rounded-lg transition-all duration-200 relative",
                isActive
                  ? "text-indigo-400 font-semibold"
                  : "text-gray-400 hover:text-gray-200"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-full transition-transform",
                  item.highlight && isActive && "bg-indigo-600/20 text-indigo-400 shadow-glow"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "scale-110" : "scale-100")} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              {isActive && (
                <div className="absolute -bottom-1 w-5 h-0.5 bg-indigo-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
