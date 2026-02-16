"use client";

import { useTranslations } from "next-intl";
import { Calendar, Clock, Users, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const PROBLEM_CARDS = [
  { icon: Calendar, key: "deadline" as const },
  { icon: Clock, key: "complex" as const },
  { icon: Users, key: "resources" as const },
];

const AFFECTED_CRITERIA = [
  "cloud",
  "datacenter",
  "marketplace",
  "critical",
  "finance",
  "digital",
] as const;

export function ProblemSection() {
  const t = useTranslations("landing.problem");

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-lg text-slate-600">{t("subtitle")}</p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
          {PROBLEM_CARDS.map(({ icon: Icon, key }) => (
            <Card key={key} className="border-slate-200">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-rose-100">
                  <Icon className="h-6 w-6 text-rose-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  {t(`${key}.title`)}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {t(`${key}.description`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-xl border border-indigo-200 bg-indigo-50 p-6 sm:p-8">
          <h3 className="mb-4 text-lg font-semibold text-indigo-900">
            {t("affected.title")}
          </h3>
          <ul className="mb-6 space-y-2.5">
            {AFFECTED_CRITERIA.map((key) => (
              <li key={key} className="flex items-start gap-2.5 text-sm text-indigo-800">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                {t(`affected.${key}`)}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1.5 text-sm font-semibold text-rose-700">
              ~30.000+ {t("stats.affected")}
            </span>
            <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1.5 text-sm font-semibold text-rose-700">
              €10M {t("stats.maxFine")}
            </span>
            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-700">
              24h {t("stats.reporting")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
