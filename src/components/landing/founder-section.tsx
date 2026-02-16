"use client";

import { useTranslations } from "next-intl";

export function FounderSection() {
  const t = useTranslations("landing.founder");

  return (
    <section className="bg-slate-950 py-32 sm:py-40">
      <div className="mx-auto max-w-3xl px-4 text-center">
        {/* Avatar */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-slate-700 bg-slate-900 text-xl font-bold text-cyan-400">
          JB
        </div>

        {/* Name */}
        <h3 className="text-xl font-bold text-white">{t("title")}</h3>

        {/* Role */}
        <p className="mt-1 text-sm text-slate-500">{t("name")}</p>

        {/* Story paragraphs */}
        <div className="mt-10 space-y-6 text-left">
          <p className="text-sm text-slate-400 leading-relaxed">
            {t("story1")}
          </p>

          <p className="text-sm text-slate-400 leading-relaxed">
            {t("story2")}
          </p>

          {/* Quote */}
          <blockquote className="border-l-2 border-cyan-500 pl-6">
            <p className="text-lg italic text-slate-300 leading-relaxed">
              &ldquo;{t("story3")}&rdquo;
            </p>
          </blockquote>

          <p className="text-sm text-slate-400 leading-relaxed">
            {t("story4")}
          </p>

          {/* Mission */}
          <p className="text-sm text-slate-400 leading-relaxed">
            {t("mission")}
          </p>
        </div>
      </div>
    </section>
  );
}
