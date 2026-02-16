"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Phone, CheckCircle, Loader2 } from "lucide-react";
import { motion, useInView } from "motion/react";

export function CTABookingSection() {
  const t = useTranslations("landing.booking");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [size, setSize] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          company,
          source: "booking-form",
          metadata: { firstName, lastName, phone, size },
        }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  const inputClasses =
    "w-full rounded-xl border border-slate-700/50 bg-slate-900/80 px-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 focus:shadow-[0_0_12px_rgba(34,211,238,0.1)] transition-all duration-300";

  return (
    <section
      className="relative overflow-hidden bg-slate-950 py-20 sm:py-28 scan-lines"
      id="booking"
    >
      {/* Ambient glow orbs */}
      <div className="absolute -right-40 top-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/[0.06] blur-[120px]" />
      <div className="absolute -left-40 bottom-1/4 h-[400px] w-[400px] rounded-full bg-cyan-500/[0.04] blur-[100px]" />
      <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.03] blur-[80px]" />

      {/* Dot grid background */}
      <div className="absolute inset-0 dot-grid opacity-30" />

      <div className="container relative z-10 mx-auto px-4" ref={sectionRef}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center mb-12"
        >
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            <span className="text-gradient-cyan">{t("title")}</span>
          </h2>
          <p className="mt-4 text-lg text-slate-400 leading-relaxed">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mx-auto max-w-lg"
        >
          <div className="animated-border rounded-2xl glow-cyan">
            {/* Inner shimmer effect */}
            <div className="absolute inset-0 rounded-2xl shimmer pointer-events-none" />

            <div className="relative rounded-2xl p-8 sm:p-10">
              {/* Form title with icon */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 }}
                className="mb-8 flex items-center justify-center gap-3"
              >
                <div className="relative flex h-8 w-8 items-center justify-center">
                  <Phone className="h-5 w-5 text-cyan-400" />
                  <div
                    className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping"
                    style={{ animationDuration: "3s" }}
                  />
                </div>
                <h3 className="text-lg font-semibold text-white tracking-wide">
                  {t("formTitle")}
                </h3>
              </motion.div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="flex flex-col items-center gap-5 py-10"
                >
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 glow-emerald">
                    <CheckCircle className="h-10 w-10 text-emerald-400" />
                    <div
                      className="absolute inset-0 rounded-full border border-emerald-500/30 animate-ping"
                      style={{ animationDuration: "2s" }}
                    />
                  </div>
                  <p className="text-xl font-bold text-gradient-emerald">
                    {t("success")}
                  </p>
                  <p className="text-sm text-slate-400 text-center">
                    {t("successHint")}
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <motion.div
                      initial={{ opacity: 0, x: -15 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.45 }}
                    >
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder={t("firstName")}
                        required
                        className={inputClasses}
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 15 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.5 }}
                    >
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder={t("lastName")}
                        required
                        className={inputClasses}
                      />
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.55 }}
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("email")}
                      required
                      className={inputClasses}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.6 }}
                  >
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder={t("company")}
                      className={inputClasses}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.65 }}
                  >
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t("phone")}
                      className={inputClasses}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.7 }}
                  >
                    <select
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      className={inputClasses}
                    >
                      <option value="">{t("sizePlaceholder")}</option>
                      <option value="1-49">1-49 {t("employees")}</option>
                      <option value="50-249">50-249 {t("employees")}</option>
                      <option value="250-999">250-999 {t("employees")}</option>
                      <option value="1000+">1.000+ {t("employees")}</option>
                    </select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.75 }}
                  >
                    <button
                      type="submit"
                      disabled={submitting || !email || !firstName}
                      className="w-full rounded-xl bg-cyan-500 py-4 text-sm font-bold text-slate-950 transition-all duration-300 hover:bg-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.35)] shadow-[0_0_20px_rgba(34,211,238,0.2)] disabled:opacity-40 disabled:hover:shadow-none disabled:hover:bg-cyan-500"
                    >
                      {submitting ? (
                        <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                      ) : (
                        t("submit")
                      )}
                    </button>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ delay: 0.85 }}
                    className="text-center text-xs text-slate-600 pt-1"
                  >
                    {t("noCommitment")}
                  </motion.p>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
