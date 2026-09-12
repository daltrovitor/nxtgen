"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, Sparkles } from "lucide-react";

// Combined component for 404 page
export default function NotFoundPage() {
  return (
    <div className="w-full h-screen bg-[#020205] overflow-hidden flex justify-center items-center relative select-none font-sans">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      <MessageDisplay />
      <CharactersAnimation />
      <CircleAnimation />
    </div>
  );
}

// 1. Message Display Component
function MessageDisplay() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute flex flex-col justify-center items-center w-[90%] max-w-2xl h-[90%] z-[100] pointer-events-none">
      <div
        className={`flex flex-col items-center text-center transition-all duration-700 pointer-events-auto p-8 sm:p-10 rounded-3xl bg-[#08090E]/85 border border-white/10 backdrop-blur-2xl shadow-[0_0_60px_rgba(139,92,246,0.2)] ${
          isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        {/* Protocol status badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>ERRO 404 • ROTA DESCONHECIDA</span>
        </div>

        {/* 404 Big Glowing Number */}
        <div className="text-[75px] sm:text-[110px] font-black tracking-tighter leading-none bg-gradient-to-r from-purple-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent my-1 drop-shadow-[0_0_40px_rgba(139,92,246,0.6)] font-mono">
          404
        </div>

        {/* Title */}
        <div className="text-xl sm:text-2xl font-bold text-white tracking-wide mt-2 mb-3">
          Página Não Encontrada
        </div>

        {/* Description */}
        <div className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
          A página ou protocolo que você tentou acessar não existe, foi movida ou está temporariamente fora de alcance na rede NXTGEN.
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 mt-7 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto text-gray-200 hover:text-white border border-white/15 bg-white/5 hover:bg-white/10 hover:border-purple-500/50 backdrop-blur-md transition-all duration-300 ease-in-out px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 hover:scale-[1.03] cursor-pointer shadow-md group"
          >
            <ArrowLeft className="w-4 h-4 text-purple-400 transition-transform group-hover:-translate-x-1" />
            Voltar
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold transition-all duration-300 ease-in-out px-6 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 hover:scale-[1.03] cursor-pointer shadow-[0_0_25px_rgba(139,92,246,0.4)] group"
          >
            <Home className="w-4 h-4 transition-transform group-hover:scale-110" />
            Ir para o Início
          </button>
        </div>
      </div>
    </div>
  );
}

// 2. Characters Animation Component (Adaptado com o ícone "X" da logo NXTGEN)
type XFigure = {
  top?: string;
  bottom?: string;
  src: string;
  transform?: string;
  speedX: number;
  speedRotation?: number;
  size?: number;
  opacity?: number;
};

function CharactersAnimation() {
  const charactersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Configurações dos ícones "X" da logo NXTGEN atravessando e girando na tela
    const xFigures: XFigure[] = [
      {
        top: "8%",
        src: "/iconenxt.png",
        transform: "rotateZ(-45deg)",
        speedX: 18000,
        speedRotation: 6000,
        size: 70,
        opacity: 0.85,
      },
      {
        top: "22%",
        src: "/iconenxt.png",
        speedX: 12000,
        speedRotation: 4500,
        size: 110,
        opacity: 0.9,
      },
      {
        top: "40%",
        src: "/iconenxt.png",
        speedX: 24000,
        speedRotation: 8000,
        size: 55,
        opacity: 0.6,
      },
      {
        top: "65%",
        src: "/iconenxt.png",
        speedX: 15000,
        speedRotation: 5000,
        size: 90,
        opacity: 0.85,
      },
      {
        top: "80%",
        src: "/iconenxt.png",
        speedX: 10000,
        speedRotation: 3500,
        size: 130,
        opacity: 0.75,
      },
      {
        bottom: "6%",
        src: "/iconenxt.png",
        speedX: 0,
        speedRotation: 12000,
        size: 60,
        opacity: 0.5,
      },
    ];

    const container = charactersRef.current;
    if (!container) return;
    container.innerHTML = "";

    // Instancia e anima cada ícone "X" da logo NXTGEN
    xFigures.forEach((figure) => {
      const img = document.createElement("img");
      img.classList.add("characters");
      img.style.position = "absolute";
      img.style.width = `${figure.size || 80}px`;
      img.style.height = "auto";
      img.style.opacity = `${figure.opacity ?? 0.8}`;
      img.style.filter =
        "drop-shadow(0 0 20px rgba(139, 92, 246, 0.65)) drop-shadow(0 0 40px rgba(6, 182, 212, 0.4))";
      img.style.pointerEvents = "none";
      img.alt = "NXTGEN X";

      if (figure.top) img.style.top = figure.top;
      if (figure.bottom) img.style.bottom = figure.bottom;

      img.src = figure.src;

      if (figure.transform) {
        img.style.transform = figure.transform;
      }

      container.appendChild(img);

      // Se for elemento estático, apenas gira suavemente
      if (figure.speedX === 0) {
        if (figure.speedRotation) {
          img.animate(
            [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
            { duration: figure.speedRotation, iterations: Infinity, easing: "linear" }
          );
        }
        return;
      }

      // Animação de translação horizontal contínua da direita para a esquerda
      img.animate(
        [{ left: "105%" }, { left: "-20%" }],
        { duration: figure.speedX, iterations: Infinity, easing: "linear" }
      );

      // Animação de rotação contínua
      if (figure.speedRotation) {
        img.animate(
          [{ transform: "rotate(0deg)" }, { transform: "rotate(-360deg)" }],
          { duration: figure.speedRotation, iterations: Infinity, easing: "linear" }
        );
      }
    });

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, []);

  return (
    <div
      ref={charactersRef}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-10"
    />
  );
}

// 3. Circle Animation Component (Física de partículas em Canvas do prompt original)
interface Circulo {
  x: number;
  y: number;
  size: number;
}

function CircleAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestIdRef = useRef<number | undefined>(undefined);
  const timerRef = useRef(0);
  const circulosRef = useRef<Circulo[]>([]);

  const initArr = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    circulosRef.current = [];

    for (let index = 0; index < 300; index++) {
      const randomX =
        Math.floor(
          Math.random() * (canvas.width * 3 - canvas.width * 1.2 + 1)
        ) + canvas.width * 1.2;

      const randomY =
        Math.floor(
          Math.random() * (canvas.height - canvas.height * -0.2 + 1)
        ) + canvas.height * -0.2;

      const size = canvas.width / 1000;

      circulosRef.current.push({ x: randomX, y: randomY, size });
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    timerRef.current++;
    context.setTransform(1, 0, 0, 1, 0, 0);

    const distanceX = canvas.width / 80;
    const growthRate = canvas.width / 1000;

    context.fillStyle = "rgba(255, 255, 255, 0.75)";
    context.clearRect(0, 0, canvas.width, canvas.height);

    circulosRef.current.forEach((circulo) => {
      context.beginPath();

      if (timerRef.current < 65) {
        circulo.x = circulo.x - distanceX;
        circulo.size = circulo.size + growthRate;
      }

      if (timerRef.current >= 65 && timerRef.current < 500) {
        circulo.x = circulo.x - distanceX * 0.02;
        circulo.size = circulo.size + growthRate * 0.2;
      }

      context.arc(circulo.x, circulo.y, Math.max(0.1, circulo.size), 0, Math.PI * 2);
      context.fill();
    });

    if (timerRef.current > 500) {
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
      }
      return;
    }

    requestIdRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    timerRef.current = 0;
    initArr();
    draw();

    const handleResize = () => {
      if (!canvas) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      timerRef.current = 0;
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
      }

      const context = canvas.getContext("2d");
      if (context) {
        context.reset();
      }

      initArr();
      draw();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
}

export { NotFoundPage };
