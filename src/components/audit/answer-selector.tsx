"use client";

import { useTranslations } from "next-intl";
import { CheckCircle, MinusCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnswerValue } from "@/data/nis2-framework";

interface AnswerSelectorProps {
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
}

const OPTIONS: {
  value: Extract<AnswerValue, "fulfilled" | "partial" | "not_fulfilled">;
  labelKey: "fulfilled" | "partial" | "notFulfilled";
  icon: typeof CheckCircle;
  color: {
    border: string;
    bg: string;
    text: string;
    iconColor: string;
  };
}[] = [
  {
    value: "fulfilled",
    labelKey: "fulfilled",
    icon: CheckCircle,
    color: {
      border: "border-emerald-500/50",
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      iconColor: "text-emerald-400",
    },
  },
  {
    value: "partial",
    labelKey: "partial",
    icon: MinusCircle,
    color: {
      border: "border-amber-500/50",
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      iconColor: "text-amber-400",
    },
  },
  {
    value: "not_fulfilled",
    labelKey: "notFulfilled",
    icon: XCircle,
    color: {
      border: "border-rose-500/50",
      bg: "bg-rose-500/10",
      text: "text-rose-400",
      iconColor: "text-rose-400",
    },
  },
];

export function AnswerSelector({ value, onChange }: AnswerSelectorProps) {
  const t = useTranslations("audit");

  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((option) => {
        const isSelected = value === option.value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
              isSelected
                ? cn(option.color.border, option.color.bg, option.color.text)
                : "border-slate-700/50 bg-slate-900/50 text-slate-400 hover:border-slate-600/50 hover:text-slate-300"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0",
                isSelected ? option.color.iconColor : "text-slate-400"
              )}
            />
            {t(option.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
