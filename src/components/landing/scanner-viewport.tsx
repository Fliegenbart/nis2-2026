"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Activity } from "lucide-react";

// ---------------------------------------------------------------------------
// useCountUp hook
// ---------------------------------------------------------------------------
function useCountUp(target: number, duration: number, start: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number;
    let frame: number;

    function animate(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, start]);

  return count;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
interface ScannerViewportProps {
  locale: string;
  children?: React.ReactNode;
}

export function ScannerViewport({ locale, children }: ScannerViewportProps) {
  const t = useTranslations("landing.socialProof");
  const tScanner = useTranslations("landing.scanner");
  const statsRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerVisible, setTickerVisible] = useState(true);

  const hasChildren = !!children;
  const numberLocale = locale === "de" ? "de-DE" : "en-US";

  const tickerMessages =
    locale === "de"
      ? [
          "Thomas W. von SaaS Solutions hat den Report heruntergeladen",
          "DataCenter Pro hat den Quick-Check abgeschlossen",
          "HealthTech Nord hat ein Audit gestartet",
        ]
      : [
          "Thomas W. from SaaS Solutions downloaded the report",
          "DataCenter Pro completed the quick check",
          "HealthTech North started an audit",
        ];

  // IntersectionObserver to trigger count-up
  useEffect(() => {
    if (!statsRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerVisible(false);
      setTimeout(() => {
        setTickerIndex((i) => (i + 1) % tickerMessages.length);
        setTickerVisible(true);
      }, 300);
    }, 3800);
    return () => clearInterval(interval);
  }, [tickerMessages.length]);

  // Count-up values
  const scanned = useCountUp(1247, 1500, isVisible);
  const atRisk = useCountUp(873, 1500, isVisible);
  const secured = useCountUp(89, 1500, isVisible);

  const stats = [
    { value: `${scanned.toLocaleString(numberLocale)}+`, label: t("scanned"), tone: "text-cyan-700" },
    { value: atRisk.toLocaleString(numberLocale), label: t("atRisk"), tone: "text-rose-600" },
    { value: secured.toLocaleString(numberLocale), label: t("secured"), tone: "text-emerald-700" },
  ];

  return (
    <section className="landing-section" id="scanner-viewport">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-2xl bg-slate-950 p-6 shadow-[0_26px_60px_-34px_rgba(2,6,23,0.82)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="landing-eyebrow-dark">Security Scanner</p>
                <h2 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">{tScanner("title")}</h2>
                <p className="mt-2 text-sm text-slate-300 sm:text-base">{tScanner("subtitle")}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <input
                value={tScanner("placeholder")}
                readOnly
                className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-200"
              />
              <button className="rounded-lg bg-rose-500 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-rose-400">
                {tScanner("cta")}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1">FREE</span>
              <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1">NO COMMITMENT</span>
              <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1">30-SEC RESULT</span>
            </div>
          </div>
        </div>

        <div ref={statsRef} className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-4 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="landing-card p-5 text-center"
            >
              <div className={`font-mono text-3xl font-extrabold sm:text-4xl ${stat.tone}`}>
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-4 flex max-w-5xl items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
            <Activity className="h-4 w-4" />
            LIVE
          </span>
          <span className={`transition-opacity duration-300 ${tickerVisible ? "opacity-100" : "opacity-30"}`}>
            {tickerMessages[tickerIndex]}
          </span>
        </div>

        {hasChildren && (
          <div className="landing-card mx-auto mt-8 max-w-5xl p-5 sm:p-8">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
