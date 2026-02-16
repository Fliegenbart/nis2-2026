"use client";

import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { calculateMaxFine, formatFine } from "@/lib/fine-calculator";

interface LiabilityTickerProps {
  revenue: number;
  score: number;
}

export function LiabilityTicker({ revenue, score }: LiabilityTickerProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();

  const maxFine = calculateMaxFine(revenue);
  // Scale fine risk inversely with compliance score:
  // at 0% compliance the full fine applies, at 100% compliance the risk approaches 0
  const riskAdjustedFine = Math.round(maxFine * ((100 - score) / 100));
  const formattedFine = formatFine(riskAdjustedFine, locale);

  return (
    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 glow-rose p-6">
      <div className="flex items-center gap-2 text-rose-400 font-semibold mb-4">
        <AlertTriangle className="h-5 w-5 text-rose-400" />
        {t("fineRisk")}
      </div>
      <div>
        <p className="text-4xl font-bold font-mono text-gradient-rose">
          {formattedFine}
        </p>
        <p className="mt-1 text-sm text-rose-400/60">
          {t("fineRiskBased")}
        </p>
      </div>
    </div>
  );
}
