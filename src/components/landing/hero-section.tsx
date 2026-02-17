"use client";

import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle, CheckCircle, ShieldCheck } from "lucide-react";

interface HeroSectionProps {
  onStartQuickCheck: () => void;
}

export function HeroSection({ onStartQuickCheck }: HeroSectionProps) {
  const locale = useLocale();
  const t = useTranslations("landing.hero");
  const tTrust = useTranslations("landing.trustSignals");
  const tUrgency = useTranslations("landing.urgencyBanner");

  const briefingPoints =
    locale === "de"
      ? [
          "Methodik: NIS2-2026 v1 + gewichtetes Scoring",
          "Reviewer-Workflow inkl. Freigabeprozess",
          "Exportierbarer Audit-Trail (CSV)",
          "Risiko- und Bußgeldindikator in unter 30 Sekunden",
        ]
      : [
          "Methodology: NIS2-2026 v1 with weighted scoring",
          "Reviewer workflow with structured approvals",
          "Exportable audit trail (CSV)",
          "Risk and fine indicator in under 30 seconds",
        ];

  return (
    <section className="relative overflow-hidden border-b border-slate-200/70">
      <div className="pointer-events-none absolute inset-0 landing-grid-bg opacity-45" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(14,165,233,0.14),transparent_36%),radial-gradient(circle_at_90%_10%,rgba(20,184,166,0.12),transparent_36%)]" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-14 lg:grid-cols-[1.12fr_0.88fr] lg:pb-20 lg:pt-18">
        <div>
          <div className="landing-alert mb-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold">
            <AlertTriangle className="h-4 w-4" />
            <span>{tUrgency("textShort")}</span>
          </div>

          <p className="landing-eyebrow mb-6">EU Directive 2022/2555</p>

          <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-700 sm:text-xl">
            {t("subtitle")}
          </p>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            {t("description")}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={onStartQuickCheck}
              className="rounded-xl bg-cyan-500 px-7 py-3.5 text-sm font-extrabold text-slate-950 transition-colors hover:bg-cyan-400"
            >
              {t("cta")}
            </button>
            <a
              href="#pricing"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
            >
              {locale === "de" ? "Preise ansehen" : "View pricing"}
            </a>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2">
            {(["noRegistration", "gdprCompliant", "freeCheck"] as const).map((key) => (
              <span key={key} className="landing-chip">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                <span>{tTrust(key)}</span>
              </span>
            ))}
          </div>
        </div>

        <aside className="landing-panel p-6 sm:p-7">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50">
              <ShieldCheck className="h-5 w-5 text-cyan-700" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">
                {locale === "de" ? "Executive Briefing" : "Executive Briefing"}
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {locale === "de"
                  ? "Was Sie in der Demo sofort sehen"
                  : "What this demo proves in minutes"}
              </p>
            </div>
          </div>

          <ul className="space-y-2.5">
            {briefingPoints.map((point) => (
              <li
                key={point}
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700"
              >
                {point}
              </li>
            ))}
          </ul>

          <div className="landing-divider my-5" />

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {locale === "de" ? "Erster Check" : "Initial check"}
              </p>
              <p className="mt-1 text-xl font-black text-slate-900">30s</p>
            </div>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-700">
                {locale === "de" ? "Max. Bußgeld" : "Max fine"}
              </p>
              <p className="mt-1 text-xl font-black text-rose-700">€10M</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
