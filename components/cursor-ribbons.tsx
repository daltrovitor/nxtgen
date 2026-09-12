"use client";

import React, { useEffect, useRef } from "react";
import { Renderer, Transform, Polyline, Vec3, Color } from "ogl";
import { useTheme } from "@/components/theme-provider";

interface CursorRibbonsProps {
  colors?: string[];
  baseSpring?: number;
  baseFriction?: number;
  baseThickness?: number;
  offsetFactor?: number;
  maxAge?: number;
  pointCount?: number;
  speedMultiplier?: number;
  enableFade?: boolean;
  enableShaderEffect?: boolean;
  effectAmplitude?: number;
  backgroundColor?: number[];
}

export function CursorRibbons({
  colors = ["#8B5CF6", "#06B6D4", "#A855F7"],
  baseSpring = 0.035,
  baseFriction = 0.88,
  baseThickness = 24,
  offsetFactor = 0.04,
  maxAge = 500,
  pointCount = 50,
  speedMultiplier = 0.5,
  enableFade = true,
  enableShaderEffect = false,
  effectAmplitude = 2,
  backgroundColor = [0, 0, 0, 0],
}: CursorRibbonsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isLight = theme === "light";
  const effectiveColors = isLight
    ? ["#7C3AED", "#0284C7", "#9333EA"]
    : colors;
  const effectiveThickness = isLight ? 18 : baseThickness;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const container = containerRef.current;
    if (!container) return;

    let animFrameId: number;
    let idleTimer: NodeJS.Timeout;

    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio || 2, 2),
      alpha: true,
      antialias: true,
    });
    const gl = renderer.gl;

    if (Array.isArray(backgroundColor) && backgroundColor.length === 4) {
      gl.clearColor(
        backgroundColor[0],
        backgroundColor[1],
        backgroundColor[2],
        backgroundColor[3]
      );
    } else {
      gl.clearColor(0, 0, 0, 0);
    }

    gl.canvas.style.position = "absolute";
    gl.canvas.style.top = "0";
    gl.canvas.style.left = "0";
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.pointerEvents = "none";
    container.appendChild(gl.canvas);

    const scene = new Transform();
    const lines: Array<{
      spring: number;
      friction: number;
      mouseVelocity: InstanceType<typeof Vec3>;
      mouseOffset: InstanceType<typeof Vec3>;
      points: Array<InstanceType<typeof Vec3>>;
      polyline: InstanceType<typeof Polyline>;
    }> = [];

    const handleResize = () => {
      if (!container) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      lines.forEach((line) => line.polyline.resize());
    };

    window.addEventListener("resize", handleResize);

    const centerIndex = (effectiveColors.length - 1) / 2;

    effectiveColors.forEach((colorHex, idx) => {
      const spring = baseSpring + (Math.random() - 0.5) * 0.01;
      const friction = baseFriction + (Math.random() - 0.5) * 0.02;
      const thickness = effectiveThickness + (Math.random() - 0.5) * 3;
      const mouseOffset = new Vec3(
        (idx - centerIndex) * offsetFactor + (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.02,
        0
      );

      const points: Array<InstanceType<typeof Vec3>> = [];
      for (let p = 0; p < pointCount; p++) {
        // Initialize offscreen so initial frame never bridges from (0,0)
        points.push(new Vec3(-9999, -9999, 0));
      }

      const polyline = new Polyline(gl, {
        points,
        vertex: `
          precision highp float;
          attribute vec3 position;
          attribute vec3 next;
          attribute vec3 prev;
          attribute vec2 uv;
          attribute float side;
          
          uniform vec2 uResolution;
          uniform float uDPR;
          uniform float uThickness;
          uniform float uTime;
          uniform float uEnableShaderEffect;
          uniform float uEffectAmplitude;
          
          varying vec2 vUV;
          
          vec4 getPosition() {
              vec4 current = vec4(position, 1.0);
              vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
              vec2 nextScreen = next.xy * aspect;
              vec2 prevScreen = prev.xy * aspect;
              vec2 tangent = normalize(nextScreen - prevScreen);
              vec2 normal = vec2(-tangent.y, tangent.x);
              normal /= aspect;
              normal *= mix(1.0, 0.1, pow(abs(uv.y - 0.5) * 2.0, 2.0));
              float dist = length(nextScreen - prevScreen);
              normal *= smoothstep(0.0, 0.02, dist);
              float pixelWidthRatio = 1.0 / (uResolution.y / uDPR);
              float pixelWidth = current.w * pixelWidthRatio;
              normal *= pixelWidth * uThickness;
              current.xy -= normal * side;
              if (uEnableShaderEffect > 0.5) {
                current.xy += normal * sin(uTime + current.x * 10.0) * uEffectAmplitude;
              }
              return current;
          }
          
          void main() {
              vUV = uv;
              gl_Position = getPosition();
          }
        `,
        fragment: `
          precision highp float;
          uniform vec3 uColor;
          uniform float uOpacity;
          uniform float uEnableFade;
          varying vec2 vUV;
          
          void main() {
              float fadeFactor = 1.0;
              if (uEnableFade > 0.5) {
                  fadeFactor = 1.0 - smoothstep(0.0, 1.0, vUV.y);
              }
              gl_FragColor = vec4(uColor, uOpacity * fadeFactor);
          }
        `,
        uniforms: {
          uColor: { value: new Color(colorHex) },
          uThickness: { value: thickness },
          uOpacity: { value: 0 },
          uTime: { value: 0 },
          uEnableShaderEffect: { value: enableShaderEffect ? 1 : 0 },
          uEffectAmplitude: { value: effectAmplitude },
          uEnableFade: { value: enableFade ? 1 : 0 },
        },
      });

      polyline.mesh.visible = false;
      polyline.mesh.setParent(scene);
      lines.push({
        spring,
        friction,
        mouseVelocity: new Vec3(),
        mouseOffset,
        points,
        polyline,
      });
    });

    handleResize();

    const mousePos = new Vec3();
    let isRunning = false;
    let hasMoved = false;
    let lastTime = performance.now();
    let currentOpacity = 0;
    let targetOpacity = 0;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;

      if ("changedTouches" in e && e.changedTouches.length) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else if (e instanceof MouseEvent) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const winWidth = window.innerWidth || 1920;
      const winHeight = window.innerHeight || 1080;
      mousePos.set((clientX / winWidth) * 2 - 1, -(clientY / winHeight) * 2 + 1, 0);

      targetOpacity = isLight ? 0.75 : 0.9;

      if (!hasMoved) {
        hasMoved = true;
        lines.forEach((line) => {
          line.points.forEach((pt) => pt.copy(mousePos));
          line.mouseVelocity.set(0, 0, 0);
          line.polyline.updateGeometry();
          line.polyline.mesh.visible = true;
        });
      }

      if (!isRunning) {
        isRunning = true;
        lastTime = performance.now();
        renderLoop();
      }

      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        // Smoothly fade out trail when idle so it doesn't stay frozen on screen
        targetOpacity = 0;
      }, 450);
    };

    const handleMouseLeave = () => {
      targetOpacity = 0;
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    const tmpVec = new Vec3();

    function renderLoop() {
      if (!isRunning) return;

      const now = performance.now();
      const delta = now - lastTime;
      lastTime = now;

      // Smoothly transition opacity
      currentOpacity += (targetOpacity - currentOpacity) * 0.12;

      // When fully faded and target is 0, pause loop to save battery and GPU
      if (currentOpacity < 0.005 && targetOpacity === 0) {
        currentOpacity = 0;
        lines.forEach((line) => {
          const uniforms = line.polyline.mesh.program.uniforms;
          if (uniforms && uniforms.uOpacity) {
            uniforms.uOpacity.value = 0;
          }
        });
        renderer.render({ scene });
        isRunning = false;
        return;
      }

      animFrameId = requestAnimationFrame(renderLoop);

      lines.forEach((line) => {
        tmpVec
          .copy(mousePos)
          .add(line.mouseOffset)
          .sub(line.points[0])
          .multiply(line.spring);

        line.mouseVelocity.add(tmpVec).multiply(line.friction);
        line.points[0].add(line.mouseVelocity);

        for (let i = 1; i < line.points.length; i++) {
          if (isFinite(maxAge) && maxAge > 0) {
            const factor = Math.min(
              1,
              (delta * speedMultiplier) / (maxAge / (line.points.length - 1))
            );
            line.points[i].lerp(line.points[i - 1], factor);
          } else {
            line.points[i].lerp(line.points[i - 1], 0.9);
          }
        }

        const uniforms = line.polyline.mesh.program.uniforms;
        if (uniforms) {
          if (uniforms.uTime) uniforms.uTime.value = 0.001 * now;
          if (uniforms.uOpacity) uniforms.uOpacity.value = currentOpacity;
        }
        line.polyline.updateGeometry();
      });

      renderer.render({ scene });
    }

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handlePointerMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animFrameId);
      if (gl.canvas && gl.canvas.parentNode === container) {
        container.removeChild(gl.canvas);
      }
    };
  }, [
    effectiveColors,
    effectiveThickness,
    baseSpring,
    baseFriction,
    offsetFactor,
    maxAge,
    pointCount,
    speedMultiplier,
    enableFade,
    enableShaderEffect,
    effectAmplitude,
    backgroundColor,
    isLight,
  ]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-30 pointer-events-none w-screen h-screen overflow-hidden"
      aria-hidden="true"
    />
  );
}
