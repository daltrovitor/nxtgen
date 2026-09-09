import Image from "next/image";
import Link from "next/link";
import { ScrollytellingContainer } from "@/components/scrollytelling-container";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#000000] text-[#F3F4F6] selection:bg-purple-600 selection:text-white">
      {/* Top Fixed Header with Official Logo */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/90 backdrop-blur-md border-b border-white/10 px-6 sm:px-10 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <Image
            src="/logonxtgen.png"
            alt="NXTGEN"
            width={220}
            height={60}
            className="h-11 sm:h-12 md:h-14 w-auto object-contain transition-opacity group-hover:opacity-90 drop-shadow-[0_0_20px_rgba(139,92,246,0.3)]"
            priority
          />
        </Link>

        <nav className="flex items-center space-x-6 text-gray-400 text-xs font-mono">
          <a href="#secao-pass" className="hover:text-cyan-400 transition-colors hidden sm:inline">
            NXT PASS
          </a>
          <a
            href="#secao-login"
            className="relative group px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600/40 via-violet-600/40 to-cyan-500/30 hover:from-purple-600 hover:to-cyan-500 text-white border border-purple-500/50 font-semibold transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:shadow-[0_0_30px_rgba(139,92,246,0.7)] hover:scale-105 active:scale-95 cursor-pointer overflow-hidden"
          >
            <span className="relative z-10 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>ENTRAR / CADASTRO</span>
            </span>
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
          </a>
        </nav>
      </header>

      {/* Main 3D Scrollytelling Showcase */}
      <ScrollytellingContainer />
    </main>
  );
}
