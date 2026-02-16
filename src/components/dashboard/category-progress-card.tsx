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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${color}15` }}
              >
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <CardTitle className="text-base">{categoryName}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {isFree ? (
                <Badge variant="secondary" className="text-xs">
                  {t("free")}
                </Badge>
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t("questionsAnswered", {
                  answered: answeredCount,
                  total: totalCount,
                })}
              </span>
              <span className="font-semibold" style={{ color }}>
                {score}%
              </span>
            </div>
            <Progress value={score} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
