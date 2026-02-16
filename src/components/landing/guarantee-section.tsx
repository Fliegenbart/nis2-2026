"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Shield, Check } from "lucide-react";
import { motion, useInView } from "motion/react";

export function GuaranteeSection() {
  const t = useTranslations("landing.guarantee");
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const guarantees = [
    { key: "moneyBack" },
    { key: "compensation" },
    { key: "fineCover" },
  ] as const;

  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 sm:py-28">
      {/* Ambient emerald glow orbs */}
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.04] blur-[120px]" />
      <div className="absolute -right-20 top-0 h-[300px] w-[300px] rounded-full bg-emerald-500/[0.06] blur-[80px]" />

      {/* Dot grid overlay */}
      <div className="absolute inset-0 dot-grid opacity-30" />

      <div ref={sectionRef} className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto max-w-3xl"
        >
          {/* Animated border card */}
          <div className="animated-border rounded-2xl p-px">
            <div className="relative overflow-hidden rounded-2xl bg-slate-950/80 p-8 sm:p-12 text-center">
              {/* Shimmer overlay */}
              <div className="absolute inset-0 shimmer pointer-events-none" />

              {/* Scan lines for tactical feel */}
              <div className="absolute inset-0 scan-lines pointer-events-none opacity-50" />

              <div className="relative z-10">
                {/* Pulsing shield icon with ring animation */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                  className="mx-auto mb-8 flex h-20 w-20 items-center justify-center"
                >
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 ring-2 ring-emerald-500/30 glow-emerald">
                    <Shield className="h-9 w-9 text-emerald-400" />
                    {/* Pulsing ring */}
                    <div className="pulse-ring absolute inset-0 rounded-full text-emerald-400" />
                    {/* Secondary slower ping */}
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-400/20 animate-ping" style={{ animationDuration: "3s" }} />
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="mb-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl"
                >
                  {t("title")}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mb-10 text-slate-400 text-lg"
                >
                  {t("subtitle")}
                </motion.p>

                {/* Guarantee items - staggered reveal */}
                <div className="space-y-4">
                  {guarantees.map(({ key }, i) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -30 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{
                        duration: 0.5,
                        delay: 0.5 + i * 0.15,
                        ease: "easeOut",
                      }}
                    >
                      <div className="glass-card group flex items-center gap-4 rounded-xl px-6 py-5 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_0_25px_rgba(52,211,153,0.1)]">
                        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
                          <Check className="h-4 w-4 text-emerald-400" />
                          <div className="absolute inset-0 rounded-full bg-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping" style={{ animationDuration: "2s" }} />
                        </div>
                        <span className="text-base font-semibold text-white tracking-wide">
                          {t(key)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Divider line */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : {}}
                  transition={{ duration: 0.8, delay: 1.0 }}
                  className="mx-auto mt-10 mb-8 h-px w-2/3 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"
                />

                {/* Tagline with gradient text */}
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 1.1 }}
                  className="text-xl font-bold text-gradient-emerald sm:text-2xl"
                >
                  {t("tagline")}
                </motion.p>

                {/* Explanation */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.5, delay: 1.3 }}
                  className="mt-3 text-sm text-slate-500 leading-relaxed"
                >
                  {t("explanation")}
                </motion.p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
