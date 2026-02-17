"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Activity, ShieldCheck } from "lucide-react";

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

interface ScannerViewportProps {
  locale: string;
  onStartScan?: (targetUrl: string) => void;
  children?: React.ReactNode;
}

export function ScannerViewport({ locale, onStartScan, children }: ScannerViewportProps) {
  const t = useTranslations("landing.socialProof");
  const tScanner = useTranslations("landing.scanner");
  const statsRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerVisible, setTickerVisible] = useState(true);
  const [targetUrl, setTargetUrl] = useState("");
  const [urlError, setUrlError] = useState("");

  const hasChildren = !!children;
  const numberLocale = locale === "de" ? "de-DE" : "en-US";
  const quickCheckTrustLabel =
    locale === "de" ? "Keine Datenspeicherung im Quick-Check" : "No data stored in quick check";
  const scannerPills =
    locale === "de"
      ? ["KOSTENLOS", "UNVERBINDLICH", "ERGEBNIS IN 30 SEK."]
      : ["FREE", "NO COMMITMENT", "30-SEC RESULT"];

  const tickerMessages =
    locale === "de"
      ? [
          "DataCenter Pro hat den Quick-Check abgeschlossen",
          "HealthTech Nord hat ein Audit gestartet",
          "SaaSWorks hat den Report exportiert",
        ]
      : [
          "DataCenter Pro completed the quick check",
          "HealthTech North started an audit",
          "SaaSWorks exported the report",
        ];

  useEffect(() => {
    if (!statsRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
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
      }, 250);
    }, 3600);
    return () => clearInterval(interval);
  }, [tickerMessages.length]);

  const scanned = useCountUp(1247, 1500, isVisible);
  const atRisk = useCountUp(873, 1500, isVisible);
  const secured = useCountUp(89, 1500, isVisible);

  const stats = [
    { value: `${scanned.toLocaleString(numberLocale)}+`, label: t("scanned"), tone: "text-slate-900" },
    { value: atRisk.toLocaleString(numberLocale), label: t("atRisk"), tone: "text-rose-700" },
    { value: secured.toLocaleString(numberLocale), label: t("secured"), tone: "text-emerald-700" },
  ];

  function handleStartScan(e: React.FormEvent) {
    e.preventDefault();
    const trimmedUrl = targetUrl.trim();
    if (!trimmedUrl) {
      setUrlError(
        locale === "de"
          ? "Bitte zuerst Ihre Website-URL eingeben, um den Check freizuschalten."
          : "Please enter your website URL first to unlock the check."
      );
      return;
    }

    setUrlError("");
    onStartScan?.(trimmedUrl);
  }

  return (
    <section className="landing-section" id="scanner-viewport">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <div className="landing-panel p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="landing-eyebrow-dark">Security Scanner</p>
                <h2 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                  {tScanner("title")}
                </h2>
                <p className="mt-2 text-sm text-slate-600 sm:text-base">{tScanner("subtitle")}</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                {quickCheckTrustLabel}
              </div>
            </div>

            <form
              onSubmit={handleStartScan}
              className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_auto]"
            >
              <input
                id="scanner-target-url"
                value={targetUrl}
                onChange={(e) => {
                  setTargetUrl(e.target.value);
                  if (urlError) {
                    setUrlError("");
                  }
                }}
                placeholder={tScanner("placeholder")}
                className="h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
              />
              <button
                type="submit"
                className="h-11 rounded-lg bg-cyan-500 px-5 text-sm font-extrabold text-slate-950 transition-colors hover:bg-cyan-400"
              >
                {tScanner("cta")}
              </button>
            </form>

            {urlError && (
              <p className="mt-3 text-sm font-medium text-rose-600">{urlError}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              {scannerPills.map((pill) => (
                <span key={pill} className="landing-chip">
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div ref={statsRef} className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-4 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <div key={index} className="landing-card p-5 text-center">
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
          <div className="landing-card mx-auto mt-8 max-w-5xl p-5 sm:p-8">{children}</div>
        )}
      </div>
    </section>
  );
}
