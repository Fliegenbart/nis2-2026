"use client";

import { useTranslations } from "next-intl";
import { CheckCircle } from "lucide-react";

interface PricingTier {
  key: string;
  price: string;
  priceNote: string;
  recommended?: boolean;
  featureKeys: string[];
  ctaHref: string;
}

export function PricingSection() {
  const t = useTranslations("landing.pricing");

  const tiers: PricingTier[] = [
    {
      key: "starter",
      price: "€15.000",
      priceNote: t("oneTime"),
      featureKeys: ["f1", "f2", "f3"],
      ctaHref: "#booking",
    },
    {
      key: "professional",
      price: "€28.000",
      priceNote: t("oneTime"),
      recommended: true,
      featureKeys: ["f1", "f2", "f3", "f4"],
      ctaHref: "#booking",
    },
    {
      key: "enterprise",
      price: "€45.000+",
      priceNote: t("custom"),
      featureKeys: ["f1", "f2", "f3", "f4"],
      ctaHref: "#booking",
    },
  ];

  return (
    <section className="landing-section" id="pricing">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="landing-eyebrow">Pricing</p>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">{t("subtitle")}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.key}
              className={`relative rounded-2xl p-7 ${
                tier.recommended
                  ? "landing-panel border-cyan-300"
                  : "landing-card"
              }`}
            >
              {tier.recommended && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full border border-cyan-300 bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">
                    {t("recommended")}
                  </span>
                </div>
              )}

              <div className="mb-5">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                  {t(`${tier.key}.name`)}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{t(`${tier.key}.desc`)}</p>
              </div>

              <div className="mb-7">
                <span className="text-4xl font-extrabold text-slate-900">{tier.price}</span>
                <span className="ml-2 text-sm text-slate-500">{tier.priceNote}</span>
              </div>

              <ul className="mb-8 space-y-3">
                {tier.featureKeys.map((fKey) => (
                  <li key={fKey} className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />
                    {t(`${tier.key}.${fKey}`)}
                  </li>
                ))}
              </ul>

              <a
                href={tier.ctaHref}
                className={`block w-full rounded-xl py-3.5 text-center text-sm font-bold transition-colors ${
                  tier.recommended
                    ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                    : "border border-slate-300 bg-white text-slate-900 hover:border-slate-400"
                }`}
              >
                {t(`${tier.key}.cta`)}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
