import { ScrollytellingContainer } from "@/components/scrollytelling-container";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#08090C] text-[#F3F4F6] selection:bg-purple-600 selection:text-white">
      {/* Top Fixed Header with Technical Status Indicator */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#08090C]/80 backdrop-blur-md border-b border-white/10 px-6 py-3.5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-3">
          <span className="font-heading font-black text-lg text-white tracking-tight">
            NXTGEN<span className="text-cyan-400">.</span>
          </span>
          <span className="hidden sm:inline text-gray-600">/</span>
          <span className="hidden sm:inline-flex items-center text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
            NXT LEVEL 3 OS
          </span>
        </div>

        <nav className="flex items-center space-x-6 text-gray-400 uppercase tracking-wider text-[11px]">
          <a href="#secao-pass" className="hover:text-cyan-400 transition-colors hidden sm:inline">
            NXT PASS
          </a>
          <a href="#secao-login" className="px-3.5 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 font-bold transition-all">
            ENTRAR / CADASTRO
          </a>
        </nav>
      </header>

      {/* Main 3D Scrollytelling Showcase */}
      <ScrollytellingContainer />
    </main>
  );
}
