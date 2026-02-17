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
    <section className="landing-section" id="bulletproof">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          <span>Wir machen Ihr Unternehmen </span>
          <span className="bg-gradient-to-r from-emerald-500 to-cyan-600 bg-clip-text text-transparent">
            bulletproof
          </span>
        </h2>

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <div className="landing-card p-6 sm:p-8">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
              <Calculator className="h-5 w-5 text-slate-700" />
            </div>

            <h3 className="text-xl font-bold text-slate-900">{tCalc("title")}</h3>
            <p className="mt-1 text-sm text-slate-600">{tCalc("subtitle")}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="bp-revenue"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="bp-employees"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                />
              </div>
            </div>

            {hasInput && (
              <div className="mt-6 space-y-4">
                <div className="landing-muted-surface p-6 text-center">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-600">
                    {tCalc("result")}
                  </p>
                  <p className="font-mono text-3xl font-extrabold text-rose-600">
                    {formatFine(animatedFine, locale)}
                  </p>
                </div>

                <div className="landing-muted-surface p-4">
                  {affected ? (
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                      <p className="text-sm font-semibold text-slate-900">
                        {tCalc("affected")}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Info className="h-5 w-5 shrink-0 text-slate-500" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {tCalc("notAffected")}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-600">
                          {tCalc("notAffectedHint")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-emerald-300 bg-gradient-to-b from-emerald-50 to-teal-50 p-6 shadow-[0_24px_44px_-30px_rgba(6,95,70,0.45)] sm:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_95%_5%,rgba(16,185,129,0.22),transparent_34%)]" />

            <div className="relative mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
              <Shield className="h-5 w-5 text-emerald-700" />
            </div>

            <h3 className="relative text-2xl font-extrabold text-emerald-900">{tGuarantee("title")}</h3>
            <p className="relative mt-2 text-sm text-emerald-900/85">{tGuarantee("subtitle")}</p>

            <div className="relative mt-6 space-y-3">
              {guarantees.map(({ key }) => (
                <div key={key} className="rounded-lg border border-emerald-300 bg-white/70 px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-950">
                    {tGuarantee(key)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <p className="relative mt-6 text-sm font-semibold text-emerald-900">{tGuarantee("tagline")}</p>
            <p className="relative mt-2 text-sm leading-relaxed text-emerald-900/80">{tGuarantee("explanation")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
