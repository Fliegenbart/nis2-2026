"use client";

import { useRef, useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Calculator, AlertTriangle, Info, Shield, CheckCircle } from "lucide-react";
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

// ── Main component ──────────────────────────────────────────────────
export function BulletproofViewport() {
  const tCalc = useTranslations("landing.calculator");
  const tGuarantee = useTranslations("landing.guarantee");
  const locale = useLocale();

  // Calculator state
  const [revenue, setRevenue] = useState<string>("");
  const [employees, setEmployees] = useState<string>("");

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
      className="bg-slate-950 py-32 sm:py-40"
      id="bulletproof"
    >
      <div className="mx-auto max-w-6xl px-4">
        {/* ── Section Headline ────────────────────────────────── */}
        <h2 className="mb-16 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
          <span className="text-white">Wir machen Ihr Unternehmen </span>
          <span className="text-gradient-cyan">bulletproof</span>
        </h2>

        {/* ── Two-column grid ─────────────────────────────────── */}
        <div className="grid gap-12 lg:grid-cols-2 items-start">
          {/* ─── Left: Calculator card ────────────────────────── */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
            {/* Icon */}
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800">
              <Calculator className="h-6 w-6 text-slate-400" />
            </div>

            {/* Title + subtitle */}
            <h3 className="text-xl font-bold text-white">
              {tCalc("title")}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {tCalc("subtitle")}
            </p>

            {/* Input fields */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="bp-revenue"
                  className="block text-xs font-medium uppercase tracking-wider text-slate-500"
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
                  className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="bp-employees"
                  className="block text-xs font-medium uppercase tracking-wider text-slate-500"
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
                  className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                />
              </div>
            </div>

            {/* Results */}
            {hasInput && (
              <div className="mt-8 space-y-4">
                {/* Fine amount */}
                <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 text-center">
                  <p className="text-xs font-medium uppercase tracking-widest text-slate-500 mb-2">
                    {tCalc("result")}
                  </p>
                  <p className="text-3xl font-extrabold font-mono text-rose-400">
                    {formatFine(animatedFine, locale)}
                  </p>
                </div>

                {/* Affected status */}
                <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
                  {affected ? (
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
                      <p className="text-sm font-medium text-white">
                        {tCalc("affected")}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Info className="h-5 w-5 shrink-0 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {tCalc("notAffected")}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {tCalc("notAffectedHint")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ─── Right: Guarantee card ────────────────────────── */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
            {/* Icon */}
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800">
              <Shield className="h-6 w-6 text-slate-400" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-white">
              {tGuarantee("title")}
            </h3>

            {/* Guarantee items */}
            <div className="mt-6 space-y-4">
              {guarantees.map(({ key }) => (
                <div key={key} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 shrink-0 text-cyan-500" />
                  <span className="text-sm text-white">
                    {tGuarantee(key)}
                  </span>
                </div>
              ))}
            </div>

            {/* Tagline */}
            <p className="mt-8 text-sm text-slate-500">
              {tGuarantee("tagline")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
