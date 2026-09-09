"use client";

import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Zap, Lock, Terminal, Check, ArrowRight } from "lucide-react";
import { CATEGORIES, INITIAL_PARTNERS } from "@/lib/store/mock-db";
import { useAuth } from "@/hooks/use-auth";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#08080a] text-[#ededef] flex flex-col selection:bg-white selection:text-black">
      {/* Top Technical Bar */}
      <div className="border-b border-white/10 px-6 py-2.5 flex items-center justify-between text-[11px] font-mono text-gray-400">
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
            NXTGEN OS v1.0 • ONLINE
          </span>
          <span className="hidden sm:inline text-gray-600">|</span>
          <span className="hidden sm:inline text-gray-500">RLS & HMAC VERIFIED</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/validador" className="hover:text-white transition-colors">
            PORTAL DO PARCEIRO
          </Link>
          <span className="text-gray-700">/</span>
          {user ? (
            <Link href="/pass" className="text-emerald-400 font-bold hover:underline">
              {user.name.toUpperCase()} (ABRIR APP)
            </Link>
          ) : (
            <Link href="/login" className="hover:text-white transition-colors font-semibold">
              LOGIN
            </Link>
          )}
        </div>
      </div>

      {/* Navigation */}
      <header className="border-b border-white/10 px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-display text-2xl font-black tracking-tighter text-white">
            NXTGEN<span className="text-brand-cyan">.</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8 text-xs font-mono tracking-wider uppercase text-gray-400">
          <a href="#manifesto" className="hover:text-white transition-colors">Manifesto</a>
          <a href="#beneficios" className="hover:text-white transition-colors">NXT Pass</a>
          <a href="#modulos" className="hover:text-white transition-colors">Módulos</a>
          <a href="#seguranca" className="hover:text-white transition-colors">Segurança</a>
        </nav>

        <div className="flex items-center space-x-3">
          {user ? (
            <Link
              href="/pass"
              className="px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-white text-black hover:bg-gray-200 transition-colors flex items-center space-x-1"
            >
              <span>Acessar App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-block px-4 py-2 text-xs font-mono uppercase tracking-wider text-gray-300 hover:text-white transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider bg-white text-black hover:bg-gray-200 transition-colors"
              >
                Criar Conta
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section: The Thesis */}
      <section className="px-6 py-16 md:py-24 max-w-6xl mx-auto w-full">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 border border-white/15 px-3 py-1 text-xs font-mono uppercase tracking-widest text-brand-cyan bg-surface">
            <span>[ PROTOCOLO DE BENEFÍCIOS PARA GERAÇÃO Z ]</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white uppercase leading-[1.05]">
            BUILD. <br />
            DON&apos;T BET.
          </h1>

          <p className="text-base sm:text-lg text-gray-400 font-sans leading-relaxed max-w-2xl">
            Substituímos o algoritmo de apostas e rolagem passiva por vantagens reais. 
            O primeiro marketplace 100% web com descontos exclusivos, vouchers criptografados e 
            recompensas para quem estuda, poupa e constrói o próprio futuro.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              href="/pass"
              className="px-8 py-4 bg-white text-black hover:bg-gray-200 font-mono text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center space-x-2 transition-all"
            >
              <span>Explorar NXT PASS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/signup"
              className="px-8 py-4 border border-white/20 hover:border-white text-white font-mono text-xs font-bold uppercase tracking-wider text-center transition-all bg-surface/50"
            >
              Criar Conta Instantânea (Sem E-mail)
            </Link>
          </div>
        </div>

        {/* Technical Highlights Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 border border-white/10 mt-16 text-left">
          <div className="bg-[#08080a] p-5 space-y-1">
            <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">01 / Vantagens</span>
            <p className="font-display text-2xl font-bold text-white">Até 35% OFF</p>
            <p className="text-xs text-gray-400">Em marcas de streetwear, gastronomia e tecnologia.</p>
          </div>

          <div className="bg-[#08080a] p-5 space-y-1">
            <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">02 / Criptografia</span>
            <p className="font-display text-2xl font-bold text-white">HMAC SHA-256</p>
            <p className="text-xs text-gray-400">Tokens anti-fraude com expiração dinâmica em 60s.</p>
          </div>

          <div className="bg-[#08080a] p-5 space-y-1">
            <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">03 / App Store Tax</span>
            <p className="font-display text-2xl font-bold text-emerald-400">0% Comissão</p>
            <p className="text-xs text-gray-400">PWA 100% Web sem taxas abusivas de 30% da Apple/Google.</p>
          </div>

          <div className="bg-[#08080a] p-5 space-y-1">
            <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">04 / Acesso</span>
            <p className="font-display text-2xl font-bold text-white">Instantâneo</p>
            <p className="text-xs text-gray-400">Sem confirmação de e-mail. Cadastro e uso em 5 segundos.</p>
          </div>
        </div>
      </section>

      {/* Manifesto Section */}
      <section id="manifesto" className="border-t border-b border-white/10 py-20 px-6 bg-[#0c0d12]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-brand-cyan">
                O Manifesto NXTGEN
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white uppercase tracking-tight mt-2 leading-snug">
                O futuro não se aposta. <br />
                O futuro se constrói.
              </h2>
              <div className="space-y-4 text-sm text-gray-400 font-sans mt-6 leading-relaxed">
                <p>
                  As últimas gerações foram bombardeadas por plataformas que lucram com a impulsividade: 
                  apostas esportivas, cassinos digitais disfarçados de jogos e consumo predatório.
                </p>
                <p>
                  O <strong className="text-white">NXTGEN</strong> inverte a lógica do jogo. Se você estuda, 
                  treina, poupa e investe, o ecossistema recompensa você com poder de compra, 
                  networking qualificado e acessos exclusivos.
                </p>
              </div>
            </div>

            {/* Contrast Comparison Table */}
            <div className="border border-white/10 bg-[#08080a] divide-y divide-white/10 font-mono text-xs">
              <div className="p-4 grid grid-cols-2 text-gray-500 uppercase tracking-wider">
                <span>Cultura das Bets</span>
                <span className="text-white">Ecossistema NXTGEN</span>
              </div>
              <div className="p-4 grid grid-cols-2 items-center">
                <span className="text-red-400">Perda financeira média de 94%</span>
                <span className="text-emerald-400">Economia real de 15% a 35%</span>
              </div>
              <div className="p-4 grid grid-cols-2 items-center">
                <span className="text-gray-400">Vício em dopamina barata</span>
                <span className="text-white">Pontuação por disciplina (NXT Score)</span>
              </div>
              <div className="p-4 grid grid-cols-2 items-center">
                <span className="text-gray-400">Zero construção patrimonial</span>
                <span className="text-white">Acesso a mentoria, eventos e BaaS</span>
              </div>
              <div className="p-4 grid grid-cols-2 items-center">
                <span className="text-gray-400">Algoritmo manipulativo</span>
                <span className="text-white">Código transparente e RLS bancário</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Catalog Section */}
      <section id="beneficios" className="py-20 px-6 max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-brand-cyan">
              Catálogo de Parceiros Credenciados
            </span>
            <h2 className="font-display text-3xl font-bold text-white uppercase tracking-tight mt-1">
              NXT PASS: Benefícios Selecionados
            </h2>
          </div>
          <Link
            href="/pass"
            className="mt-4 md:mt-0 font-mono text-xs uppercase tracking-wider text-white hover:text-brand-cyan transition-colors flex items-center space-x-1"
          >
            <span>Ver todos os parceiros no app</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Partners Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INITIAL_PARTNERS.slice(0, 3).map((partner) => {
            const b = partner.benefits[0];
            return (
              <div
                key={partner.id}
                className="border border-white/10 bg-surface flex flex-col justify-between hover:border-white/30 transition-all"
              >
                <div>
                  <div className="h-44 w-full relative overflow-hidden bg-black">
                    <img
                      src={partner.bannerUrl}
                      alt={partner.name}
                      className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-black/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white border border-white/15">
                      {partner.categoryName}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-base font-bold text-white uppercase">
                        {partner.name}
                      </h3>
                      <span className="font-mono text-xs font-black text-emerald-400">
                        {b.discountLabel}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed">
                      {b.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    href={`/pass?category=${partner.categoryId}`}
                    className="w-full py-2.5 bg-white/5 hover:bg-white text-white hover:text-black font-mono text-xs font-bold uppercase tracking-wider text-center block transition-all border border-white/10"
                  >
                    Resgatar com NXT PASS
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* The 5 Modules Architecture */}
      <section id="modulos" className="border-t border-white/10 py-20 px-6 bg-[#0c0d12]">
        <div className="max-w-6xl mx-auto">
          <span className="font-mono text-xs uppercase tracking-widest text-brand-cyan">
            O Ecossistema Modular
          </span>
          <h2 className="font-display text-3xl font-bold text-white uppercase tracking-tight mt-1">
            Sequência dos 5 Módulos NXTGEN
          </h2>
          <p className="text-sm text-gray-400 font-sans mt-2 max-w-xl">
            Projetado de forma desacoplada para que cada serviço financeiro, social e educacional 
            evolua sem amarras monolíticas.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mt-10 font-mono text-xs">
            <div className="border border-emerald-500/50 bg-[#08080a] p-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">● DISPONÍVEL AGORA</span>
                <h4 className="font-display text-lg font-bold text-white mt-1">1. NXT PASS</h4>
                <p className="text-gray-400 text-[11px] font-sans mt-2">
                  Marketplace de vantagens, cupons dinâmicos com QR Code e split para parceiros.
                </p>
              </div>
              <Link href="/pass" className="text-emerald-400 font-bold hover:underline mt-4">
                ACESSAR MÓDULO →
              </Link>
            </div>

            <div className="border border-white/10 bg-[#08080a] p-5 opacity-80">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">FASE 1</span>
              <h4 className="font-display text-lg font-bold text-white mt-1">2. NXT BANK</h4>
              <p className="text-gray-400 text-[11px] font-sans mt-2">
                Conta digital via BaaS regulado, Pix integrado, cartões e saldo multi-carteira.
              </p>
            </div>

            <div className="border border-white/10 bg-[#08080a] p-5 opacity-80">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">FASE 1</span>
              <h4 className="font-display text-lg font-bold text-white mt-1">3. NXT LIVE</h4>
              <p className="text-gray-400 text-[11px] font-sans mt-2">
                Ingressos de festivais, controle de portaria via QR scanner e corridas de rua.
              </p>
            </div>

            <div className="border border-white/10 bg-[#08080a] p-5 opacity-80">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">FASE 2</span>
              <h4 className="font-display text-lg font-bold text-white mt-1">4. NXT INVEST</h4>
              <p className="text-gray-400 text-[11px] font-sans mt-2">
                Plataforma de alocação de capital e educação financeira para jovens.
              </p>
            </div>

            <div className="border border-white/10 bg-[#08080a] p-5 opacity-80">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">FASE 2</span>
              <h4 className="font-display text-lg font-bold text-white mt-1">5. NXT ME</h4>
              <p className="text-gray-400 text-[11px] font-sans mt-2">
                Saúde emocional, psicologia com privacidade LGPD e desenvolvimento pessoal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Architecture Section */}
      <section id="seguranca" className="py-20 px-6 max-w-6xl mx-auto w-full">
        <div className="max-w-3xl">
          <span className="font-mono text-xs uppercase tracking-widest text-brand-cyan">
            Segurança Bancária & RLS
          </span>
          <h2 className="font-display text-3xl font-bold text-white uppercase tracking-tight mt-1">
            Arquitetura Anti-Intrusão
          </h2>
          <p className="text-sm text-gray-400 font-sans mt-2 leading-relaxed">
            Nenhuma permissão é delegada cegamente ao frontend. Todas as tabelas no Supabase PostgreSQL 
            são protegidas por políticas criptográficas no nível de linha (RLS).
          </p>

          <div className="mt-8 space-y-3 font-mono text-xs">
            <div className="p-4 border border-white/10 bg-surface flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">PostgreSQL Row Level Security (RLS)</strong>
                <span className="text-gray-400 text-[11px]">
                  Impossibilita ataques de IDOR. Cada usuário só consegue recuperar seus próprios cupons, 
                  e cada parceiro só valida ingressos associados ao seu ID de estabelecimento.
                </span>
              </div>
            </div>

            <div className="p-4 border border-white/10 bg-surface flex items-start space-x-3">
              <Lock className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Anti-Replay com Hash HMAC SHA-256</strong>
                <span className="text-gray-400 text-[11px]">
                  Cada QR Code emitido contém timestamp e assinatura digital única. Prints de tela expiram 
                  em 60 segundos e reutilizações são imediatamente rejeitadas no backend.
                </span>
              </div>
            </div>

            <div className="p-4 border border-white/10 bg-surface flex items-start space-x-3">
              <Terminal className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Rate Limiting Deslizante & Sanitização Zod</strong>
                <span className="text-gray-400 text-[11px]">
                  Bloqueio automático de força bruta em autenticação e prevenção contra injeções XSS e SQL.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 bg-[#040406] text-xs font-mono text-gray-500">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="font-display font-black text-white text-base">NXTGEN</span>
            <span>• 100% WEB & OPEN ARCHITECTURE</span>
          </div>

          <div className="flex space-x-6">
            <Link href="/pass" className="hover:text-white transition-colors">NXT PASS</Link>
            <Link href="/validador" className="hover:text-white transition-colors">Validador Staff</Link>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Criar Conta</Link>
          </div>

          <div className="text-gray-600">
            © 2026 NXTGEN. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
