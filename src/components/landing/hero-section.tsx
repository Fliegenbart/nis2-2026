"use client";

import { useTranslations } from "next-intl";
import { Shield, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface HeroSectionProps {
  onStartQuickCheck: () => void;
}

function ComplianceWidget() {
  const t = useTranslations("landing.complianceWidget");

  const categories = [
    { key: "cyberRisk", value: 0 },
    { key: "incidentReporting", value: 0 },
    { key: "securityDocs", value: 0 },
    { key: "supplyChain", value: 0 },
  ];

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/80 backdrop-blur-sm p-5 shadow-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">
          {t("title")}
        </h3>
        <Shield className="h-4 w-4 text-slate-500" />
      </div>

      <div className="space-y-3">
        {categories.map(({ key, value }) => (
          <div key={key}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400">{t(key)}</span>
              <span className="font-mono text-rose-400">{value}%</span>
            </div>
            <Progress value={value} className="h-1.5 bg-slate-700 [&>div]:bg-rose-500" />
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-slate-700 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">{t("overall")}</span>
          <span className="text-lg font-bold text-rose-400">0%</span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-950/50 border border-rose-800/50 px-3 py-2">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
        <span className="text-xs font-medium text-rose-300">
          {t("critical")}
        </span>
      </div>
    </div>
  );
}

export function HeroSection({ onStartQuickCheck }: HeroSectionProps) {
  const t = useTranslations("landing");

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />

      <div className="container relative mx-auto px-4 py-16 sm:py-24 lg:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3 text-center lg:text-left">
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

            <p className="mb-10 max-w-2xl text-lg text-slate-300 lg:mx-0 mx-auto">
              {t("hero.description")}
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start sm:justify-center">
              <Button
                size="lg"
                onClick={onStartQuickCheck}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-6 text-lg shadow-lg shadow-indigo-500/25"
              >
                {t("hero.cta")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-sm text-slate-400">
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

          <div className="lg:col-span-2 hidden lg:block">
            <ComplianceWidget />
          </div>
        </div>
      </div>
    </section>
  );
}
