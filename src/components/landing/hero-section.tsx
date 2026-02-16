"use client";

import { useTranslations } from "next-intl";
import { Shield, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onStartQuickCheck: () => void;
}

export function HeroSection({ onStartQuickCheck }: HeroSectionProps) {
  const t = useTranslations("landing");

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />

      <div className="container relative mx-auto px-4 py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-2 text-sm text-indigo-200">
            <Shield className="h-4 w-4" />
            EU Richtlinie 2022/2555
          </div>

          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            {t("hero.title")}
          </h1>

          <p className="mb-4 text-xl font-semibold text-rose-300 sm:text-2xl">
            {t("hero.subtitle")}
          </p>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-300">
            {t("hero.description")}
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              onClick={onStartQuickCheck}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-6 text-lg shadow-lg shadow-indigo-500/25"
            >
              {t("hero.cta")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              {t("trustSignals.noRegistration")}
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              {t("trustSignals.gdprCompliant")}
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              {t("trustSignals.instantResult")}
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              {t("trustSignals.freeCheck")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
