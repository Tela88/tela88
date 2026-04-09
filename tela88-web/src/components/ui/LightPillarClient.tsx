"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";

const LightPillar = dynamic(() => import("@/components/ui/LightPillar"), {
  ssr: false,
  loading: () => null,
});

type LightPillarClientProps = {
  className?: string;
};

export default function LightPillarClient({
  className = "",
}: LightPillarClientProps) {
  return (
    <div className={`absolute inset-y-0 w-[38%] h-full pointer-events-none ${className}`}>
      <Suspense fallback={null}>
        <LightPillar
          topColor="#c3f400"
          bottomColor="#68cc59"
          intensity={0.8}
          rotationSpeed={0.22}
          glowAmount={0.0035}
          pillarWidth={2.4}
          pillarHeight={0.44}
          noiseIntensity={0.18}
          pillarRotation={18}
          interactive={false}
          mixBlendMode="screen"
          quality="low"
        />
      </Suspense>
    </div>
  );
}
