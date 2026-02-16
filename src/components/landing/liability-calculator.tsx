"use client";

import { useRef, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Calculator, AlertTriangle, Info } from "lucide-react";
import { motion, useInView } from "motion/react";
import { calculateMaxFine, formatFine, isLikelyAffected } from "@/lib/fine-calculator";

export function LiabilityCalculator() {
  const t = useTranslations("landing.calculator");
  const locale = useLocale();
  const [revenue, setRevenue] = useState<string>("");
  const [employees, setEmployees] = useState<string>("");

  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const revenueNum = parseFloat(revenue.replace(/[^0-9]/g, "")) || 0;
  const employeesNum = parseInt(employees.replace(/[^0-9]/g, "")) || 0;
  const maxFine = calculateMaxFine(revenueNum);
  const affected = isLikelyAffected(revenueNum, employeesNum);
  const hasInput = revenueNum > 0 || employeesNum > 0;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-slate-900 py-16 sm:py-24"
      id="calculator"
    >
      {/* Ambient glow orbs */}
      <div className="absolute -right-40 top-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/[0.04] blur-[120px]" />
      <div className="absolute -left-40 bottom-1/4 h-[300px] w-[300px] rounded-full bg-rose-500/[0.04] blur-[100px]" />

      {/* Dot grid background */}
      <div className="absolute inset-0 dot-grid opacity-30" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="animated-border rounded-2xl p-[1px]">
              <div className="glass-card rounded-2xl p-6 sm:p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 glow-cyan"
                  >
                    <Calculator className="h-7 w-7 text-cyan-400" />
                  </motion.div>
                  <h2 className="text-2xl font-extrabold tracking-tight">
                    <span className="text-gradient-cyan">{t("title")}</span>
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    {t("subtitle")}
                  </p>
                </div>

                {/* Input fields */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                  >
                    <label
                      htmlFor="revenue"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-400"
                    >
                      {t("revenue")}
                    </label>
                    <input
                      id="revenue"
                      type="text"
                      inputMode="numeric"
                      placeholder={t("revenuePlaceholder")}
                      value={revenue}
                      onChange={(e) => setRevenue(e.target.value)}
                      className="w-full rounded-xl border border-slate-700/50 bg-slate-900/80 px-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 focus:shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                  >
                    <label
                      htmlFor="employees"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-400"
                    >
                      {t("employees")}
                    </label>
                    <input
                      id="employees"
                      type="text"
                      inputMode="numeric"
                      placeholder={t("employeesPlaceholder")}
                      value={employees}
                      onChange={(e) => setEmployees(e.target.value)}
                      className="w-full rounded-xl border border-slate-700/50 bg-slate-900/80 px-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 focus:shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all"
                    />
                  </motion.div>
                </div>

                {/* Results */}
                {hasInput && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mt-8 space-y-4"
                  >
                    {/* Fine amount display */}
                    <div className="relative rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 text-center glow-rose overflow-hidden">
                      {/* Shimmer overlay */}
                      <div className="absolute inset-0 shimmer pointer-events-none" />
                      <p className="relative text-xs font-semibold uppercase tracking-widest text-rose-400/80 mb-2">
                        {t("result")}
                      </p>
                      <p className="relative text-4xl sm:text-5xl font-extrabold font-mono text-gradient-rose tracking-tight">
                        {formatFine(maxFine, locale)}
                      </p>
                      {/* Decorative glow behind the number */}
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-48 rounded-full bg-rose-500/10 blur-[40px] pointer-events-none" />
                    </div>

                    {/* Affected status */}
                    <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4">
                      {affected ? (
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                          </div>
                          <div>
                            <p className="font-bold text-white">
                              {t("affected")}
                            </p>
                            <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-300 shadow-[0_0_10px_rgba(251,113,133,0.1)]">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                              NIS2
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                            <Info className="h-4 w-4 text-cyan-400" />
                          </div>
                          <div>
                            <p className="font-bold text-white">
                              {t("notAffected")}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                              {t("notAffectedHint")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
