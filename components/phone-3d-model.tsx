"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";

interface Phone3DModelProps {
  highlightBenefits?: boolean;
  animateXp?: boolean;
  glowIntensity?: number;
  rotationX?: number | MotionValue<number>;
  rotationY?: number | MotionValue<number>;
  rotationZ?: number | MotionValue<number>;
  className?: string;
}

// Helper to create a 2D rounded rectangle shape for Three.js extrusion
function createRoundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

// Procedural Screen UI Drawer onto 2D Canvas (mapped as WebGL Texture)
function renderPhoneScreenCanvas(
  canvas: HTMLCanvasElement,
  options: { animateXp: boolean; highlightBenefits: boolean }
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  // 1. OLED Screen Background (Deep Black with subtle purple glow)
  ctx.fillStyle = "#06070a";
  ctx.fillRect(0, 0, w, h);

  const bgGradient = ctx.createRadialGradient(w / 2, 250, 60, w / 2, 450, 700);
  bgGradient.addColorStop(0, "rgba(139, 92, 246, 0.14)");
  bgGradient.addColorStop(1, "rgba(6, 7, 10, 0)");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, w, h);

  // 2. Status Bar (9:41, Cellular, WiFi, Battery)
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 38px 'Inter', -apple-system, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("9:41", 80, 95);

  // Cellular bars
  const barX = w - 190;
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i < 4 ? "#ffffff" : "rgba(255,255,255,0.3)";
    ctx.fillRect(barX + i * 11, 95 - (i + 1) * 6, 7, (i + 1) * 6);
  }
  // WiFi Wave symbol
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(w - 128, 92, 14, Math.PI * 1.25, Math.PI * 1.75);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(w - 128, 92, 7, Math.PI * 1.25, Math.PI * 1.75);
  ctx.stroke();

  // Battery capsule
  const batX = w - 95;
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(batX, 76, 46, 24, 7);
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.roundRect(batX + 3.5, 79.5, 30, 17, 4);
  ctx.fill();
  ctx.fillRect(batX + 46, 84, 3, 8);

  // Dynamic Island Notch
  const diWidth = 280;
  const diHeight = 74;
  const diX = (w - diWidth) / 2;
  const diY = 48;
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.roundRect(diX, diY, diWidth, diHeight, 37);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Front camera lens reflection inside dynamic island
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(diX + 45, diY + 37, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1e1b4b";
  ctx.beginPath();
  ctx.arc(diX + 45, diY + 37, 7, 0, Math.PI * 2);
  ctx.fill();

  // 3. Top Tag & Notification Bell
  ctx.fillStyle = "rgba(168, 85, 247, 0.18)";
  ctx.beginPath();
  ctx.roundRect(65, 175, 175, 48, 24);
  ctx.fill();
  ctx.strokeStyle = "rgba(168, 85, 247, 0.4)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = "bold 22px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#c084fc";
  ctx.textAlign = "center";
  ctx.fillText("NXT PASS", 65 + 175 / 2, 206);

  // Bell button circle
  const bellX = w - 90;
  const bellY = 199;
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.beginPath();
  ctx.arc(bellX, bellY, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = "24px 'Inter', sans-serif";
  ctx.fillStyle = "#e2e8f0";
  ctx.fillText("🔔", bellX, bellY + 7);

  // Notification dot
  ctx.fillStyle = "#c084fc";
  ctx.beginPath();
  ctx.arc(bellX + 16, bellY - 14, 7, 0, Math.PI * 2);
  ctx.fill();

  // 4. Greeting Header
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 58px 'Inter', sans-serif";
  ctx.fillText("Bom dia, Rafael 👋", 65, 305);

  ctx.fillStyle = "#c084fc";
  ctx.font = "bold 38px 'Inter', sans-serif";
  ctx.fillText("Você está evoluindo!", 65, 365);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "400 28px 'Inter', sans-serif";
  ctx.fillText("Continue acumulando hábitos e subindo de nível.", 65, 415);

  // 5. Level Card (NXT Level 3)
  const cardX = 65;
  const cardY = 475;
  const cardW = w - 130;
  const cardH = 370;

  const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
  cardGrad.addColorStop(0, "#1c142e");
  cardGrad.addColorStop(1, "#0d0b17");

  ctx.fillStyle = cardGrad;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 36);
  ctx.fill();

  ctx.strokeStyle = "rgba(168, 85, 247, 0.4)";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Card Content
  ctx.font = "600 24px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("SEU NÍVEL ATUAL", cardX + 45, cardY + 68);

  ctx.font = "bold 56px 'Inter', sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("NXT Level 3", cardX + 45, cardY + 135);

  ctx.font = "500 24px 'Inter', sans-serif";
  ctx.fillStyle = "#a855f7";
  ctx.fillText("Desbloqueie salas VIP ilimitadas no Nível 4", cardX + 45, cardY + 180);

  // Hexagonal Level 3 Badge
  const badgeCenterX = cardX + cardW - 95;
  const badgeCenterY = cardY + 100;
  const badgeSize = 52;
  ctx.save();
  ctx.translate(badgeCenterX, badgeCenterY);
  ctx.fillStyle = "rgba(139, 92, 246, 0.28)";
  ctx.strokeStyle = "#c084fc";
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const px = badgeSize * Math.cos(angle);
    const py = badgeSize * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 44px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("3", 0, 2);
  ctx.restore();

  // XP Progress Bar
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = "600 26px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#c084fc";
  ctx.fillText("XP da Temporada", cardX + 45, cardY + 250);

  ctx.textAlign = "right";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px 'JetBrains Mono', monospace";
  ctx.fillText("2.150 / 3.000 XP", cardX + cardW - 45, cardY + 250);

  // Progress Bar Track
  const trackX = cardX + 45;
  const trackY = cardY + 275;
  const trackW = cardW - 90;
  const trackH = 24;

  ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
  ctx.beginPath();
  ctx.roundRect(trackX, trackY, trackW, trackH, 12);
  ctx.fill();

  // Progress Bar Fill
  const fillPercent = options.animateXp ? 0.716 : 0.6;
  const fillW = trackW * fillPercent;
  const fillGrad = ctx.createLinearGradient(trackX, trackY, trackX + fillW, trackY);
  fillGrad.addColorStop(0, "#9333ea");
  fillGrad.addColorStop(0.5, "#a855f7");
  fillGrad.addColorStop(1, "#06b6d4");

  ctx.fillStyle = fillGrad;
  ctx.beginPath();
  ctx.roundRect(trackX, trackY, fillW, trackH, 12);
  ctx.fill();

  ctx.textAlign = "left";
  ctx.font = "bold 22px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#34d399";
  ctx.fillText("+350 XP hoje • 71.6% da temporada", cardX + 45, cardY + 338);

  // 6. Benefits Grid Title
  ctx.textAlign = "left";
  ctx.font = "bold 38px 'Inter', sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Seus benefícios", 65, 905);

  ctx.textAlign = "right";
  ctx.font = "600 28px 'Inter', sans-serif";
  ctx.fillStyle = "#c084fc";
  ctx.fillText("Ver todos ›", w - 65, 905);

  // 7. Benefits Cards (3 Columns)
  const bY = 945;
  const bH = 260;
  const bMargin = 20;
  const bW = (w - 130 - bMargin * 2) / 3;

  const benefits = [
    { title: "Salas VIP", sub: "Ilimitado", desc: "Aeroportos", color: "#a855f7", icon: "✈" },
    { title: "Cashback", sub: "R$ 45,00", desc: "Disponível Pix", color: "#06b6d4", icon: "✦" },
    { title: "Anuidade", sub: "Grátis", desc: "Economia total", color: "#3b82f6", icon: "💳" },
  ];

  benefits.forEach((b, idx) => {
    const bX = 65 + idx * (bW + bMargin);

    // Card background
    ctx.fillStyle = options.highlightBenefits
      ? "rgba(28, 20, 48, 0.95)"
      : "rgba(15, 18, 28, 0.88)";
    ctx.beginPath();
    ctx.roundRect(bX, bY, bW, bH, 28);
    ctx.fill();

    ctx.strokeStyle = options.highlightBenefits
      ? "rgba(192, 132, 252, 0.9)"
      : "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = options.highlightBenefits ? 4 : 2;
    ctx.stroke();

    // Icon Circle
    ctx.fillStyle = b.color + "25";
    ctx.beginPath();
    ctx.arc(bX + bW / 2, bY + 60, 36, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = b.color;
    ctx.font = "34px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(b.icon, bX + bW / 2, bY + 60);

    // Title & Subtitle & Description
    ctx.textBaseline = "alphabetic";
    ctx.font = "bold 28px 'Inter', sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(b.title, bX + bW / 2, bY + 140);

    ctx.font = "bold 24px 'JetBrains Mono', monospace";
    ctx.fillStyle = b.color;
    ctx.fillText(b.sub, bX + bW / 2, bY + 185);

    ctx.font = "400 20px 'Inter', sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(b.desc, bX + bW / 2, bY + 225);
  });

  // 8. Quests & Activities (Fills middle/lower screen)
  // Quest 1: Meta Semanal
  const q1Y = 1255;
  const qH = 135;
  ctx.fillStyle = "rgba(18, 15, 28, 0.9)";
  ctx.beginPath();
  ctx.roundRect(65, q1Y, w - 130, qH, 28);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Green dot
  ctx.fillStyle = "#10b981";
  ctx.beginPath();
  ctx.arc(110, q1Y + qH / 2, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = "left";
  ctx.font = "bold 28px 'Inter', sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Meta Semanal: Poupança Automática", 145, q1Y + 55);

  ctx.font = "400 24px 'Inter', sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("Economize R$ 50 para liberar cupons exclusivos", 145, q1Y + 98);

  ctx.textAlign = "right";
  ctx.font = "bold 26px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#34d399";
  ctx.fillText("+150 XP", w - 100, q1Y + qH / 2 + 8);

  // Quest 2: Desafio Hábitos Saudáveis
  const q2Y = 1425;
  ctx.fillStyle = "rgba(18, 15, 28, 0.9)";
  ctx.beginPath();
  ctx.roundRect(65, q2Y, w - 130, qH, 28);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Purple dot
  ctx.fillStyle = "#a855f7";
  ctx.beginPath();
  ctx.arc(110, q2Y + qH / 2, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = "left";
  ctx.font = "bold 28px 'Inter', sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Desafio: 14 Dias Sem Apostas", 145, q2Y + 55);

  ctx.font = "400 24px 'Inter', sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("Progresso da comunidade: 11/14 dias concluídos", 145, q2Y + 98);

  ctx.textAlign = "right";
  ctx.font = "bold 26px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#c084fc";
  ctx.fillText("+500 XP", w - 100, q2Y + qH / 2 + 8);

  // Quest 3: Cupom Ativo em Destaque
  const q3Y = 1595;
  ctx.fillStyle = "rgba(18, 15, 28, 0.9)";
  ctx.beginPath();
  ctx.roundRect(65, q3Y, w - 130, qH, 28);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Cyan dot
  ctx.fillStyle = "#06b6d4";
  ctx.beginPath();
  ctx.arc(110, q3Y + qH / 2, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = "left";
  ctx.font = "bold 28px 'Inter', sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.fillText("Cupom Ativo: 20% Off Starbucks", 145, q3Y + 55);

  ctx.font = "400 24px 'Inter', sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("Válido até 15/10 • Toque para resgate rápido", 145, q3Y + 98);

  ctx.textAlign = "right";
  ctx.font = "bold 24px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#22d3ee";
  ctx.fillText("Resgatar ›", w - 100, q3Y + qH / 2 + 8);

  // 9. Bottom Navigation Dock (5 Tabs)
  const navY = h - 200;
  const navH = 150;
  ctx.fillStyle = "rgba(8, 9, 13, 0.96)";
  ctx.fillRect(0, navY, w, navH);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, navY);
  ctx.lineTo(w, navY);
  ctx.stroke();

  const tabs = [
    { label: "Início", icon: "⌂", active: false },
    { label: "Cartão", icon: "💳", active: false },
    { label: "Investir", icon: "📈", active: false },
    { label: "Benefícios", icon: "🎁", active: true },
    { label: "Perfil", icon: "👤", active: false },
  ];

  const tabWidth = w / tabs.length;
  tabs.forEach((t, i) => {
    const tX = i * tabWidth + tabWidth / 2;
    ctx.textAlign = "center";
    ctx.font = "36px 'Inter', sans-serif";
    ctx.fillStyle = t.active ? "#c084fc" : "#64748b";
    ctx.fillText(t.icon, tX, navY + 58);

    ctx.font = t.active ? "bold 24px 'Inter', sans-serif" : "500 22px 'Inter', sans-serif";
    ctx.fillText(t.label, tX, navY + 98);

    if (t.active) {
      ctx.fillStyle = "#c084fc";
      ctx.beginPath();
      ctx.arc(tX, navY + 115, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Home Indicator Bar (iOS)
  const barWidth = 280;
  const barYPos = h - 25;
  ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
  ctx.beginPath();
  ctx.roundRect((w - barWidth) / 2, barYPos, barWidth, 8, 4);
  ctx.fill();
}

export function Phone3DModel({
  highlightBenefits = false,
  animateXp = false,
  glowIntensity = 1,
  rotationX = 12,
  rotationY = -15,
  rotationZ = 4,
  className,
}: Phone3DModelProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const screenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const screenTextureRef = useRef<THREE.CanvasTexture | null>(null);

  const getInitialRot = (val: number | MotionValue<number> | undefined, fallback: number) => {
    if (typeof val === "number") return val;
    if (val && typeof (val as MotionValue<number>).get === "function") return (val as MotionValue<number>).get();
    return fallback;
  };

  const targetRotationRef = useRef({
    x: getInitialRot(rotationX, 12),
    y: getInitialRot(rotationY, -15),
    z: getInitialRot(rotationZ, 4),
  });
  const currentRotationRef = useRef({
    x: getInitialRot(rotationX, 12),
    y: getInitialRot(rotationY, -15),
    z: getInitialRot(rotationZ, 4),
  });
  const mouseOffsetRef = useRef({ x: 0, y: 0 });

  // Update target rotation whenever rotation props change (supports both number and MotionValue)
  useEffect(() => {
    if (typeof rotationX === "number") {
      targetRotationRef.current.x = rotationX;
    } else if (rotationX && typeof (rotationX as MotionValue<number>).on === "function") {
      targetRotationRef.current.x = (rotationX as MotionValue<number>).get();
      return (rotationX as MotionValue<number>).on("change", (latest) => {
        targetRotationRef.current.x = latest;
      });
    }
  }, [rotationX]);

  useEffect(() => {
    if (typeof rotationY === "number") {
      targetRotationRef.current.y = rotationY;
    } else if (rotationY && typeof (rotationY as MotionValue<number>).on === "function") {
      targetRotationRef.current.y = (rotationY as MotionValue<number>).get();
      return (rotationY as MotionValue<number>).on("change", (latest) => {
        targetRotationRef.current.y = latest;
      });
    }
  }, [rotationY]);

  useEffect(() => {
    if (typeof rotationZ === "number") {
      targetRotationRef.current.z = rotationZ;
    } else if (rotationZ && typeof (rotationZ as MotionValue<number>).on === "function") {
      targetRotationRef.current.z = (rotationZ as MotionValue<number>).get();
      return (rotationZ as MotionValue<number>).on("change", (latest) => {
        targetRotationRef.current.z = latest;
      });
    }
  }, [rotationZ]);

  // Dynamically re-render screen canvas texture without re-mounting Three.js scene
  useEffect(() => {
    if (screenCanvasRef.current && screenTextureRef.current) {
      renderPhoneScreenCanvas(screenCanvasRef.current, { highlightBenefits, animateXp });
      screenTextureRef.current.needsUpdate = true;
    }
  }, [highlightBenefits, animateXp]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Three.js Scene, Camera & Renderer
    const scene = new THREE.Scene();

    const width = container.clientWidth || 380;
    const height = container.clientHeight || 750;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 11.2);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 2. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    // Key Light (Cyan / Cool White specular edge)
    const keyLight = new THREE.DirectionalLight(0xa5f3fc, 3.2);
    keyLight.position.set(6, 7, 8);
    scene.add(keyLight);

    // Rim Light (Neon Violet / Purple back-edge)
    const rimLight = new THREE.DirectionalLight(0xc084fc, 4.0);
    rimLight.position.set(-7, -4, 6);
    scene.add(rimLight);

    // Rear Light for Camera Module Highlights
    const backLight = new THREE.DirectionalLight(0x818cf8, 2.5);
    backLight.position.set(0, 5, -8);
    scene.add(backLight);

    // 3. iPhone Procedural 3D Mesh Construction (Group)
    const phoneGroup = new THREE.Group();
    scene.add(phoneGroup);

    // Geometry Dimensions (iPhone Pro ratio)
    const phoneW = 3.3;
    const phoneH = 6.8;
    const phoneR = 0.65;
    const phoneDepth = 0.36;

    // A. Titanium Beveled Outer Chassis
    const chassisShape = createRoundedRectShape(phoneW, phoneH, phoneR);
    const chassisGeo = new THREE.ExtrudeGeometry(chassisShape, {
      depth: phoneDepth,
      bevelEnabled: true,
      bevelSegments: 6,
      steps: 1,
      bevelSize: 0.08,
      bevelThickness: 0.08,
    });
    // Center extrusion along Z
    chassisGeo.center();

    const titaniumMat = new THREE.MeshStandardMaterial({
      color: 0x211736, // Titanium Violet
      metalness: 0.88,
      roughness: 0.28,
    });

    const chassisMesh = new THREE.Mesh(chassisGeo, titaniumMat);
    phoneGroup.add(chassisMesh);

    // B. Side Hardware Buttons
    const buttonMat = new THREE.MeshStandardMaterial({
      color: 0x4c356e,
      metalness: 0.95,
      roughness: 0.2,
    });

    // Left Buttons: Volume Up, Volume Down, Action Button
    const volUpGeo = new THREE.BoxGeometry(0.06, 0.46, 0.12);
    const volUp = new THREE.Mesh(volUpGeo, buttonMat);
    volUp.position.set(-phoneW / 2 - 0.07, 0.85, 0);
    phoneGroup.add(volUp);

    const volDown = new THREE.Mesh(volUpGeo, buttonMat);
    volDown.position.set(-phoneW / 2 - 0.07, 0.25, 0);
    phoneGroup.add(volDown);

    const actionBtnGeo = new THREE.BoxGeometry(0.06, 0.28, 0.12);
    const actionBtn = new THREE.Mesh(actionBtnGeo, buttonMat);
    actionBtn.position.set(-phoneW / 2 - 0.07, 1.45, 0);
    phoneGroup.add(actionBtn);

    // Right Button: Power / Lock Button
    const powerBtnGeo = new THREE.BoxGeometry(0.06, 0.75, 0.12);
    const powerBtn = new THREE.Mesh(powerBtnGeo, buttonMat);
    powerBtn.position.set(phoneW / 2 + 0.07, 0.7, 0);
    phoneGroup.add(powerBtn);

    // C. Rear Camera Module (Plateau + 3 Lenses)
    const cameraBumpShape = createRoundedRectShape(1.45, 1.45, 0.38);
    const cameraBumpGeo = new THREE.ExtrudeGeometry(cameraBumpShape, {
      depth: 0.1,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.04,
      bevelThickness: 0.04,
    });
    cameraBumpGeo.center();

    const cameraBumpMat = new THREE.MeshStandardMaterial({
      color: 0x181126,
      metalness: 0.85,
      roughness: 0.32,
    });
    const cameraBumpMesh = new THREE.Mesh(cameraBumpGeo, cameraBumpMat);
    cameraBumpMesh.position.set(-0.75, 2.3, -phoneDepth / 2 - 0.09);
    phoneGroup.add(cameraBumpMesh);

    // 3 Camera Lenses with Metallic Rings & Sapphire Glass
    const lensPositions = [
      [-0.42, 0.38],
      [-0.42, -0.38],
      [0.38, 0.0],
    ];

    const lensRingGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.08, 32);
    const lensRingMat = new THREE.MeshStandardMaterial({
      color: 0x5a427d,
      metalness: 0.95,
      roughness: 0.15,
    });

    const lensGlassGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.085, 32);
    const lensGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x050508,
      metalness: 0.9,
      roughness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });

    lensPositions.forEach(([lx, ly]) => {
      const ring = new THREE.Mesh(lensRingGeo, lensRingMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(-0.75 + lx, 2.3 + ly, -phoneDepth / 2 - 0.16);
      phoneGroup.add(ring);

      const glass = new THREE.Mesh(lensGlassGeo, lensGlassMat);
      glass.rotation.x = Math.PI / 2;
      glass.position.set(-0.75 + lx, 2.3 + ly, -phoneDepth / 2 - 0.162);
      phoneGroup.add(glass);
    });

    // LED Flash (Circle at top-right of camera module)
    const flashGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 24);
    const flashMat = new THREE.MeshStandardMaterial({
      color: 0xfffbeb,
      metalness: 0.1,
      roughness: 0.2,
      emissive: 0xfff7ed,
      emissiveIntensity: 0.35,
    });
    const flashMesh = new THREE.Mesh(flashGeo, flashMat);
    flashMesh.rotation.x = Math.PI / 2;
    flashMesh.position.set(-0.75 + 0.38, 2.3 + 0.38, -phoneDepth / 2 - 0.12);
    phoneGroup.add(flashMesh);

    // LiDAR Scanner (Dark matte circle at bottom-right of camera module)
    const lidarGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.05, 24);
    const lidarMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      metalness: 0.8,
      roughness: 0.4,
    });
    const lidarMesh = new THREE.Mesh(lidarGeo, lidarMat);
    lidarMesh.rotation.x = Math.PI / 2;
    lidarMesh.position.set(-0.75 + 0.38, 2.3 - 0.38, -phoneDepth / 2 - 0.12);
    phoneGroup.add(lidarMesh);

    // Antenna Bands on Titanium Rim
    const bandMat = new THREE.MeshBasicMaterial({ color: 0x140d22 });
    const bandGeo = new THREE.BoxGeometry(0.04, 0.08, phoneDepth + 0.15);
    const bandPositions = [
      [-phoneW / 2 - 0.07, 2.3],
      [-phoneW / 2 - 0.07, -2.3],
      [phoneW / 2 + 0.07, 2.3],
      [phoneW / 2 + 0.07, -2.3],
    ];
    bandPositions.forEach(([bx, by]) => {
      const band = new THREE.Mesh(bandGeo, bandMat);
      band.position.set(bx, by, 0);
      phoneGroup.add(band);
    });

    // D. Front OLED Screen Canvas & Texture
    const screenCanvas = document.createElement("canvas");
    screenCanvas.width = 1024;
    screenCanvas.height = 2160;
    renderPhoneScreenCanvas(screenCanvas, { highlightBenefits, animateXp });
    screenCanvasRef.current = screenCanvas;

    const screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.colorSpace = THREE.SRGBColorSpace;
    screenTexture.minFilter = THREE.LinearFilter;
    screenTexture.magFilter = THREE.LinearFilter;
    screenTextureRef.current = screenTexture;

    // Screen Geometry with Normalized UV Coordinates [0, 1]
    const screenShape = createRoundedRectShape(3.15, 6.65, 0.58);
    const screenGeo = new THREE.ShapeGeometry(screenShape);

    // Compute exact 0..1 UV mapping across the screen geometry
    const pos = screenGeo.attributes.position;
    const uvs = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i);
      const py = pos.getY(i);
      uvs[i * 2] = (px + 3.15 / 2) / 3.15;
      uvs[i * 2 + 1] = (py + 6.65 / 2) / 6.65;
    }
    screenGeo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));

    const screenMat = new THREE.MeshBasicMaterial({
      map: screenTexture,
      toneMapped: false,
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 0, phoneDepth / 2 + 0.081);
    phoneGroup.add(screenMesh);

    // E. Sapphire Protective Front Glass Overlay
    const glassGeo = new THREE.ShapeGeometry(screenShape);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.04,
      roughness: 0.06,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      depthWrite: false,
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.set(0, 0, phoneDepth / 2 + 0.083);
    phoneGroup.add(glassMesh);

    // 4. Mouse Interactive Parallax Listener
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;
      mouseOffsetRef.current = {
        x: normX * 4.5, // subtle degrees
        y: -normY * 4.5,
      };
    };
    window.addEventListener("mousemove", handleMouseMove);

    // 5. Animation Render Loop (Silky 60fps interpolation)
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth interpolation toward target rotation + mouse offset
      const targetX = targetRotationRef.current.x + mouseOffsetRef.current.y;
      const targetY = targetRotationRef.current.y + mouseOffsetRef.current.x;
      const targetZ = targetRotationRef.current.z;

      currentRotationRef.current.x += (targetX - currentRotationRef.current.x) * 0.08;
      currentRotationRef.current.y += (targetY - currentRotationRef.current.y) * 0.08;
      currentRotationRef.current.z += (targetZ - currentRotationRef.current.z) * 0.08;

      phoneGroup.rotation.x = THREE.MathUtils.degToRad(currentRotationRef.current.x);
      phoneGroup.rotation.y = THREE.MathUtils.degToRad(currentRotationRef.current.y);
      phoneGroup.rotation.z = THREE.MathUtils.degToRad(currentRotationRef.current.z);

      renderer.render(scene, camera);
    };

    animate();

    // 6. Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 380;
      const newH = container.clientHeight || 750;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener("resize", handleResize);

    // 7. Cleanup on Unmount
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);

      renderer.dispose();
      chassisGeo.dispose();
      titaniumMat.dispose();
      buttonMat.dispose();
      cameraBumpGeo.dispose();
      cameraBumpMat.dispose();
      lensRingGeo.dispose();
      lensRingMat.dispose();
      lensGlassGeo.dispose();
      lensGlassMat.dispose();
      screenGeo.dispose();
      screenMat.dispose();
      screenTexture.dispose();
      glassGeo.dispose();
      glassMat.dispose();

      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className={className}>
      {/* Background Multi-layer Ambient Backlight (Glow Purple & Glow Cyan) */}
      <div
        className="absolute -inset-4 rounded-[60px] bg-gradient-to-tr from-purple-600/30 via-violet-500/20 to-cyan-400/25 blur-2xl -z-10 transition-opacity duration-700 pointer-events-none"
        style={{ opacity: glowIntensity }}
      />
      <div
        className="absolute -inset-10 rounded-[80px] bg-purple-600/15 blur-3xl -z-20 pointer-events-none animate-pulse"
        style={{ animationDuration: "6s" }}
      />

      {/* WebGL 3D Canvas Mount Point */}
      <div
        ref={mountRef}
        className="w-[340px] sm:w-[380px] h-[680px] sm:h-[750px] flex items-center justify-center pointer-events-auto"
      />
    </div>
  );
}
