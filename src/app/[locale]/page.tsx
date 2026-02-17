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

  function handleStartQuickCheck(targetUrl?: string) {
    if (targetUrl) {
      setScanTargetUrl(targetUrl);
    }
    setState("quick-check");
    setTimeout(() => {
      scannerRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  function handleQuickCheckComplete(answers: Record<string, AnswerValue>) {
    setQuickCheckAnswers(answers);
    setState("results");
    setTimeout(() => {
      scannerRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
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
          {state === "quick-check" && (
            <QuickCheck onComplete={handleQuickCheckComplete} />
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
