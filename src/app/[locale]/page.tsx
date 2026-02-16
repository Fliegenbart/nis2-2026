"use client";

import { useState, useRef } from "react";
import { useLocale } from "next-intl";
import { UrgencyBanner } from "@/components/landing/urgency-banner";
import { HeroSection } from "@/components/landing/hero-section";
import { SocialProofStats } from "@/components/landing/social-proof-stats";
import { ProblemSection } from "@/components/landing/problem-section";
import { LiabilityCalculator } from "@/components/landing/liability-calculator";
import { GuaranteeSection } from "@/components/landing/guarantee-section";
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
  const quickCheckRef = useRef<HTMLDivElement>(null);

  function handleStartQuickCheck() {
    setState("quick-check");
    setTimeout(() => {
      quickCheckRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  function handleQuickCheckComplete(answers: Record<string, AnswerValue>) {
    setQuickCheckAnswers(answers);
    setState("results");
    setTimeout(() => {
      quickCheckRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  function handleUnlockResults() {
    setShowLeadCapture(true);
  }

  return (
    <>
      <UrgencyBanner />
      <HeroSection onStartQuickCheck={handleStartQuickCheck} />
      <SocialProofStats locale={locale} />
      <ProblemSection />
      <LiabilityCalculator />
      <GuaranteeSection />
      <FounderSection />
      <PricingSection />

      <div ref={quickCheckRef}>
        {state === "quick-check" && (
          <QuickCheck onComplete={handleQuickCheckComplete} />
        )}
        {state === "results" && (
          <QuickCheckResults
            answers={quickCheckAnswers}
            onUnlock={handleUnlockResults}
          />
        )}
      </div>

      <CTABookingSection />

      <LeadCaptureModal
        open={showLeadCapture}
        onOpenChange={setShowLeadCapture}
        quickCheckAnswers={quickCheckAnswers}
      />
    </>
  );
}
