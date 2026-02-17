"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Activity } from "lucide-react";
import { motion, useInView } from "motion/react";

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
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerVisible, setTickerVisible] = useState(true);

  const tickerMessages = locale === "de" ? TICKER_MESSAGES_DE : TICKER_MESSAGES_EN;

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

  const scanned = useCountUp(1247, 1500, isInView);
  const atRisk = useCountUp(873, 1500, isInView);
  const secured = useCountUp(89, 1500, isInView);

  const statCards = [
    {
      value: scanned.toLocaleString("de-DE") + "+",
      label: t("scanned"),
      gradient: "text-gradient-cyan",
      glowClass: "border-glow-cyan",
      delay: 0,
    },
    {
      value: atRisk.toLocaleString("de-DE"),
      label: t("atRisk"),
      gradient: "text-gradient-rose",
      glowClass: "border-glow-rose",
      delay: 0.1,
    },
    {
      value: secured.toLocaleString("de-DE"),
      label: t("secured"),
      gradient: "text-gradient-emerald",
      glowClass: "glow-emerald",
      delay: 0.2,
    },
  ];

  return (
    <div
      ref={ref}
      className="relative bg-slate-950 py-12 overflow-hidden"
    >
      {/* Background textures */}
      <div className="absolute inset-0 dot-grid opacity-40" />
      <div className="absolute inset-0 scan-lines" />
      {/* Top/bottom edge glow lines */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent" />

      <div className="relative z-10 container mx-auto px-4">
        {/* Stat cards */}
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: stat.delay,
                ease: "easeOut",
              }}
              className="w-full sm:w-auto"
            >
              <div
                className={`glass-card rounded-xl px-8 py-5 text-center ${stat.glowClass} transition-all duration-300 hover:scale-105`}
              >
                <motion.div
                  className={`text-4xl font-bold tracking-tight ${stat.gradient}`}
                  initial={{ scale: 0.8 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{
                    duration: 0.4,
                    delay: stat.delay + 0.2,
                    ease: "easeOut",
                  }}
                >
                  {stat.value}
                </motion.div>
                <div className="mt-1 text-sm text-slate-400 tracking-wide uppercase">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Ticker section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 flex items-center justify-center gap-3 text-sm"
        >
          {/* LIVE indicator with glowing dot */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            </span>
            <Activity className="h-3.5 w-3.5 text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.5)]" />
            <span className="font-semibold text-emerald-400 tracking-widest text-xs uppercase drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]">
              LIVE
            </span>
          </div>

          {/* Separator */}
          <div className="h-4 w-px bg-slate-700/60" />

          {/* Ticker message with fade */}
          <span
            className={`text-slate-500 transition-all duration-500 ${
              tickerVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-1"
            }`}
          >
            {tickerMessages[tickerIndex]}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
