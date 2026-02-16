"use client";

import { useTranslations } from "next-intl";
import { Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AnswerSelector } from "@/components/audit/answer-selector";
import type { NIS2Question, AnswerValue } from "@/data/nis2-framework";

interface QuestionCardProps {
  question: NIS2Question;
  answer: AnswerValue | undefined;
  onAnswer: (value: AnswerValue) => void;
  locale: string;
}

const SEVERITY_STYLES: Record<
  string,
  { variant: "default" | "secondary" | "destructive" | "outline"; className: string }
> = {
  kritisch: {
    variant: "destructive",
    className: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200",
  },
  hoch: {
    variant: "default",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200",
  },
  mittel: {
    variant: "secondary",
    className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200",
  },
};

const SEVERITY_LABELS: Record<string, Record<string, string>> = {
  kritisch: { de: "Kritisch", en: "Critical" },
  hoch: { de: "Hoch", en: "High" },
  mittel: { de: "Mittel", en: "Medium" },
};

export function QuestionCard({
  question,
  answer,
  onAnswer,
  locale,
}: QuestionCardProps) {
  const t = useTranslations("audit");
  const localeKey = locale as "de" | "en";
  const severityStyle = SEVERITY_STYLES[question.severity];

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-medium leading-snug">
            {question.text[localeKey]}
          </h3>
          <div className="flex shrink-0 items-center gap-2">
            <Badge
              variant={severityStyle.variant}
              className={cn("text-xs", severityStyle.className)}
            >
              {SEVERITY_LABELS[question.severity][localeKey]}
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={t("moreInfo")}
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-xs text-sm"
                  sideOffset={4}
                >
                  {question.helpText[localeKey]}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {t("legalRef")}: {question.legalReference}
        </p>

        <AnswerSelector value={answer} onChange={onAnswer} />
      </CardContent>
    </Card>
  );
}
