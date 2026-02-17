"use client";

import { useTranslations } from "next-intl";

export function FounderSection() {
  const t = useTranslations("landing.founder");

  return (
    <section className="landing-section">
      <div className="mx-auto max-w-4xl px-4">
        <div className="landing-card px-6 py-8 sm:px-10 sm:py-10">
          <div className="grid gap-7 lg:grid-cols-[220px_1fr] lg:items-start">
            <div className="text-center lg:text-left">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-cyan-200 bg-cyan-50 text-xl font-bold text-cyan-700 lg:mx-0">
                JB
              </div>
              <h3 className="text-lg font-bold text-slate-900">{t("title")}</h3>
              <p className="mt-1 text-sm text-slate-500">{t("name")}</p>
            </div>

            <div className="space-y-5 text-left">
              <p className="text-sm leading-relaxed text-slate-700">{t("story1")}</p>
              <p className="text-sm leading-relaxed text-slate-700">{t("story2")}</p>

              <blockquote className="rounded-xl border border-cyan-200 bg-cyan-50 px-5 py-4">
                <p className="text-base italic leading-relaxed text-slate-800">
                  &ldquo;{t("story3")}&rdquo;
                </p>
              </blockquote>

              <p className="text-sm leading-relaxed text-slate-700">{t("story4")}</p>
              <p className="text-sm font-semibold leading-relaxed text-slate-900">{t("mission")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
