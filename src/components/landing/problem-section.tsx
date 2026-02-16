"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Calendar, Clock, Users, CheckCircle } from "lucide-react";
import { motion, useInView } from "motion/react";

const PROBLEM_CARDS = [
  { icon: Calendar, key: "deadline" as const },
  { icon: Clock, key: "complex" as const },
  { icon: Users, key: "resources" as const },
];

const AFFECTED_CRITERIA = [
  "cloud",
  "datacenter",
  "marketplace",
  "critical",
  "finance",
  "digital",
] as const;

export function ProblemSection() {
  const t = useTranslations("landing.problem");
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const affectedRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const cardsInView = useInView(cardsRef, { once: true, margin: "-50px" });
  const affectedInView = useInView(affectedRef, { once: true, margin: "-50px" });

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-slate-950 py-16 sm:py-24 scan-lines"
    >
      {/* Ambient glow orbs */}
      <div className="absolute -left-32 top-20 h-[400px] w-[400px] rounded-full bg-rose-500/[0.06] blur-[120px]" />
      <div className="absolute -right-32 bottom-20 h-[350px] w-[350px] rounded-full bg-cyan-500/[0.05] blur-[100px]" />

      {/* Dot grid background */}
      <div className="absolute inset-0 dot-grid opacity-40" />

      <div className="container relative z-10 mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center mb-14"
        >
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            <span className="text-gradient-rose">{t("title")}</span>
          </h2>
          <p className="mt-4 text-lg text-slate-400 leading-relaxed">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Problem cards */}
        <div ref={cardsRef} className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
          {PROBLEM_CARDS.map(({ icon: Icon, key }, index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={cardsInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{
                duration: 0.5,
                delay: index * 0.15,
                ease: "easeOut",
              }}
            >
              <div className="glass-card rounded-2xl border border-rose-500/20 p-6 glow-rose transition-all duration-300 hover:border-rose-500/40 hover:shadow-[0_0_30px_rgba(251,113,133,0.15)] group">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 group-hover:bg-rose-500/15 transition-colors">
                  <Icon className="h-6 w-6 text-rose-400" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">
                  {t(`${key}.title`)}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {t(`${key}.description`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Affected criteria section */}
        <motion.div
          ref={affectedRef}
          initial={{ opacity: 0, y: 40 }}
          animate={affectedInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-14 max-w-3xl"
        >
          <div className="glass-card rounded-2xl border border-cyan-500/20 p-6 sm:p-8 glow-cyan">
            <div className="mb-1 flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400/70">
                Threat Assessment
              </span>
            </div>
            <h3 className="mb-5 text-lg font-bold text-white">
              {t("affected.title")}
            </h3>

            <ul className="mb-7 space-y-3">
              {AFFECTED_CRITERIA.map((key, index) => (
                <motion.li
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={affectedInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + index * 0.08 }}
                  className="flex items-start gap-3 text-sm text-slate-300"
                >
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <span>{t(`affected.${key}`)}</span>
                </motion.li>
              ))}
            </ul>

            {/* Glowing stat badges */}
            <div className="flex flex-wrap gap-3">
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={affectedInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                className="inline-flex items-center rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-bold text-rose-300 shadow-[0_0_15px_rgba(251,113,133,0.15),inset_0_0_15px_rgba(251,113,133,0.05)]"
              >
                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                ~30.000+ {t("stats.affected")}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={affectedInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
                className="inline-flex items-center rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-bold text-rose-300 shadow-[0_0_15px_rgba(251,113,133,0.15),inset_0_0_15px_rgba(251,113,133,0.05)]"
              >
                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                &euro;10M {t("stats.maxFine")}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={affectedInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 1.0, type: "spring", stiffness: 200 }}
                className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.15),inset_0_0_15px_rgba(34,211,238,0.05)]"
              >
                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                24h {t("stats.reporting")}
              </motion.span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
