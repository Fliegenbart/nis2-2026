"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Activity } from "lucide-react";

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

const TICKER_MESSAGES_DE = [
  "Thomas W. von CloudServices hat gerade seinen Report heruntergeladen",
  "Sarah M. von TechStart hat den Quick-Check abgeschlossen",
  "DataCenter Pro GmbH hat ihr Audit gestartet",
  "Michael K. von SecureNet hat seinen Compliance-Score verbessert",
];

const TICKER_MESSAGES_EN = [
  "Thomas W. from CloudServices just downloaded his report",
  "Sarah M. from TechStart completed the Quick Check",
  "DataCenter Pro GmbH started their audit",
  "Michael K. from SecureNet improved his compliance score",
];

export function SocialProofStats({ locale }: { locale: string }) {
  const t = useTranslations("landing.socialProof");
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerVisible, setTickerVisible] = useState(true);

  const tickerMessages = locale === "de" ? TICKER_MESSAGES_DE : TICKER_MESSAGES_EN;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerVisible(false);
      setTimeout(() => {
        setTickerIndex((i) => (i + 1) % tickerMessages.length);
        setTickerVisible(true);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, [tickerMessages.length]);

  const scanned = useCountUp(1247, 1500, isVisible);
  const atRisk = useCountUp(873, 1500, isVisible);
  const secured = useCountUp(89, 1500, isVisible);

  return (
    <div ref={ref} className="bg-slate-900 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{scanned.toLocaleString("de-DE")}+</div>
            <div className="text-sm text-slate-400">{t("scanned")}</div>
          </div>
          <div className="hidden sm:block h-8 w-px bg-slate-700" />
          <div className="text-center">
            <div className="text-3xl font-bold text-rose-400">{atRisk.toLocaleString("de-DE")}</div>
            <div className="text-sm text-slate-400">{t("atRisk")}</div>
          </div>
          <div className="hidden sm:block h-8 w-px bg-slate-700" />
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">{secured.toLocaleString("de-DE")}</div>
            <div className="text-sm text-slate-400">{t("secured")}</div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
          <Activity className="h-3 w-3 text-emerald-500 animate-pulse" />
          <span className="text-emerald-500 font-medium">LIVE</span>
          <span
            className={`transition-opacity duration-500 ${tickerVisible ? "opacity-100" : "opacity-0"}`}
          >
            {tickerMessages[tickerIndex]}
          </span>
        </div>
      </div>
    </div>
  );
}
