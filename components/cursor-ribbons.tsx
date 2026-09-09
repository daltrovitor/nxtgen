"use client";

import React, { useEffect, useRef } from "react";
import { Renderer, Transform, Polyline, Vec3, Color } from "ogl";

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
  baseThickness = 26,
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

  useEffect(() => {
    // Only run on desktop devices with hover support
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

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

    const centerIndex = (colors.length - 1) / 2;

    colors.forEach((colorHex, idx) => {
      const spring = baseSpring + (Math.random() - 0.5) * 0.01;
      const friction = baseFriction + (Math.random() - 0.5) * 0.02;
      const thickness = baseThickness + (Math.random() - 0.5) * 4;
      const mouseOffset = new Vec3(
        (idx - centerIndex) * offsetFactor + (Math.random() - 0.5) * 0.01,
        (Math.random() - 0.5) * 0.02,
        0
      );

      const points: Array<InstanceType<typeof Vec3>> = [];
      for (let p = 0; p < pointCount; p++) {
        points.push(new Vec3());
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
          uOpacity: { value: 0.95 },
          uTime: { value: 0 },
          uEnableShaderEffect: { value: enableShaderEffect ? 1 : 0 },
          uEffectAmplitude: { value: effectAmplitude },
          uEnableFade: { value: enableFade ? 1 : 0 },
        },
      });

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
    let isRunning = true;
    let lastTime = performance.now();

    const stopAnimation = () => {
      isRunning = false;
      cancelAnimationFrame(animFrameId);
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isRunning) {
        isRunning = true;
        lastTime = performance.now();
        renderLoop();
      }
      clearTimeout(idleTimer);
      idleTimer = setTimeout(stopAnimation, 3000);

      let clientX = 0;
      let clientY = 0;

      if ("changedTouches" in e && e.changedTouches.length) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else if (e instanceof MouseEvent) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const winWidth = window.innerWidth;
      const winHeight = window.innerHeight;
      mousePos.set((clientX / winWidth) * 2 - 1, -(clientY / winHeight) * 2 + 1, 0);
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });

    const tmpVec = new Vec3();

    function renderLoop() {
      if (!isRunning) return;
      animFrameId = requestAnimationFrame(renderLoop);

      const now = performance.now();
      const delta = now - lastTime;
      lastTime = now;

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
        if (uniforms && uniforms.uTime) {
          uniforms.uTime.value = 0.001 * now;
        }
        line.polyline.updateGeometry();
      });

      renderer.render({ scene });
    }

    idleTimer = setTimeout(stopAnimation, 3000);
    renderLoop();

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handlePointerMove);
      cancelAnimationFrame(animFrameId);
      if (gl.canvas && gl.canvas.parentNode === container) {
        container.removeChild(gl.canvas);
      }
    };
  }, [
    colors,
    baseSpring,
    baseFriction,
    baseThickness,
    offsetFactor,
    maxAge,
    pointCount,
    speedMultiplier,
    enableFade,
    enableShaderEffect,
    effectAmplitude,
    backgroundColor,
  ]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9998] pointer-events-none w-screen h-screen overflow-hidden"
      aria-hidden="true"
    />
  );
}
