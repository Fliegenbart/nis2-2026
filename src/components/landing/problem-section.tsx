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
    <section className="landing-section">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="landing-eyebrow">Risk Context</p>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            {t("subtitle")}
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-5 lg:grid-cols-3">
          {PROBLEM_CARDS.map(({ icon: Icon, key }) => (
            <div
              key={key}
              className="landing-card p-6"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50">
                <Icon className="h-5 w-5 text-cyan-700" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {t(`${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {t(`${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
