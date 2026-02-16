"use client";

import { useTranslations } from "next-intl";
import { Calendar, Clock, Users } from "lucide-react";

const PROBLEM_CARDS = [
  { icon: Calendar, key: "deadline" as const },
  { icon: Clock, key: "complex" as const },
  { icon: Users, key: "resources" as const },
];

export function ProblemSection() {
  const t = useTranslations("landing.problem");

  return (
    <section className="bg-slate-950 py-32 sm:py-40">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t("title")}
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mt-4">
            {t("subtitle")}
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
          {PROBLEM_CARDS.map(({ icon: Icon, key }) => (
            <div
              key={key}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800">
                <Icon className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white">
                {t(`${key}.title`)}
              </h3>
              <p className="text-sm text-slate-400 mt-2">
                {t(`${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
