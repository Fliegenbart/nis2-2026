"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Check, ArrowRight } from "lucide-react";
import { motion, useInView } from "motion/react";

interface PricingTier {
  key: string;
  price: string;
  priceNote: string;
  recommended?: boolean;
  featureKeys: string[];
}

export function PricingSection() {
  const t = useTranslations("landing.pricing");
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

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
    <section
      className="relative overflow-hidden bg-slate-950 py-20 sm:py-28 scan-lines"
      id="pricing"
    >
      {/* Ambient glow orbs */}
      <div className="absolute -left-32 top-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/[0.05] blur-[120px]" />
      <div className="absolute -right-32 bottom-1/4 h-[350px] w-[350px] rounded-full bg-cyan-500/[0.04] blur-[100px]" />
      <div className="absolute left-1/2 top-0 h-[250px] w-[600px] -translate-x-1/2 rounded-full bg-cyan-500/[0.03] blur-[80px]" />

      {/* Dot grid background */}
      <div className="absolute inset-0 dot-grid opacity-40" />

      <div className="container relative z-10 mx-auto px-4" ref={sectionRef}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center mb-16"
        >
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            <span className="text-gradient-cyan">{t("title")}</span>
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Pricing grid */}
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3 items-center">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.key}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={
                isInView ? { opacity: 1, y: 0, scale: 1 } : {}
              }
              transition={{
                duration: 0.5,
                delay: 0.15 * index,
                ease: "easeOut",
              }}
              className={`group relative rounded-2xl p-[1px] transition-all duration-500 ${
                tier.recommended
                  ? "lg:-mt-4 lg:mb-[-16px] z-10"
                  : ""
              }`}
            >
              {/* Card wrapper - animated border for recommended, glass-card for others */}
              <div
                className={`relative rounded-2xl ${
                  tier.recommended
                    ? "animated-border glow-cyan-strong"
                    : "glass-card"
                }`}
              >
                {/* Recommended badge */}
                {tier.recommended && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                    <div className="relative rounded-full bg-cyan-500 px-5 py-1.5 text-xs font-bold text-slate-950 uppercase tracking-wider shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                      <div className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping" style={{ animationDuration: "3s" }} />
                      <span className="relative">{t("recommended")}</span>
                    </div>
                  </div>
                )}

                {/* Inner shimmer for recommended tier */}
                {tier.recommended && (
                  <div className="absolute inset-0 rounded-2xl shimmer pointer-events-none" />
                )}

                <div
                  className={`relative rounded-2xl p-7 sm:p-9 ${
                    tier.recommended ? "py-10 sm:py-12" : ""
                  }`}
                >
                  {/* Tier name and description */}
                  <div className="mb-6">
                    <h3
                      className={`text-sm font-semibold uppercase tracking-widest ${
                        tier.recommended
                          ? "text-cyan-400"
                          : "text-slate-500"
                      }`}
                    >
                      {t(`${tier.key}.name`)}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                      {t(`${tier.key}.desc`)}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <span
                      className={`text-4xl font-extrabold ${
                        tier.recommended
                          ? "text-gradient-cyan"
                          : "text-white"
                      }`}
                    >
                      {tier.price}
                    </span>
                    <span className="ml-2 text-sm text-slate-600">
                      {tier.priceNote}
                    </span>
                  </div>

                  {/* Features list */}
                  <ul className="mb-9 space-y-3.5">
                    {tier.featureKeys.map((fKey, fIndex) => (
                      <motion.li
                        key={fKey}
                        initial={{ opacity: 0, x: -15 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{
                          delay: 0.3 + index * 0.15 + fIndex * 0.06,
                        }}
                        className="flex items-start gap-3 text-sm text-slate-300"
                      >
                        <Check
                          className={`mt-0.5 h-4 w-4 shrink-0 ${
                            tier.recommended
                              ? "text-cyan-400"
                              : "text-cyan-600"
                          }`}
                        />
                        {t(`${tier.key}.${fKey}`)}
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA button */}
                  <button
                    className={`w-full rounded-xl py-3.5 text-sm font-bold transition-all duration-300 ${
                      tier.recommended
                        ? "bg-cyan-500 text-slate-950 shadow-[0_0_25px_rgba(34,211,238,0.3)] hover:bg-cyan-400 hover:shadow-[0_0_35px_rgba(34,211,238,0.45)]"
                        : "border border-slate-700/60 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 hover:shadow-[0_0_15px_rgba(34,211,238,0.1)] bg-slate-900/50"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {t(`${tier.key}.cta`)}
                      {tier.recommended && (
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
