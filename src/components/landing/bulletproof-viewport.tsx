"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Calculator, AlertTriangle, Info, Shield, Check } from "lucide-react";
import { motion, useInView } from "motion/react";
import {
  calculateMaxFine,
  formatFine,
  isLikelyAffected,
} from "@/lib/fine-calculator";

// ── Animated counter hook ────────────────────────────────────────────
function useAnimatedCounter(target: number, duration = 800) {
  const [current, setCurrent] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target === prevTarget.current) return;
    const start = prevTarget.current;
    const diff = target - start;
    const startTime = performance.now();

    function step(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
    prevTarget.current = target;
  }, [target, duration]);

  return current;
}

// ── Floating particle component ──────────────────────────────────────
function FloatingParticle({
  color,
  size,
  initialX,
  initialY,
  duration,
  delay,
}: {
  color: string;
  size: number;
  initialX: string;
  initialY: string;
  duration: number;
  delay: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: initialX,
        top: initialY,
        background: color,
        boxShadow: `0 0 ${size * 3}px ${color}, 0 0 ${size * 6}px ${color}`,
      }}
      animate={{
        y: [0, -30, 10, -20, 0],
        x: [0, 15, -10, 20, 0],
        opacity: [0.4, 0.8, 0.3, 0.7, 0.4],
        scale: [1, 1.3, 0.8, 1.1, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// ── Main component ──────────────────────────────────────────────────
export function BulletproofViewport() {
  const tCalc = useTranslations("landing.calculator");
  const tGuarantee = useTranslations("landing.guarantee");
  const locale = useLocale();

  // Calculator state
  const [revenue, setRevenue] = useState<string>("");
  const [employees, setEmployees] = useState<string>("");

  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Calculator derived values
  const revenueNum = parseFloat(revenue.replace(/[^0-9]/g, "")) || 0;
  const employeesNum = parseInt(employees.replace(/[^0-9]/g, "")) || 0;
  const maxFine = calculateMaxFine(revenueNum);
  const affected = isLikelyAffected(revenueNum, employeesNum);
  const hasInput = revenueNum > 0 || employeesNum > 0;

  // Animated fine counter
  const animatedFine = useAnimatedCounter(hasInput ? maxFine : 0, 900);

  // Guarantee items
  const guarantees = [
    { key: "moneyBack" },
    { key: "compensation" },
    { key: "fineCover" },
  ] as const;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-slate-950 py-20 sm:py-28 lg:py-32"
      id="bulletproof"
    >
      {/* ── Background layers ─────────────────────────────────── */}

      {/* Ambient glow orbs */}
      <div className="absolute -left-60 top-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/[0.04] blur-[140px]" />
      <div className="absolute -right-40 top-1/3 h-[400px] w-[400px] rounded-full bg-emerald-500/[0.04] blur-[120px]" />
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 h-[350px] w-[700px] rounded-full bg-rose-500/[0.03] blur-[120px]" />

      {/* Dot grid overlay */}
      <div className="absolute inset-0 dot-grid opacity-20" />

      {/* Scan lines */}
      <div className="absolute inset-0 scan-lines pointer-events-none opacity-40" />

      {/* Floating particles */}
      <FloatingParticle
        color="rgba(34,211,238,0.5)"
        size={4}
        initialX="15%"
        initialY="20%"
        duration={8}
        delay={0}
      />
      <FloatingParticle
        color="rgba(52,211,153,0.5)"
        size={3}
        initialX="80%"
        initialY="60%"
        duration={10}
        delay={1.5}
      />
      <FloatingParticle
        color="rgba(251,113,133,0.4)"
        size={3}
        initialX="50%"
        initialY="80%"
        duration={9}
        delay={3}
      />

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="container relative z-10 mx-auto px-4">
        {/* ── Section Headline ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-6 text-center"
        >
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl">
            <span className="text-white">Wir machen Ihr Unternehmen </span>
            <span className="relative inline-block">
              <span className="text-gradient-cyan">bulletproof</span>
              {/* Shimmer sweep over the word */}
              <motion.span
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.3) 50%, transparent 100%)",
                  backgroundSize: "200% 100%",
                }}
                animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 2,
                }}
                aria-hidden="true"
              />
              {/* Underline glow */}
              <motion.span
                className="absolute -bottom-1 left-0 h-[2px] w-full bg-gradient-to-r from-cyan-400/0 via-cyan-400/80 to-cyan-400/0"
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              />
            </span>
          </h2>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-14 text-center text-base sm:text-lg text-slate-400"
        >
          {locale === "de"
            ? "Compliance-Schutz trifft auf finanzielle Sicherheit"
            : "Compliance protection meets financial security"}
        </motion.p>

        {/* ── Two-column grid ─────────────────────────────────── */}
        <div className="mx-auto max-w-6xl grid gap-8 lg:grid-cols-2 items-start">
          {/* ─── Left: Calculator card ────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
            whileHover={{ scale: 1.015 }}
            className="group transition-all duration-300"
          >
            <div className="animated-border rounded-2xl p-[1px] transition-shadow duration-300 group-hover:shadow-[0_0_40px_rgba(34,211,238,0.1)]">
              <div className="glass-card relative overflow-hidden rounded-2xl p-6 sm:p-8">
                {/* Card shimmer */}
                <div className="absolute inset-0 shimmer pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Scan lines inside card */}
                <div className="absolute inset-0 scan-lines pointer-events-none opacity-30" />

                <div className="relative z-10">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{
                        delay: 0.6,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 glow-cyan"
                    >
                      <Calculator className="h-7 w-7 text-cyan-400" />
                    </motion.div>
                    <h3 className="text-2xl font-extrabold tracking-tight">
                      <span className="text-gradient-cyan">
                        {tCalc("title")}
                      </span>
                    </h3>
                    <p className="mt-2 text-sm text-slate-400">
                      {tCalc("subtitle")}
                    </p>
                  </div>

                  {/* Input fields */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.7 }}
                      className="space-y-2"
                    >
                      <label
                        htmlFor="bp-revenue"
                        className="block text-xs font-semibold uppercase tracking-wider text-slate-400"
                      >
                        {tCalc("revenue")}
                      </label>
                      <input
                        id="bp-revenue"
                        type="text"
                        inputMode="numeric"
                        placeholder={tCalc("revenuePlaceholder")}
                        value={revenue}
                        onChange={(e) => setRevenue(e.target.value)}
                        className="w-full rounded-xl border border-slate-700/50 bg-slate-900/80 px-4 py-3 text-sm text-white font-mono placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 focus:shadow-[0_0_15px_rgba(34,211,238,0.1)] transition-all"
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.8 }}
                      className="space-y-2"
                    >
                      <label
                        htmlFor="bp-employees"
                        className="block text-xs font-semibold uppercase tracking-wider text-slate-400"
                      >
                        {tCalc("employees")}
                      </label>
                      <input
                        id="bp-employees"
                        type="text"
                        inputMode="numeric"
                        placeholder={tCalc("employeesPlaceholder")}
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
                          {tCalc("result")}
                        </p>
                        <p className="relative text-4xl sm:text-5xl font-extrabold font-mono text-gradient-rose tracking-tight">
                          {formatFine(animatedFine, locale)}
                        </p>
                        {/* Decorative glow behind the number */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-48 rounded-full bg-rose-500/10 blur-[40px] pointer-events-none" />
                        {/* Pulsing border effect on fine change */}
                        <motion.div
                          key={maxFine}
                          initial={{ opacity: 0.6, scale: 0.98 }}
                          animate={{ opacity: 0, scale: 1.02 }}
                          transition={{ duration: 1 }}
                          className="absolute inset-0 rounded-2xl border-2 border-rose-400/40 pointer-events-none"
                        />
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
                                {tCalc("affected")}
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
                                {tCalc("notAffected")}
                              </p>
                              <p className="text-sm text-slate-500 mt-1">
                                {tCalc("notAffectedHint")}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* ─── Right: Guarantee card ────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.55, ease: "easeOut" }}
            whileHover={{ scale: 1.015 }}
            className="group transition-all duration-300"
          >
            <div className="animated-border rounded-2xl p-px transition-shadow duration-300 group-hover:shadow-[0_0_40px_rgba(52,211,153,0.1)]">
              <div className="relative overflow-hidden rounded-2xl bg-slate-950/80 p-6 sm:p-8 lg:p-10">
                {/* Shimmer overlay */}
                <div className="absolute inset-0 shimmer pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Scan lines */}
                <div className="absolute inset-0 scan-lines pointer-events-none opacity-30" />

                <div className="relative z-10 text-center">
                  {/* Pulsing shield icon with ring animation */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{
                      duration: 0.6,
                      delay: 0.7,
                      ease: "easeOut",
                    }}
                    className="mx-auto mb-8 flex h-20 w-20 items-center justify-center"
                  >
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 ring-2 ring-emerald-500/30 glow-emerald">
                      <Shield className="h-9 w-9 text-emerald-400" />
                      {/* Pulsing ring */}
                      <div className="pulse-ring absolute inset-0 rounded-full text-emerald-400" />
                      {/* Secondary slower ping */}
                      <div
                        className="absolute inset-0 rounded-full border-2 border-emerald-400/20 animate-ping"
                        style={{ animationDuration: "3s" }}
                      />
                    </div>
                  </motion.div>

                  {/* Title */}
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="mb-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl"
                  >
                    {tGuarantee("title")}
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.9 }}
                    className="mb-8 text-slate-400 text-base sm:text-lg"
                  >
                    {tGuarantee("subtitle")}
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
                          delay: 1.0 + i * 0.15,
                          ease: "easeOut",
                        }}
                      >
                        <div className="glass-card group/item flex items-center gap-4 rounded-xl px-6 py-5 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_0_25px_rgba(52,211,153,0.1)]">
                          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
                            <Check className="h-4 w-4 text-emerald-400" />
                            <div
                              className="absolute inset-0 rounded-full bg-emerald-400/10 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 animate-ping"
                              style={{ animationDuration: "2s" }}
                            />
                          </div>
                          <span className="text-base font-semibold text-white tracking-wide text-left">
                            {tGuarantee(key)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Divider line */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={isInView ? { scaleX: 1 } : {}}
                    transition={{ duration: 0.8, delay: 1.5 }}
                    className="mx-auto mt-8 mb-6 h-px w-2/3 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"
                  />

                  {/* Tagline with gradient text */}
                  <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 1.6 }}
                    className="text-lg font-bold text-gradient-emerald sm:text-xl"
                  >
                    {tGuarantee("tagline")}
                  </motion.p>

                  {/* Explanation */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.5, delay: 1.8 }}
                    className="mt-3 text-sm text-slate-500 leading-relaxed"
                  >
                    {tGuarantee("explanation")}
                  </motion.p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
