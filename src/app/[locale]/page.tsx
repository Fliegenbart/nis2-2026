"use client";

import { useState, useRef } from "react";
import { HeroSection } from "@/components/landing/hero-section";
import { LiabilityCalculator } from "@/components/landing/liability-calculator";
import { QuickCheck } from "@/components/landing/quick-check";
import { QuickCheckResults } from "@/components/landing/quick-check-results";
import { LeadCaptureModal } from "@/components/landing/lead-capture-modal";
import type { AnswerValue } from "@/data/nis2-framework";

type LandingState = "hero" | "quick-check" | "results";

export default function LandingPage() {
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleUnlockResults() {
    setShowLeadCapture(true);
  }

  return (
    <>
      <HeroSection onStartQuickCheck={handleStartQuickCheck} />
      <LiabilityCalculator />

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

      <LeadCaptureModal
        open={showLeadCapture}
        onOpenChange={setShowLeadCapture}
        quickCheckAnswers={quickCheckAnswers}
      />
    </>
  );
}
