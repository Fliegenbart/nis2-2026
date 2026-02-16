"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NIS2Category } from "@/data/nis2-framework";
import type { CategoryScore } from "@/lib/scoring";

interface CategorySidebarProps {
  categories: NIS2Category[];
  currentCategoryId: string;
  categoryScores: CategoryScore[];
  auditId: string;
}

export function CategorySidebar({
  categories,
  currentCategoryId,
  categoryScores,
  auditId,
}: CategorySidebarProps) {
  const locale = useLocale();
  const tCategories = useTranslations("categories");
  const tDashboard = useTranslations("dashboard");
  const localeKey = locale as "de" | "en";

  function getScoreForCategory(categoryId: string): CategoryScore | undefined {
    return categoryScores.find((s) => s.categoryId === categoryId);
  }

  return (
    <nav className="flex flex-col gap-1">
      {categories.map((category) => {
        const isCurrent = category.id === currentCategoryId;
        const isLocked = !category.isFree;
        const score = getScoreForCategory(category.id);
        const progressPercent = score
          ? score.totalCount > 0
            ? Math.round((score.answeredCount / score.totalCount) * 100)
            : 0
          : 0;

        return (
          <Link
            key={category.id}
            href={`/${locale}/audit/${auditId}/${category.id}`}
            className={cn(
              "group flex flex-col gap-2 rounded-lg border px-3 py-3 text-sm transition-all",
              isCurrent
                ? "border-cyan-500/50 bg-cyan-500/5"
                : "border-transparent hover:border-slate-700/50 hover:bg-slate-800/30",
              isLocked && "opacity-50"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  "font-medium truncate",
                  isCurrent
                    ? "text-cyan-400"
                    : "text-slate-300"
                )}
              >
                {category.name[localeKey]}
              </span>
              {isLocked ? (
                <Lock className="h-3.5 w-3.5 shrink-0 text-slate-600" />
              ) : (
                <span className="shrink-0 text-xs text-slate-500">
                  {score?.score ?? 0}%
                </span>
              )}
            </div>
            {!isLocked && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-slate-800">
                  <div
                    className="h-1.5 rounded-full bg-cyan-500 transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="shrink-0 text-[10px] text-slate-600">
                  {score?.answeredCount ?? 0}/{score?.totalCount ?? 0}
                </span>
              </div>
            )}
            {isLocked && (
              <span className="text-xs text-slate-600">
                {tDashboard("locked")}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
