import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NXT PASS | Clube de Benefícios Exclusivo",
  description: "Marketplace de benefícios e experiências para as Gerações Alpha e Z. Build. Don't Bet.",
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
  themeColor: "#0a0b10",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-[#0a0b10] text-gray-100 selection:bg-indigo-500 selection:text-white antialiased pb-20">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/25 via-[#0a0b10] to-[#07080c] pointer-events-none -z-10" />
        <div className="mx-auto max-w-md min-h-screen flex flex-col relative shadow-2xl bg-[#0a0b10]/80 border-x border-white/5">
          {children}
        </div>
      </body>
    </html>
  );
}
