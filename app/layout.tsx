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
  icons: {
    icon: [
      { url: "/iconenxt.png" },
      { url: "/iconenxt.png", sizes: "32x32", type: "image/png" },
      { url: "/iconenxt.png", sizes: "192x192", type: "image/png" },
      { url: "/iconenxt.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/iconenxt.png" },
    ],
    shortcut: "/iconenxt.png",
  },
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
import { ThemeProvider, ThemeScript } from "@/components/theme-provider";
import { FloatingThemeToggle } from "@/components/theme-toggle";
import { ConfirmToastProvider } from "@/components/ui/confirm-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn(
        "dark h-full antialiased",
        inter.variable,
        spaceGrotesk.variable,
        jetbrainsMono.variable
      )}
    >
      <head>
        <ThemeScript />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200"
      >
        <ThemeProvider>
          <CursorRibbons colors={["#8B5CF6", "#06B6D4", "#A855F7"]} />
          <AuthProvider>
            <ConfirmToastProvider>
              {children}
              <FloatingThemeToggle />
            </ConfirmToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
