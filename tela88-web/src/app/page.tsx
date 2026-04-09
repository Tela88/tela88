import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";

// Secções below-fold — carregam depois do hero
const ClientLogos = dynamic(() => import("@/components/sections/ClientLogos"), {
  ssr: true,
});

const IntroSection = dynamic(() => import("@/components/sections/IntroSection"), {
  ssr: true,
});

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ClientLogos />
        <IntroSection />
      </main>
      <Footer />
    </>
  );
}
