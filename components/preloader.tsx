"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface PreloaderProps {
  onComplete?: () => void;
  durationMs?: number; // ~3800ms
}

const STATUS_STEPS = [
  { threshold: 0, text: "INICIANDO PROTOCOLO NXTGEN..." },
  { threshold: 28, text: "CARREGANDO ARQUITETURA 3D & BENEFÍCIOS..." },
  { threshold: 60, text: "SINCRONIZANDO EXPERIÊNCIA IMERSIVA..." },
  { threshold: 88, text: "ACESSO AUTORIZADO • BEM-VINDO AO FUTURO" },
];

export function Preloader({ onComplete, durationMs = 3800 }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState(STATUS_STEPS[0].text);
  const [isFinished, setIsFinished] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Check if user already saw preloader in this tab session
    const hasSeen = sessionStorage.getItem("nxtgen_preloader_seen");
    if (hasSeen === "true") {
      setShouldRender(false);
      onComplete?.();
      return;
    }

    const startTime = performance.now();

    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const rawPct = Math.min(100, Math.floor((elapsed / durationMs) * 100));

      setProgress(rawPct);

      // Update status steps
      const currentStep = [...STATUS_STEPS]
        .reverse()
        .find((s) => rawPct >= s.threshold);
      if (currentStep) {
        setStatusText(currentStep.text);
      }

      if (rawPct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsFinished(true);
          sessionStorage.setItem("nxtgen_preloader_seen", "true");
          setTimeout(() => {
            setShouldRender(false);
            onComplete?.();
          }, 650); // Wait for exit animation
        }, 200);
      }
    }, 28);

    return () => clearInterval(interval);
  }, [durationMs, onComplete]);

  if (!shouldRender) return null;

  return (
    <AnimatePresence>
      {!isFinished && (
        <motion.div
          key="preloader-overlay"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.05,
            filter: "blur(14px)",
            transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#000000] overflow-hidden select-none"
        >
          {/* Ambient Futuristic Glow Orbs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] bg-gradient-to-tr from-purple-600/25 via-violet-600/15 to-cyan-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />

          {/* Central Holographic Tech Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative flex flex-col items-center justify-center p-8 sm:p-12 max-w-sm w-[90%] mx-auto z-10"
          >
            {/* Tech Box with Double Neon Borders (inspired by ashens.store) */}
            <div className="relative p-6 sm:p-8 rounded-3xl bg-[#08090E]/90 border border-purple-500/30 shadow-[0_0_50px_rgba(139,92,246,0.25)] backdrop-blur-2xl flex flex-col items-center">
              
              {/* Animated Dashed Tech Ring */}
              <div className="absolute -inset-[3px] rounded-[26px] border border-cyan-400/25 border-dashed pointer-events-none animate-[spin_20s_linear_infinite]" />

              {/* Glowing Corner Accents */}
              <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-purple-400" />
              <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-purple-400" />
              <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-cyan-400" />

              {/* Logo with Ambient Bloom */}
              <div className="relative mb-5 flex items-center justify-center">
                <div className="absolute inset-0 bg-purple-500/30 blur-2xl rounded-full scale-125 pointer-events-none" />
                <Image
                  src="/logonxtgen.png"
                  alt="NXTGEN"
                  width={240}
                  height={65}
                  priority
                  className="h-16 sm:h-20 w-auto object-contain relative z-10 drop-shadow-[0_0_30px_rgba(139,92,246,0.7)]"
                />
              </div>

              {/* Subtitle / Motto */}
              <div className="text-center space-y-1 mb-7">
                <p className="font-mono text-[10px] sm:text-xs tracking-[0.3em] uppercase text-purple-400 font-semibold">
                  Build. Don&apos;t Bet.
                </p>
                <p className="text-[11px] text-gray-500 font-mono tracking-wider">
                  O Futuro Paga Mais
                </p>
              </div>

              {/* Progress Bar Container */}
              <div className="w-56 sm:w-64 space-y-3">
                <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  {/* Glowing progress line */}
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-600 via-violet-500 to-cyan-400 rounded-full"
                    style={{ width: `${progress}%` }}
                    transition={{ ease: "linear", duration: 0.05 }}
                  />
                  {/* Moving glint light bead */}
                  <div
                    className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent via-white/80 to-transparent -translate-x-full pointer-events-none"
                    style={{ left: `${progress}%` }}
                  />
                </div>

                {/* Percentage and Status */}
                <div className="flex items-center justify-between font-mono text-[11px] text-gray-400">
                  <span className="text-cyan-400 font-bold tracking-widest">{progress}%</span>
                  <span className="text-gray-500 text-[10px] uppercase">v2.6 SECURE</span>
                </div>
              </div>

              {/* Status Message */}
              <div className="mt-5 h-4 flex items-center justify-center">
                <motion.p
                  key={statusText}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="font-mono text-[10px] sm:text-[11px] text-gray-400 tracking-wider text-center"
                >
                  {statusText}
                </motion.p>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
