"use client";

import { useTranslations } from "next-intl";
import { CheckCircle } from "lucide-react";

interface PricingTier {
  key: string;
  price: string;
  priceNote: string;
  recommended?: boolean;
  featureKeys: string[];
}

export function PricingSection() {
  const t = useTranslations("landing.pricing");

  const tiers: PricingTier[] = [
    {
      key: "starter",
      price: "€15.000",
      priceNote: t("oneTime"),
      featureKeys: ["f1", "f2", "f3"],
    },
    {
      key: "professional",
      price: "€28.000",
      priceNote: t("oneTime"),
      recommended: true,
      featureKeys: ["f1", "f2", "f3", "f4"],
    },
    {
      key: "enterprise",
      price: "€45.000+",
      priceNote: t("custom"),
      featureKeys: ["f1", "f2", "f3", "f4"],
    },
  ];

  return (
    <section className="bg-slate-950 py-32 sm:py-40" id="pricing">
      <div className="mx-auto max-w-5xl px-4">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-slate-400 leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Pricing grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.key}
              className={`relative rounded-2xl bg-slate-900/50 p-8 ${
                tier.recommended
                  ? "border-2 border-cyan-500"
                  : "border border-slate-800"
              }`}
            >
              {/* Recommended badge */}
              {tier.recommended && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-cyan-500 px-3 py-1 text-xs font-bold text-slate-950">
                    Empfohlen
                  </span>
                </div>
              )}

              {/* Tier name and description */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                  {t(`${tier.key}.name`)}
                </h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  {t(`${tier.key}.desc`)}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-white">
                  {tier.price}
                </span>
                <span className="ml-2 text-sm text-slate-600">
                  {tier.priceNote}
                </span>
              </div>

              {/* Features list */}
              <ul className="mb-9 space-y-3.5">
                {tier.featureKeys.map((fKey) => (
                  <li
                    key={fKey}
                    className="flex items-start gap-3 text-sm text-slate-300"
                  >
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-cyan-500" />
                    {t(`${tier.key}.${fKey}`)}
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              <button
                className={`w-full rounded-xl py-3.5 text-sm font-bold transition-colors ${
                  tier.recommended
                    ? "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                    : "border border-slate-700 text-white hover:border-slate-600"
                }`}
              >
                {t(`${tier.key}.cta`)}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
