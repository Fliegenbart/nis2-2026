"use client";

import { useTranslations } from "next-intl";
import { Info } from "lucide-react";
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
    className: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  },
  hoch: {
    variant: "default",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  mittel: {
    variant: "secondary",
    className: "bg-slate-500/10 text-slate-400 border-slate-500/30",
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
    <div className="rounded-xl border border-slate-700/30 bg-slate-900/60 backdrop-blur-sm transition-all hover:border-slate-600/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.05)]">
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-medium leading-snug text-slate-200">
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
                    className="rounded-full p-1 text-slate-600 transition-colors hover:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/30"
                    aria-label={t("moreInfo")}
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-xs border-slate-700/50 bg-slate-800 text-sm text-slate-300"
                  sideOffset={4}
                >
                  {question.helpText[localeKey]}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <p className="text-xs text-slate-600">
          {t("legalRef")}: {question.legalReference}
        </p>

        <AnswerSelector value={answer} onChange={onAnswer} />
      </div>
    </div>
  );
}
