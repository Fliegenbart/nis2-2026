"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Shield, ArrowRight, CheckCircle, AlertTriangle, Search, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface HeroSectionProps {
  onStartQuickCheck: () => void;
}

function ComplianceWidget() {
  const t = useTranslations("landing.complianceWidget");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const categories = [
    { key: "cyberRisk", value: 0 },
    { key: "incidentReporting", value: 0 },
    { key: "securityDocs", value: 0 },
    { key: "supplyChain", value: 0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateY: -5 }}
      animate={mounted ? { opacity: 1, y: 0, rotateY: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
      className="glass-card-rose rounded-2xl p-6 glow-rose animate-float"
    >
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-300">
          {t("title")}
        </h3>
        <div className="relative">
          <Shield className="h-4 w-4 text-rose-400" />
          <div className="absolute inset-0 animate-ping">
            <Shield className="h-4 w-4 text-rose-400 opacity-30" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {categories.map(({ key, value }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -20 }}
            animate={mounted ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.7 + i * 0.1 }}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400">{t(key)}</span>
              <span className="font-mono text-rose-400 tabular-nums">{value}%</span>
            </div>
            <Progress value={value} className="h-1.5 bg-slate-800 [&>div]:bg-rose-500" />
          </motion.div>
        ))}
      </div>

      <div className="mt-5 border-t border-rose-500/10 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400 uppercase tracking-wide">{t("overall")}</span>
          <span className="text-2xl font-bold font-mono text-rose-400">0%</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={mounted ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 1.2 }}
        className="mt-4 flex items-center gap-2 rounded-xl bg-rose-950/60 border border-rose-500/20 px-4 py-2.5"
      >
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-400 animate-pulse" />
        <span className="text-xs font-semibold text-rose-300 tracking-wide">
          {t("critical")}
        </span>
      </motion.div>
    </motion.div>
  );
}

function SecurityScanner({ onStartQuickCheck }: { onStartQuickCheck: () => void }) {
  const t = useTranslations("landing.scanner");
  const [domain, setDomain] = useState("");
  const [scanning, setScanning] = useState(false);

  function handleScan(e: React.FormEvent) {
    e.preventDefault();
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      onStartQuickCheck();
    }, 1500);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="mx-auto mt-12 max-w-xl"
    >
      <div className="animated-border rounded-2xl p-6">
        <div className="mb-3 flex items-center gap-2">
          <div className="relative flex h-6 w-6 items-center justify-center">
            <Shield className="h-4 w-4 text-cyan-400" />
            <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping" style={{ animationDuration: "3s" }} />
          </div>
          <span className="text-sm font-semibold text-white tracking-wide">{t("title")}</span>
        </div>
        <p className="mb-4 text-xs text-slate-400">{t("subtitle")}</p>
        <form onSubmit={handleScan} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder={t("placeholder")}
              className="w-full rounded-xl border border-slate-700/50 bg-slate-900/80 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={scanning}
            className="shrink-0 rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-bold text-slate-950 transition-all hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] disabled:opacity-70"
          >
            {scanning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t("cta")
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

export function HeroSection({ onStartQuickCheck }: HeroSectionProps) {
  const t = useTranslations("landing");

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white scan-lines">
      {/* Ambient glow orbs */}
      <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-cyan-500/[0.07] blur-[120px]" />
      <div className="absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full bg-rose-500/[0.05] blur-[100px]" />
      <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-cyan-500/[0.03] blur-[80px]" />

      {/* Dot grid background */}
      <div className="absolute inset-0 dot-grid opacity-60" />

      <div className="container relative z-10 mx-auto px-4 py-20 sm:py-28 lg:py-32">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-5 py-2.5 text-sm text-cyan-300"
            >
              <Shield className="h-4 w-4" />
              <span className="font-mono text-xs tracking-wider">EU DIRECTIVE 2022/2555</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
            >
              <span className="text-gradient-cyan">{t("hero.title")}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-4 text-xl font-semibold text-gradient-rose sm:text-2xl"
            >
              {t("hero.subtitle")}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-10 max-w-2xl text-lg text-slate-400 lg:mx-0 mx-auto leading-relaxed"
            >
              {t("hero.description")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start sm:justify-center"
            >
              <Button
                size="lg"
                onClick={onStartQuickCheck}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-8 py-6 text-lg font-bold shadow-[0_0_30px_rgba(34,211,238,0.25)] hover:shadow-[0_0_40px_rgba(34,211,238,0.35)] transition-all"
              >
                {t("hero.cta")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-sm text-slate-500"
            >
              {["noRegistration", "gdprCompliant", "instantResult", "freeCheck"].map((key, i) => (
                <motion.span
                  key={key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-3.5 w-3.5 text-cyan-500" />
                  <span className="text-slate-400">{t(`trustSignals.${key}`)}</span>
                </motion.span>
              ))}
            </motion.div>
          </div>

          <div className="lg:col-span-2 hidden lg:block">
            <ComplianceWidget />
          </div>
        </div>

        <SecurityScanner onStartQuickCheck={onStartQuickCheck} />
      </div>
    </section>
  );
}
