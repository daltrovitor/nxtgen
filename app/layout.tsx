import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "NXTGEN • The Future Pays More | Build. Don't Bet.",
  description: "Ecossistema financeiro, de benefícios e experiências para as Gerações Alpha e Z. Substituímos a monetização de impulsos por recompensas reais.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NXTGEN",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#08090C",
};

import { AuthProvider } from "@/hooks/use-auth";
import { CursorRibbons } from "@/components/cursor-ribbons";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={cn(
        "dark h-full antialiased",
        inter.variable,
        spaceGrotesk.variable,
        jetbrainsMono.variable
      )}
    >
      <body className="min-h-full flex flex-col bg-[#000000] text-[#F3F4F6]">
        <CursorRibbons colors={["#8B5CF6", "#06B6D4", "#A855F7"]} />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
