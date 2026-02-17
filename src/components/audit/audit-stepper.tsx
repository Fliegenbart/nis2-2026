"use client";

import { useLocale } from "next-intl";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NIS2Category } from "@/data/nis2-framework";
import type { CategoryScore } from "@/lib/scoring";
import Link from "next/link";

interface AuditStepperProps {
  categories: NIS2Category[];
  currentCategoryId: string;
  categoryScores: CategoryScore[];
  auditId: string;
}

const ABBREVIATED_NAMES: Record<string, Record<string, string>> = {
  "risk-management": { de: "Risiko", en: "Risk" },
  "incident-handling": { de: "Incident", en: "Incident" },
  "business-continuity": { de: "Kontinuitat", en: "Continuity" },
  "supply-chain": { de: "Lieferkette", en: "Supply" },
  "network-security": { de: "Netz", en: "Network" },
  assessment: { de: "Testing", en: "Testing" },
  cryptography: { de: "Krypto", en: "Crypto" },
  "hr-training": { de: "Personal", en: "HR" },
  authentication: { de: "Auth", en: "Auth" },
  communication: { de: "Komm.", en: "Comm." },
};

export function AuditStepper({
  categories,
  currentCategoryId,
  categoryScores,
  auditId,
}: AuditStepperProps) {
  const locale = useLocale();
  const localeKey = locale as "de" | "en";

  function isCompleted(categoryId: string): boolean {
    const score = categoryScores.find((s) => s.categoryId === categoryId);
    if (!score) return false;
    return score.answeredCount > 0 && score.answeredCount === score.totalCount;
  }

  const currentIndex = categories.findIndex((c) => c.id === currentCategoryId);

  return (
    <div className="hidden md:block">
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center gap-0 min-w-max">
          {categories.map((category, index) => {
            const isCurrent = category.id === currentCategoryId;
            const completed = isCompleted(category.id);
            const isLocked = !category.isFree;
            const abbrev =
              ABBREVIATED_NAMES[category.id]?.[localeKey] ?? category.name[localeKey];
            const href = `/${locale}/audit/${auditId}/category/${category.id}`;

            return (
              <div key={category.id} className="flex items-center">
                {index > 0 && (
                  <div
                    className={cn(
                      "h-0.5 w-6 lg:w-10",
                      index <= currentIndex
                        ? "bg-cyan-500"
                        : "bg-slate-700"
                    )}
                  />
                )}
                <Link
                  href={href}
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    "group flex min-w-[70px] flex-col items-center gap-1 rounded-md px-1 py-1 transition-colors",
                    isCurrent
                      ? "pointer-events-none"
                      : "hover:bg-slate-900/60"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                      isCurrent
                        ? "border-cyan-500 bg-cyan-500 text-slate-950"
                        : completed
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : isLocked
                            ? "border-slate-700 bg-slate-800 text-slate-500 group-hover:border-slate-600"
                            : "border-slate-700 bg-slate-900 text-slate-500 group-hover:border-cyan-500/60 group-hover:text-slate-300"
                    )}
                  >
                    {isLocked ? (
                      <Lock className="h-3.5 w-3.5" />
                    ) : completed ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={cn(
                      "max-w-[62px] truncate text-center text-[10px] leading-tight transition-colors",
                      isCurrent
                        ? "font-medium text-cyan-400"
                        : "text-slate-600 group-hover:text-slate-400"
                    )}
                  >
                    {abbrev}
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
