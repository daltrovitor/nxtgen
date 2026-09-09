"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Ticket, QrCode, ScanLine, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Manifesto",
      href: "/",
      icon: Home,
    },
    {
      label: "NXT PASS",
      href: "/pass",
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
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-[#08080a]/95 backdrop-blur-md border-t border-white/10 py-2 px-3 font-mono">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center py-1 px-2 transition-all relative",
                isActive
                  ? "text-white font-bold"
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive && "text-brand-cyan")} />
              <span className="text-[9px] mt-1 tracking-tight uppercase">{item.label}</span>
              {isActive && (
                <div className="absolute -bottom-1 w-4 h-0.5 bg-brand-cyan" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
