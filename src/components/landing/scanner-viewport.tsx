"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Activity, Radar, Shield } from "lucide-react";
import { motion, useInView, AnimatePresence } from "motion/react";

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
// Ticker messages
// ---------------------------------------------------------------------------
const TICKER_MESSAGES_DE = [
  "Thomas W. von CloudServices hat gerade seinen Report heruntergeladen",
  "Sarah M. von TechStart hat den Quick-Check abgeschlossen",
  "DataCenter Pro GmbH hat ihr Audit gestartet",
  "Michael K. von SecureNet hat seinen Compliance-Score verbessert",
  "Anna B. von InfraTech hat kritische Schwachstellen behoben",
  "NetGuard Solutions hat das Full-Audit freigeschaltet",
];

const TICKER_MESSAGES_EN = [
  "Thomas W. from CloudServices just downloaded his report",
  "Sarah M. from TechStart completed the Quick Check",
  "DataCenter Pro GmbH started their audit",
  "Michael K. from SecureNet improved his compliance score",
  "Anna B. from InfraTech resolved critical vulnerabilities",
  "NetGuard Solutions unlocked the full audit",
];

// ---------------------------------------------------------------------------
// Radar sweep SVG animation
// ---------------------------------------------------------------------------
function RadarSweep() {
  return (
    <div className="relative mx-auto mb-6 h-32 w-32">
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border border-cyan-500/20" />
      {/* Middle ring */}
      <div className="absolute inset-3 rounded-full border border-cyan-500/15" />
      {/* Inner ring */}
      <div className="absolute inset-6 rounded-full border border-cyan-500/10" />
      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
        </div>
      </div>
      {/* Radar sweep line */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 128 128"
      >
        <defs>
          <linearGradient id="sweepGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(34,211,238,0)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0.6)" />
          </linearGradient>
        </defs>
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          style={{ originX: "50%", originY: "50%" }}
        >
          {/* Sweep cone */}
          <path
            d="M64,64 L64,4 A60,60 0 0,1 104,20 Z"
            fill="url(#sweepGradient)"
            opacity="0.3"
          />
          {/* Sweep line */}
          <line
            x1="64"
            y1="64"
            x2="64"
            y2="4"
            stroke="rgba(34,211,238,0.7)"
            strokeWidth="1.5"
          />
        </motion.g>
      </svg>
      {/* Random blips on the radar */}
      <motion.div
        className="absolute h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]"
        style={{ top: "25%", left: "60%" }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
      />
      <motion.div
        className="absolute h-1 w-1 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.8)]"
        style={{ top: "45%", left: "75%" }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: 2 }}
      />
      <motion.div
        className="absolute h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
        style={{ top: "35%", left: "30%" }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: 3 }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pulsing connector dots between stat cards
// ---------------------------------------------------------------------------
function PulsingConnector({ color }: { color: "cyan" | "rose" | "emerald" }) {
  const colors = {
    cyan: "bg-cyan-500/40 shadow-[0_0_6px_rgba(34,211,238,0.4)]",
    rose: "bg-rose-500/40 shadow-[0_0_6px_rgba(251,113,133,0.4)]",
    emerald: "bg-emerald-500/40 shadow-[0_0_6px_rgba(52,211,153,0.4)]",
  };

  return (
    <div className="flex items-center justify-center gap-1.5 py-1">
      {[0, 0.2, 0.4].map((delay, i) => (
        <motion.div
          key={i}
          className={`h-1 w-1 rounded-full ${colors[color]}`}
          animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
interface ScannerViewportProps {
  locale: string;
  children?: React.ReactNode; // QuickCheck or QuickCheckResults
}

export function ScannerViewport({ locale, children }: ScannerViewportProps) {
  const t = useTranslations("landing.socialProof");
  const sectionRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(statsRef, { once: true, amount: 0.3 });
  const [isVisible, setIsVisible] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerVisible, setTickerVisible] = useState(true);

  const hasChildren = !!children;
  const tickerMessages =
    locale === "de" ? TICKER_MESSAGES_DE : TICKER_MESSAGES_EN;

  const sectionTitle =
    locale === "de"
      ? "Echtzeit-Bedrohungsanalyse"
      : "Real-Time Threat Analysis";

  // Sync motion useInView with the countUp trigger
  useEffect(() => {
    if (isInView) setIsVisible(true);
  }, [isInView]);

  // Ticker rotation
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

  // Count-up values
  const scanned = useCountUp(1247, 1500, isVisible);
  const atRisk = useCountUp(873, 1500, isVisible);
  const secured = useCountUp(89, 1500, isVisible);

  const statCards = [
    {
      value: scanned.toLocaleString("de-DE") + "+",
      label: t("scanned"),
      gradient: "text-gradient-cyan",
      glowClass: "border-glow-cyan",
      colorKey: "cyan" as const,
      iconColor: "text-cyan-400",
      ringColor: "border-cyan-500/20",
      bgAccent: "bg-cyan-500/5",
      delay: 0,
    },
    {
      value: atRisk.toLocaleString("de-DE"),
      label: t("atRisk"),
      gradient: "text-gradient-rose",
      glowClass: "border-glow-rose",
      colorKey: "rose" as const,
      iconColor: "text-rose-400",
      ringColor: "border-rose-500/20",
      bgAccent: "bg-rose-500/5",
      delay: 0.15,
    },
    {
      value: secured.toLocaleString("de-DE"),
      label: t("secured"),
      gradient: "text-gradient-emerald",
      glowClass: "glow-emerald",
      colorKey: "emerald" as const,
      iconColor: "text-emerald-400",
      ringColor: "border-emerald-500/20",
      bgAccent: "bg-emerald-500/5",
      delay: 0.3,
    },
  ];

  // -------------------------------------------------------------------------
  // Render stat cards -- stacked vertically when beside children,
  // horizontal row when centered (no children)
  // -------------------------------------------------------------------------
  function renderStatCards(vertical: boolean) {
    return statCards.map((stat, index) => (
      <div key={index}>
        <motion.div
          initial={
            vertical
              ? { opacity: 0, x: 40 }
              : { opacity: 0, y: 24 }
          }
          animate={
            isInView
              ? { opacity: 1, x: 0, y: 0 }
              : {}
          }
          transition={{
            duration: 0.5,
            delay: stat.delay,
            ease: "easeOut",
          }}
        >
          <div
            className={`glass-card rounded-xl ${
              vertical ? "px-5 py-4" : "px-8 py-5"
            } text-center ${stat.glowClass} transition-all duration-300 hover:scale-105 relative overflow-hidden group`}
          >
            {/* Shimmer on hover */}
            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Corner accent lines */}
            <div className="absolute top-0 left-0 h-4 w-px bg-gradient-to-b from-current to-transparent opacity-30" />
            <div className="absolute top-0 left-0 h-px w-4 bg-gradient-to-r from-current to-transparent opacity-30" />
            <div className="absolute bottom-0 right-0 h-4 w-px bg-gradient-to-t from-current to-transparent opacity-30" />
            <div className="absolute bottom-0 right-0 h-px w-4 bg-gradient-to-l from-current to-transparent opacity-30" />

            <div className="relative z-10">
              <motion.div
                className={`${
                  vertical ? "text-3xl" : "text-4xl"
                } font-bold tracking-tight font-mono ${stat.gradient}`}
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
          </div>
        </motion.div>

        {/* Pulsing connector between cards (not after last) */}
        {vertical && index < statCards.length - 1 && (
          <PulsingConnector
            color={statCards[index + 1].colorKey}
          />
        )}
      </div>
    ));
  }

  // -------------------------------------------------------------------------
  // Live ticker
  // -------------------------------------------------------------------------
  function renderTicker() {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-5 rounded-lg border border-slate-800/60 bg-slate-900/40 px-4 py-3"
      >
        <div className="flex items-center gap-2.5 text-sm">
          {/* LIVE indicator */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            </span>
            <Activity className="h-3 w-3 text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.5)]" />
            <span className="font-semibold text-emerald-400 tracking-widest text-[10px] uppercase drop-shadow-[0_0_6px_rgba(52,211,153,0.4)]">
              LIVE
            </span>
          </div>

          {/* Separator */}
          <div className="h-4 w-px bg-slate-700/60 shrink-0" />

          {/* Ticker message with slide-up/fade */}
          <div className="overflow-hidden min-h-[1.25rem] flex-1">
            <AnimatePresence mode="wait">
              <motion.span
                key={tickerIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="block text-xs text-slate-500 truncate"
              >
                {tickerMessages[tickerIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  }

  // -------------------------------------------------------------------------
  // Stats panel (used in the right column or centered)
  // -------------------------------------------------------------------------
  function renderStatsPanel(vertical: boolean) {
    return (
      <div ref={statsRef}>
        {vertical && <RadarSweep />}

        {/* Stats status line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-4 flex items-center gap-2"
        >
          <div className="relative flex h-5 w-5 items-center justify-center">
            <Radar className="h-4 w-4 text-cyan-400" />
            <motion.div
              className="absolute inset-0 rounded-full border border-cyan-400/30"
              animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400/70">
            {locale === "de"
              ? "Bedrohungsmonitor aktiv"
              : "Threat monitor active"}
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/20 to-transparent" />
        </motion.div>

        {vertical ? (
          /* Stacked vertically for the side panel */
          <div className="space-y-0">{renderStatCards(true)}</div>
        ) : (
          /* Horizontal row for centered layout */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {renderStatCards(false)}
          </div>
        )}

        {renderTicker()}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Full render
  // -------------------------------------------------------------------------
  return (
    <section
      ref={sectionRef}
      className="relative bg-slate-950 overflow-hidden scan-lines"
      id="scanner-viewport"
    >
      {/* Background textures */}
      <div className="absolute inset-0 dot-grid opacity-40" />

      {/* Ambient glow orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 -left-20 h-80 w-80 rounded-full bg-cyan-500/[0.06] blur-[120px]" />
        <div className="absolute bottom-1/3 right-0 h-64 w-64 rounded-full bg-rose-500/[0.05] blur-[100px]" />
        <motion.div
          className="absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/[0.04] blur-[80px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.07, 0.04] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Top / bottom edge glow lines */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent" />

      <div className="relative z-10 container mx-auto px-4 py-16 sm:py-20">
        {/* Section title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          {/* Classification badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5"
          >
            <Shield className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-cyan-300">
              {locale === "de"
                ? "Klassifiziert // Echtzeit-Feed"
                : "Classified // Real-Time Feed"}
            </span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-gradient-cyan tracking-tight">
            {sectionTitle}
          </h2>

          {/* Decorative underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mx-auto mt-3 h-px w-48 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"
          />
        </motion.div>

        {/* Main layout */}
        <AnimatePresence mode="wait">
          {hasChildren ? (
            /* ----- Two-column layout: children + stats ----- */
            <motion.div
              key="split-layout"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start"
            >
              {/* Left column: QuickCheck / Results (3 cols) */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="lg:col-span-3"
              >
                {children}
              </motion.div>

              {/* Right column: Stats panel (2 cols) */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                className="lg:col-span-2"
              >
                <div className="lg:sticky lg:top-24">
                  {/* Panel header bar */}
                  <div className="mb-4 flex items-center gap-2 rounded-t-lg border border-slate-800/40 bg-slate-900/50 px-4 py-2">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-rose-500/60" />
                      <span className="h-2 w-2 rounded-full bg-amber-500/60" />
                      <span className="h-2 w-2 rounded-full bg-emerald-500/60" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 ml-2">
                      threat_monitor.sys
                    </span>
                    <div className="flex-1" />
                    <motion.div
                      className="h-1.5 w-1.5 rounded-full bg-cyan-400"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </div>

                  <div className="rounded-b-xl border border-t-0 border-slate-800/40 bg-slate-950/60 p-5">
                    {renderStatsPanel(true)}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            /* ----- Centered layout: stats only ----- */
            <motion.div
              key="centered-layout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-4xl"
            >
              {/* Centered radar */}
              <RadarSweep />

              {renderStatsPanel(false)}

              {/* Call-to-action prompt */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="mt-10 text-center"
              >
                <div className="inline-flex items-center gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-6 py-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Radar className="h-4 w-4 text-cyan-400" />
                  </motion.div>
                  <span className="text-sm text-cyan-300/80 font-medium">
                    {locale === "de"
                      ? "Starten Sie den Quick-Check und sehen Sie Ihren Status in Echtzeit"
                      : "Start the Quick Check and see your status in real time"}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
