"use client";

import { useTranslations } from "next-intl";
import { CheckCircle } from "lucide-react";

interface HeroSectionProps {
  onStartQuickCheck: () => void;
}

export function HeroSection({ onStartQuickCheck }: HeroSectionProps) {
  const t = useTranslations("landing.hero");
  const tTrust = useTranslations("landing.trustSignals");

  return (
    <section className="bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-32 sm:py-40 lg:py-48 text-center">
        <p className="text-xs tracking-widest text-slate-500 uppercase mb-8">
          EU DIRECTIVE 2022/2555
        </p>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gradient-cyan mb-6">
          {t("title")}
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-12">
          {t("subtitle")}
        </p>

        <button
          onClick={onStartQuickCheck}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg px-8 py-4 text-base transition-colors"
        >
          {t("cta")}
        </button>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {(["noRegistration", "gdprCompliant", "freeCheck"] as const).map((key) => (
            <span key={key} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-cyan-500" />
              <span className="text-sm text-slate-500">{tTrust(key)}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
