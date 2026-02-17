"use client";

import { useTranslations } from "next-intl";

export function FounderSection() {
  const t = useTranslations("landing.founder");

  return (
    <section className="landing-section">
      <div className="mx-auto max-w-3xl px-4">
        <div className="landing-card px-6 py-8 sm:px-10">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-cyan-200 bg-cyan-50 text-xl font-bold text-cyan-700">
            JB
          </div>

          <h3 className="text-center text-xl font-bold text-slate-900">{t("title")}</h3>
          <p className="mt-1 text-center text-sm text-slate-500">{t("name")}</p>

          <div className="mt-8 space-y-5 text-left">
            <p className="text-sm leading-relaxed text-slate-700">{t("story1")}</p>
            <p className="text-sm leading-relaxed text-slate-700">{t("story2")}</p>

            <blockquote className="rounded-xl border border-cyan-200 bg-cyan-50 p-5">
              <p className="text-lg italic leading-relaxed text-slate-800">
                &ldquo;{t("story3")}&rdquo;
              </p>
            </blockquote>

            <p className="text-sm leading-relaxed text-slate-700">{t("story4")}</p>
            <p className="text-sm font-semibold leading-relaxed text-slate-900">{t("mission")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
