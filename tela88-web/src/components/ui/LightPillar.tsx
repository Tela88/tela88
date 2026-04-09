"use client";

import { useRef, useEffect, useState, CSSProperties } from "react";
import * as THREE from "three";
import styles from "./LightPillar.module.css";

interface LightPillarProps {
  topColor?: string;
  bottomColor?: string;
  intensity?: number;
  rotationSpeed?: number;
  interactive?: boolean;
  className?: string;
  glowAmount?: number;
  pillarWidth?: number;
  pillarHeight?: number;
  noiseIntensity?: number;
  mixBlendMode?: CSSProperties["mixBlendMode"];
  pillarRotation?: number;
  quality?: "low" | "medium" | "high";
}

export default function LightPillar({
  topColor = "#5227FF",
  bottomColor = "#FF9FFC",
  intensity = 1.0,
  rotationSpeed = 0.3,
  interactive = false,
  className = "",
  glowAmount = 0.005,
  pillarWidth = 3.0,
  pillarHeight = 0.4,
  noiseIntensity = 0.5,
  mixBlendMode = "screen",
  pillarRotation = 0,
  quality = "medium",
}: LightPillarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const geometryRef = useRef<THREE.PlaneGeometry | null>(null);
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const timeRef = useRef(0);
  const rotationSpeedRef = useRef(rotationSpeed);
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) setWebGLSupported(false);
  }, []);

  useEffect(() => {
    if (!containerRef.current || !webGLSupported) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (width === 0 || height === 0) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    cameraRef.current = camera;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLowEndDevice = isMobile || (navigator.hardwareConcurrency != null && navigator.hardwareConcurrency <= 4);

    let effectiveQuality = quality;
    if (isLowEndDevice && quality === "high") effectiveQuality = "medium";
    if (isMobile && quality !== "low") effectiveQuality = "low";

    const qualitySettings = {
      low:    { iterations: 16, waveIterations: 1, pixelRatio: 0.5,     precision: "mediump", stepMultiplier: 1.5 },
      medium: { iterations: 28, waveIterations: 2, pixelRatio: 0.75,    precision: "mediump", stepMultiplier: 1.2 },
      high:   { iterations: 48, waveIterations: 3, pixelRatio: Math.min(window.devicePixelRatio, 1.0), precision: "highp",   stepMultiplier: 1.0 },
    };

    const settings = qualitySettings[effectiveQuality] || qualitySettings.medium;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: effectiveQuality === "high" ? "high-performance" : "low-power",
        precision: settings.precision as "highp" | "mediump" | "lowp",
        stencil: false,
        depth: false,
      });
    } catch {
      setWebGLSupported(false);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(settings.pixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const parseColor = (hex: string) => {
      const color = new THREE.Color(hex);
      return new THREE.Vector3(color.r, color.g, color.b);
    };

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    // Shader otimizado: pré-computar matrizes de rotação, reduzir operações no loop
    const fragmentShader = `
      precision ${settings.precision} float;

      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform vec3 uTopColor;
      uniform vec3 uBottomColor;
      uniform float uIntensity;
      uniform bool uInteractive;
      uniform float uGlowAmount;
      uniform float uPillarWidth;
      uniform float uPillarHeight;
      uniform float uNoiseIntensity;
      uniform float uRotCos;
      uniform float uRotSin;
      uniform mat2 uRotMat;
      uniform mat2 uPillarRotMat;
      uniform mat2 uWaveRotMat;
      varying vec2 vUv;

      const float STEP_MULT = ${settings.stepMultiplier.toFixed(1)};
      const int MAX_ITER = ${settings.iterations};
      const int WAVE_ITER = ${settings.waveIterations};

      // Fast glow approximation (mais rápido que tanh)
      vec3 fastGlow(vec3 x) {
        return x / (1.0 + length(x));
      }

      void main() {
        // UV normalizado com aspect ratio
        vec2 uv = (vUv * 2.0 - 1.0) * vec2(uResolution.x / uResolution.y, 1.0);
        uv = uPillarRotMat * uv;

        vec3 ro = vec3(0.0, 0.0, -10.0);
        vec3 rd = normalize(vec3(uv, 1.0));

        // Rotação da câmara - usar matriz dinâmica ou interativa
        mat2 camRot = uRotMat;
        if(uInteractive && length(uMouse) > 0.01) {
          float a = uMouse.x * 6.283185;
          camRot = mat2(cos(a), -sin(a), sin(a), cos(a));
        }

        vec3 col = vec3(0.0);
        float t = 0.1;

        for(int i = 0; i < MAX_ITER; i++) {
          vec3 p = ro + rd * t;
          p.xz = camRot * p.xz;

          vec3 q = p;
          q.y = p.y * uPillarHeight + uTime;

          // Wave distortion otimizada - usar matriz pré-computada
          float freq = 1.0;
          float amp = 1.0;
          for(int j = 0; j < WAVE_ITER; j++) {
            q.xz = uWaveRotMat * q.xz;
            vec3 wavePhase = q.zxy * freq - uTime * float(j) * 2.0;
            q += cos(wavePhase) * amp;
            freq *= 2.0;
            amp *= 0.5;
          }

          // SDF simplificado
          float d = length(cos(q.xz)) - 0.2;
          float bound = length(p.xz) - uPillarWidth;
          float soft = max(4.0 - abs(d - bound), 0.0);
          d = max(d, bound) + soft * soft * 0.0625 / 4.0;
          d = abs(d) * 0.15 + 0.01;

          // Gradiente de cor
          float grad = clamp((15.0 - p.y) / 30.0, 0.0, 1.0);
          col += mix(uBottomColor, uTopColor, grad) / d;

          t += d * STEP_MULT;
          if(t > 50.0) break;
        }

        // Glow mais eficiente
        float widthNorm = uPillarWidth / 3.0;
        col = fastGlow(col * uGlowAmount / widthNorm);

        // Noise simplificado
        col -= fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) / 15.0 * uNoiseIntensity;

        vec3 finalCol = col * uIntensity;
        float alpha = clamp(max(max(finalCol.r, finalCol.g), finalCol.b), 0.0, 1.0);
        gl_FragColor = vec4(finalCol, alpha);
      }
    `;

    const pillarRotRad = (pillarRotation * Math.PI) / 180;
    const pillarRotMat = new THREE.Matrix2().set(
      Math.cos(pillarRotRad), -Math.sin(pillarRotRad),
      Math.sin(pillarRotRad), Math.cos(pillarRotRad)
    );
    const waveRotMat = new THREE.Matrix2().set(
      Math.cos(0.4), -Math.sin(0.4),
      Math.sin(0.4), Math.cos(0.4)
    );

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime:           { value: 0 },
        uResolution:     { value: new THREE.Vector2(width, height) },
        uMouse:          { value: mouseRef.current },
        uTopColor:       { value: parseColor(topColor) },
        uBottomColor:    { value: parseColor(bottomColor) },
        uIntensity:      { value: intensity },
        uInteractive:    { value: interactive },
        uGlowAmount:     { value: glowAmount },
        uPillarWidth:    { value: pillarWidth },
        uPillarHeight:   { value: pillarHeight },
        uNoiseIntensity: { value: noiseIntensity },
        uRotCos:         { value: 1.0 },
        uRotSin:         { value: 0.0 },
        uRotMat:         { value: new THREE.Matrix2().set(1, 0, 0, 1) },
        uPillarRotMat:   { value: pillarRotMat },
        uWaveRotMat:     { value: waveRotMat },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
    materialRef.current = material;

    const geometry = new THREE.PlaneGeometry(2, 2);
    geometryRef.current = geometry;
    scene.add(new THREE.Mesh(geometry, material));

    let mouseMoveTimeout: ReturnType<typeof setTimeout> | null = null;
    const handleMouseMove = (event: MouseEvent) => {
      if (!interactive || mouseMoveTimeout) return;
      mouseMoveTimeout = setTimeout(() => { mouseMoveTimeout = null; }, 16);
      const rect = container.getBoundingClientRect();
      mouseRef.current.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -(((event.clientY - rect.top) / rect.height) * 2 - 1)
      );
    };
    if (interactive) container.addEventListener("mousemove", handleMouseMove, { passive: true });

    // FPS throttling com accumulator para evitar cálculos desnecessários
    const targetFPS = effectiveQuality === "low" ? 30 : 60;
    const frameTime = 1000 / targetFPS;
    let lastFrameTime = performance.now();
    let timeAccumulator = 0;

    const animate = (currentTime: number) => {
      if (!materialRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;

      const deltaTime = currentTime - lastFrameTime;
      lastFrameTime = currentTime;
      timeAccumulator += deltaTime;

      // Só atualiza se passou tempo suficiente para o próximo frame
      if (timeAccumulator >= frameTime) {
        const deltaSeconds = timeAccumulator / 1000;
        timeRef.current += deltaSeconds * rotationSpeedRef.current;
        const t = timeRef.current;
        const rotCos = Math.cos(t * 0.3);
        const rotSin = Math.sin(t * 0.3);

        materialRef.current.uniforms.uTime.value = t;
        materialRef.current.uniforms.uRotCos.value = rotCos;
        materialRef.current.uniforms.uRotSin.value = rotSin;
        // Atualizar matriz de rotação da câmara dinamicamente
        materialRef.current.uniforms.uRotMat?.value.set(
          rotCos, -rotSin,
          rotSin, rotCos
        );

        rendererRef.current.render(sceneRef.current, cameraRef.current);
        timeAccumulator = 0;
      }

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    // Resize handler otimizado - debounce mais longo para evitar re-renders frequentes
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (!rendererRef.current || !materialRef.current || !containerRef.current) return;
        const nw = containerRef.current.clientWidth;
        const nh = containerRef.current.clientHeight;
        if (nw === 0 || nh === 0) return;
        rendererRef.current.setSize(nw, nh, false);
        materialRef.current.uniforms.uResolution.value.set(nw, nh);
      }, 250);
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // IntersectionObserver para pausar renderização quando não visível
    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0]?.isIntersecting ?? false;
        // Pausar animação quando não visível (scroll para fora)
        if (!isVisible && rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        } else if (isVisible && !rafRef.current) {
          lastFrameTime = performance.now();
          timeAccumulator = 0;
          rafRef.current = requestAnimationFrame(animate);
        }
      },
      {
        root: null,
        rootMargin: "100px", // Começa a renderizar 100px antes de entrar no viewport
        threshold: 0.01, // Pelo menos 1% visível
      }
    );
    observer.observe(container);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      if (interactive) container.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss();
        if (container.contains(rendererRef.current.domElement)) {
          container.removeChild(rendererRef.current.domElement);
        }
      }
      materialRef.current?.dispose();
      geometryRef.current?.dispose();
      rendererRef.current = null;
      materialRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      geometryRef.current = null;
      rafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webGLSupported, quality]);

  useEffect(() => { rotationSpeedRef.current = rotationSpeed; }, [rotationSpeed]);
  useEffect(() => {
    if (!materialRef.current) return;
    const c = new THREE.Color(topColor);
    materialRef.current.uniforms.uTopColor.value = new THREE.Vector3(c.r, c.g, c.b);
  }, [topColor]);
  useEffect(() => {
    if (!materialRef.current) return;
    const c = new THREE.Color(bottomColor);
    materialRef.current.uniforms.uBottomColor.value = new THREE.Vector3(c.r, c.g, c.b);
  }, [bottomColor]);
  useEffect(() => { if (materialRef.current) materialRef.current.uniforms.uIntensity.value = intensity; }, [intensity]);
  useEffect(() => { if (materialRef.current) materialRef.current.uniforms.uInteractive.value = interactive; }, [interactive]);
  useEffect(() => { if (materialRef.current) materialRef.current.uniforms.uGlowAmount.value = glowAmount; }, [glowAmount]);
  useEffect(() => { if (materialRef.current) materialRef.current.uniforms.uPillarWidth.value = pillarWidth; }, [pillarWidth]);
  useEffect(() => { if (materialRef.current) materialRef.current.uniforms.uPillarHeight.value = pillarHeight; }, [pillarHeight]);
  useEffect(() => { if (materialRef.current) materialRef.current.uniforms.uNoiseIntensity.value = noiseIntensity; }, [noiseIntensity]);

  if (!webGLSupported) {
    return <div className={`${styles.fallback} ${className}`} style={{ mixBlendMode }} />;
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className}`}
      style={{ mixBlendMode }}
    />
  );
}
