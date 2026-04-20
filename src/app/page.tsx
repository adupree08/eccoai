"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingHero } from "@/components/landing/LandingHero";
import { DemoSection, GallerySection } from "@/components/landing/LandingSections";
import { LandingCTA, LandingFooter } from "@/components/landing/LandingCTA";
import { TweaksPanel } from "@/components/landing/TweaksPanel";

function LandingPageInner() {
  const [theme, setTheme] = useState("signal");
  const [audience, setAudience] = useState("consultants");
  const searchParams = useSearchParams();
  const showTweaks = searchParams.get("tweaks") === "true";

  function cycleTheme() {
    const order = ["signal", "chorus", "broadsheet"];
    setTheme((prev) => order[(order.indexOf(prev) + 1) % order.length]);
  }

  function update(patch: Partial<{ theme: string; audience: string }>) {
    if (patch.theme) setTheme(patch.theme);
    if (patch.audience) setAudience(patch.audience);
  }

  return (
    <div
      data-theme={theme}
      style={{
        background: "var(--bg)",
        color: "var(--ink)",
        fontFamily: "var(--font-body)",
        fontFeatureSettings: '"ss01", "ss02", "cv11"',
        WebkitFontSmoothing: "antialiased",
        transition: "background .4s ease, color .4s ease",
        minHeight: "100vh",
      }}
    >
      {/* Google Fonts for landing page themes */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700;9..144,900&family=Inter+Tight:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600&family=Space+Grotesk:wght@300;400;500;600;700&family=DM+Sans:wght@400;500;700&display=swap"
        rel="stylesheet"
      />

      <LandingNav theme={theme} onCycleTheme={cycleTheme} />
      <main>
        <LandingHero />
        <DemoSection audienceKey={audience} />
        <GallerySection />
        <LandingCTA />
      </main>
      <LandingFooter />
      <TweaksPanel visible={showTweaks} state={{ theme, audience }} onChange={update} />
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense>
      <LandingPageInner />
    </Suspense>
  );
}
