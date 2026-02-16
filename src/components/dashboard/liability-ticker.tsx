"use client";

import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
          <AlertTriangle className="h-5 w-5" />
          {t("fineRisk")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">
          {formattedFine}
        </p>
        <p className="mt-1 text-sm text-rose-600/80 dark:text-rose-400/80">
          {t("fineRiskBased")}
        </p>
      </CardContent>
    </Card>
  );
}
