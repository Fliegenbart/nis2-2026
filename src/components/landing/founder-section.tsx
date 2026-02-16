"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useInView } from "motion/react";

export function FounderSection() {
  const t = useTranslations("landing.founder");
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-60px" });

  const storyParagraphs = [
    { key: "story1" as const, style: "normal" },
    { key: "story2" as const, style: "normal" },
    { key: "story3" as const, style: "quote" },
    { key: "story4" as const, style: "normal" },
    { key: "mission" as const, style: "mission" },
  ];

  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 sm:py-28">
      {/* Ambient glow orbs */}
      <div className="absolute -left-32 top-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/[0.04] blur-[100px]" />
      <div className="absolute -right-32 bottom-1/4 h-[350px] w-[350px] rounded-full bg-cyan-500/[0.03] blur-[80px]" />

      {/* Dot grid background overlay */}
      <div className="absolute inset-0 dot-grid opacity-20" />

      <div ref={sectionRef} className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="mb-10 text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5 text-xs font-mono uppercase tracking-widest text-cyan-400 mb-6">
              Origin Story
            </span>
          </motion.div>

          {/* Main glass card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="glass-card rounded-2xl p-8 sm:p-10 glow-cyan"
          >
            {/* Avatar row */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-5 mb-8"
            >
              {/* Animated avatar with cyan ring */}
              <div className="relative">
                <motion.div
                  animate={isInView ? { rotate: 360 } : {}}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute -inset-1 rounded-full"
                  style={{
                    background:
                      "conic-gradient(from 0deg, rgba(34,211,238,0.5), rgba(34,211,238,0.05), rgba(34,211,238,0.3), rgba(34,211,238,0.05), rgba(34,211,238,0.5))",
                  }}
                />
                <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xl font-bold text-cyan-400 ring-2 ring-cyan-500/30">
                  JB
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {t("title")}
                </h3>
                <p className="text-sm text-cyan-400/70 font-mono tracking-wide">
                  {t("name")}
                </p>
              </div>
            </motion.div>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-8 h-px bg-gradient-to-r from-cyan-500/30 via-cyan-500/10 to-transparent"
            />

            {/* Story paragraphs - staggered reveals */}
            <div className="space-y-6">
              {storyParagraphs.map(({ key, style }, i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.5,
                    delay: 0.5 + i * 0.12,
                    ease: "easeOut",
                  }}
                >
                  {style === "quote" ? (
                    <div className="relative rounded-xl border border-cyan-500/15 bg-cyan-500/[0.03] px-6 py-5">
                      {/* Quote accent bar */}
                      <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-gradient-to-b from-cyan-400 to-cyan-400/20" />
                      <p className="text-lg font-semibold text-white leading-relaxed italic pl-2">
                        &ldquo;{t(key)}&rdquo;
                      </p>
                    </div>
                  ) : style === "mission" ? (
                    <div className="relative mt-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] px-6 py-5">
                      <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-400/20" />
                      <p className="text-lg font-bold text-gradient-emerald leading-relaxed pl-2">
                        {t(key)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-300 leading-relaxed text-[15px]">
                      {t(key)}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Bottom ambient line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 1.2 }}
            className="mx-auto mt-12 h-px w-1/3 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"
          />
        </div>
      </div>
    </section>
  );
}
