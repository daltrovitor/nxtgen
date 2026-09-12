"use client";

import React, { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, RefreshCw, Upload, Zap, AlertCircle } from "lucide-react";

interface PartnerQrScannerProps {
  onScan: (decodedText: string) => void;
  isScanningActive: boolean;
}

export function PartnerQrScanner({ onScan, isScanningActive }: PartnerQrScannerProps) {
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [isCameraRunning, setIsCameraRunning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const html5QrCodeRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerContainerId = "partner-qr-reader";

  // Initialize and start scanner
  useEffect(() => {
    let isMounted = true;

    async function initScanner() {
      if (!isScanningActive) return;

      try {
        setIsInitializing(true);
        setCameraPermissionError(null);

        const { Html5Qrcode } = await import("html5-qrcode");

        // Clear existing instance if any
        if (html5QrCodeRef.current) {
          try {
            if (html5QrCodeRef.current.isScanning) {
              await html5QrCodeRef.current.stop();
            }
            html5QrCodeRef.current.clear();
          } catch (e) {
            console.warn("Cleanup warning:", e);
          }
        }

        if (!isMounted) return;

        const scanner = new Html5Qrcode(scannerContainerId);
        html5QrCodeRef.current = scanner;

        const config = {
          fps: 15,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
        };

        await scanner.start(
          { facingMode },
          config,
          (decodedText: string) => {
            if (isMounted) {
              // Haptic feedback
              if (typeof window !== "undefined" && "vibrate" in navigator) {
                navigator.vibrate([100, 50, 100]);
              }
              onScan(decodedText);
            }
          },
          () => {
            // Frame error (silently ignore non-scanned frames)
          }
        );

        if (isMounted) {
          setIsCameraRunning(true);
          setIsInitializing(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Camera scanner error:", err);
          setCameraPermissionError(
            err?.message?.includes("NotAllowedError") || err?.name === "NotAllowedError"
              ? "Permissão da câmera negada. Habilite a câmera nas configurações do navegador ou utilize o envio de imagem/código manual."
              : "Não foi possível inicializar a câmera. Você pode alternar a câmera ou carregar uma foto do QR Code."
          );
          setIsCameraRunning(false);
          setIsInitializing(false);
        }
      }
    }

    initScanner();

    return () => {
      isMounted = false;
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            html5QrCodeRef.current.stop().catch(() => {});
          }
          html5QrCodeRef.current.clear();
        } catch {}
      }
    };
  }, [facingMode, isScanningActive, onScan]);

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = html5QrCodeRef.current || new Html5Qrcode(scannerContainerId);
      const result = await scanner.scanFile(file, true);
      if (result) {
        onScan(result);
      }
    } catch (err: any) {
      alert("Não foi possível identificar um QR Code válido na imagem enviada.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto space-y-4">
      {/* Viewport Box */}
      <div className="relative w-full aspect-square max-w-[340px] rounded-3xl bg-[#030407] border-2 border-white/10 overflow-hidden shadow-2xl shadow-[#8B24F0]/10 flex items-center justify-center">
        {/* Hidden video target container for html5-qrcode */}
        <div id={scannerContainerId} className="w-full h-full object-cover" />

        {/* Loading Spinner */}
        {isInitializing && !cameraPermissionError && (
          <div className="absolute inset-0 bg-[#030407]/90 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-3 z-20">
            <div className="w-9 h-9 border-3 border-[#8B24F0] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono text-gray-400">Ativando sensor óptico...</p>
          </div>
        )}

        {/* Error State */}
        {cameraPermissionError && (
          <div className="absolute inset-0 bg-[#0A050A]/95 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center space-y-4 z-20">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <CameraOff className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold font-heading text-white">Câmera Indisponível</h4>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                {cameraPermissionError}
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-mono text-white border border-white/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#C084FC]" />
              <span>Carregar Imagem com QR</span>
            </button>
          </div>
        )}

        {/* Cyberpunk Optical Target Overlay (Only when camera is active) */}
        {!isInitializing && !cameraPermissionError && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            {/* Viewfinder Target */}
            <div className="relative w-64 h-64 border-2 border-[#8B24F0]/60 rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(139,36,240,0.3)]">
              {/* Animated Laser Scanning Line */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C084FC] to-transparent shadow-[0_0_15px_#C084FC] animate-pulse"
                style={{
                  animation: "laser-scan 2.2s ease-in-out infinite alternate",
                }}
              />

              {/* Target Corner Reticles */}
              <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

              {/* Center Crosshair */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <div className="w-6 h-0.5 bg-white" />
                <div className="h-6 w-0.5 bg-white absolute" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleFacingMode}
          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-gray-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
          title="Alternar entre câmera traseira e frontal"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#C084FC]" />
          <span>{facingMode === "environment" ? "Câmera Traseira" : "Câmera Frontal"}</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-gray-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
          title="Ler QR Code a partir de uma foto ou print"
        >
          <Upload className="w-3.5 h-3.5 text-amber-400" />
          <span>Enviar Foto</span>
        </button>
      </div>

      <p className="text-[11px] font-mono text-gray-500 text-center">
        Aponte a câmera para o QR Code exibido na tela do smartphone do associado.
      </p>

      <style jsx global>{`
        @keyframes laser-scan {
          0% {
            top: 5%;
          }
          100% {
            top: 92%;
          }
        }
        #partner-qr-reader video {
          border-radius: 1.5rem !important;
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>
    </div>
  );
}
