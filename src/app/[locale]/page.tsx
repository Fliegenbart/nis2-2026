"use client";

import { useState, useRef } from "react";
import { useLocale } from "next-intl";
import { HeroSection } from "@/components/landing/hero-section";
import { ProblemSection } from "@/components/landing/problem-section";
import { BulletproofViewport } from "@/components/landing/bulletproof-viewport";
import { ScannerViewport } from "@/components/landing/scanner-viewport";
import { FounderSection } from "@/components/landing/founder-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { QuickCheck } from "@/components/landing/quick-check";
import { QuickCheckResults } from "@/components/landing/quick-check-results";
import { CTABookingSection } from "@/components/landing/cta-booking-section";
import { LeadCaptureModal } from "@/components/landing/lead-capture-modal";
import type { AnswerValue } from "@/data/nis2-framework";

type LandingState = "hero" | "quick-check" | "results";

export default function LandingPage() {
  const locale = useLocale();
  const [state, setState] = useState<LandingState>("hero");
  const [quickCheckAnswers, setQuickCheckAnswers] = useState<Record<string, AnswerValue>>({});
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [scanTargetUrl, setScanTargetUrl] = useState("");
  const scannerRef = useRef<HTMLDivElement>(null);
  const HEADER_OFFSET = 84;
  const previewUnlockTitle =
    locale === "de" ? "Quick-Check Vorschau entsperren" : "Unlock quick check preview";
  const previewUnlockHint =
    locale === "de"
      ? "Geben Sie oben Ihre Website ein, um den Check direkt auf Ihr Unternehmen zu beziehen."
      : "Enter your website above to personalize the check for your company.";

  function scrollToTarget(sectionId: string) {
    setTimeout(() => {
      const target =
        document.getElementById(sectionId) ??
        scannerRef.current;

      if (!target) return;

      const top =
        target.getBoundingClientRect().top +
        window.scrollY -
        HEADER_OFFSET;

      window.scrollTo({
        top: Math.max(0, top),
        behavior: "smooth",
      });
    }, 120);
  }

  function handleStartQuickCheck(targetUrl?: string) {
    const normalizedTarget = targetUrl?.trim() ?? "";

    if (!normalizedTarget) {
      if (state === "hero") {
        scrollToTarget("scanner-viewport");
      } else {
        setState("quick-check");
        scrollToTarget("quick-check");
      }
      return;
    }

    setScanTargetUrl(normalizedTarget);
    setState("quick-check");
    scrollToTarget("quick-check");
  }

  function handleStartQuickCheckWithoutUrl() {
    setScanTargetUrl("");
    setState("quick-check");
    scrollToTarget("quick-check");
  }

  function focusScannerInput() {
    scrollToTarget("scanner-viewport");
    setTimeout(() => {
      const input = document.getElementById("scanner-target-url");
      if (input instanceof HTMLInputElement) {
        input.focus();
      }
    }, 180);
  }

  function handleQuickCheckComplete(answers: Record<string, AnswerValue>) {
    setQuickCheckAnswers(answers);
    setState("results");
    scrollToTarget("results");
  }

  function handleUnlockResults() {
    setShowLeadCapture(true);
  }

  return (
    <div className="landing-light">
      <HeroSection onStartQuickCheck={handleStartQuickCheck} />
      <ProblemSection />
      <BulletproofViewport />

      <div ref={scannerRef}>
        <ScannerViewport locale={locale} onStartScan={handleStartQuickCheck}>
          {state === "hero" && (
            <div className="relative">
              <div className="pointer-events-none select-none opacity-75 blur-[0.8px]">
                <QuickCheck key="preview" onComplete={() => {}} />
              </div>

              <div className="absolute inset-0 flex items-center justify-center p-4">
                <div className="landing-panel w-full max-w-xl border-cyan-200/80 bg-white/95 p-6 text-center shadow-[0_30px_70px_-46px_rgba(6,182,212,0.45)] backdrop-blur-[1px]">
                  <h3 className="text-xl font-extrabold text-slate-900">{previewUnlockTitle}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{previewUnlockHint}</p>

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={focusScannerInput}
                      className="rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-extrabold text-slate-950 transition-colors hover:bg-cyan-400"
                    >
                      {locale === "de" ? "URL eingeben & freischalten" : "Enter URL & unlock"}
                    </button>
                    <button
                      type="button"
                      onClick={handleStartQuickCheckWithoutUrl}
                      className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
                    >
                      {locale === "de" ? "Ohne URL fortfahren" : "Continue without URL"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {state === "quick-check" && (
            <QuickCheck key="active" onComplete={handleQuickCheckComplete} />
          )}
          {state === "results" && (
            <QuickCheckResults
              answers={quickCheckAnswers}
              onUnlock={handleUnlockResults}
            />
          )}
        </ScannerViewport>
      </div>

      <FounderSection />
      <PricingSection />
      <CTABookingSection />

      <LeadCaptureModal
        open={showLeadCapture}
        onOpenChange={setShowLeadCapture}
        quickCheckAnswers={quickCheckAnswers}
        initialCompanyName={scanTargetUrl}
      />
    </div>
  );
}
