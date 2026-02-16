"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  ShieldAlert,
  Siren,
  Database,
  Link as LinkIcon,
  Network,
  ClipboardCheck,
  Lock,
  GraduationCap,
  Fingerprint,
  Radio,
  type LucideIcon,
} from "lucide-react";
import { getScoreColor } from "@/lib/scoring";
import type { NIS2Category } from "@/data/nis2-framework";

const ICON_MAP: Record<string, LucideIcon> = {
  ShieldAlert,
  Siren,
  Database,
  Link: LinkIcon,
  Network,
  ClipboardCheck,
  Lock,
  GraduationCap,
  Fingerprint,
  Radio,
};

interface CategoryProgressCardProps {
  category: NIS2Category;
  score: number;
  answeredCount: number;
  totalCount: number;
  isFree: boolean;
  auditId: string;
}

export function CategoryProgressCard({
  category,
  score,
  answeredCount,
  totalCount,
  isFree,
  auditId,
}: CategoryProgressCardProps) {
  const locale = useLocale();
  const t = useTranslations("dashboard");
  const Icon = ICON_MAP[category.icon] ?? ShieldAlert;
  const color = getScoreColor(score);
  const categoryName = category.name[locale as "de" | "en"];

  return (
    <Link href={`/${locale}/audit/${auditId}/category/${category.id}`} className="block">
      <div className="glass-card rounded-xl p-5 transition-all hover:border-cyan-500/20 hover:shadow-[0_0_20px_rgba(34,211,238,0.08)]">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${color}10` }}
              >
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <span className="text-base text-white font-semibold">{categoryName}</span>
            </div>
            <div className="flex items-center gap-2">
              {isFree ? (
                <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-400">
                  {t("free")}
                </span>
              ) : (
                <Lock className="h-4 w-4 text-slate-600" />
              )}
            </div>
          </div>
        </div>
        <div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">
                {t("questionsAnswered", {
                  answered: answeredCount,
                  total: totalCount,
                })}
              </span>
              <span className="font-semibold font-mono" style={{ color }}>
                {score}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800">
              <div
                className="h-1.5 rounded-full transition-all"
                style={{ width: `${score}%`, backgroundColor: color }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
