"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface HeroSectionProps {
  onStartQuickCheck: () => void;
}

export function HeroSection({ onStartQuickCheck }: HeroSectionProps) {
  const t = useTranslations("landing.hero");
  const tTrust = useTranslations("landing.trustSignals");
  const tUrgency = useTranslations("landing.urgencyBanner");

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(239,68,68,0.24),transparent_42%),radial-gradient(circle_at_90%_20%,rgba(34,211,238,0.22),transparent_48%)]" />

      <div className="relative mx-auto max-w-5xl px-6 pb-20 pt-16 text-center sm:pb-24 sm:pt-20">
        <div className="landing-alert mx-auto mb-7 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold">
          <AlertTriangle className="h-4 w-4" />
          <span>{tUrgency("textShort")}</span>
        </div>

        <p className="landing-eyebrow-dark mb-6">EU Directive 2022/2555</p>

        <h1 className="mx-auto max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">
          {t("title")}
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-200 sm:text-xl">
          {t("subtitle")}
        </p>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
          {t("description")}
        </p>

        <button
          onClick={onStartQuickCheck}
          className="mt-9 rounded-xl bg-cyan-400 px-8 py-4 text-base font-extrabold text-slate-950 transition-colors hover:bg-cyan-300"
        >
          {t("cta")}
        </button>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
          {(["noRegistration", "gdprCompliant", "freeCheck"] as const).map((key) => (
            <span key={key} className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-medium text-slate-200 sm:text-sm">{tTrust(key)}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
