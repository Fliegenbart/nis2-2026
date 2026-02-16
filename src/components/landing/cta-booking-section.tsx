"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Calendar, CheckCircle, Loader2 } from "lucide-react";

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
    "w-full rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-colors";

  return (
    <section className="bg-slate-950 py-32 sm:py-40" id="booking">
      <div className="mx-auto max-w-xl px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-slate-400 leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
          {/* Calendar icon + form title */}
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800">
              <Calendar className="h-4 w-4 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              {t("formTitle")}
            </h3>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-10">
              <CheckCircle className="h-10 w-10 text-emerald-400" />
              <p className="text-xl font-bold text-white">{t("success")}</p>
              <p className="text-sm text-slate-400 text-center">
                {t("successHint")}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t("firstName")}
                  required
                  className={inputClasses}
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t("lastName")}
                  required
                  className={inputClasses}
                />
              </div>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("email")}
                required
                className={inputClasses}
              />

              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder={t("company")}
                className={inputClasses}
              />

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("phone")}
                className={inputClasses}
              />

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

              <button
                type="submit"
                disabled={submitting || !email || !firstName}
                className="w-full rounded-xl bg-cyan-500 py-4 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500"
              >
                {submitting ? (
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                ) : (
                  t("submit")
                )}
              </button>

              <p className="text-center text-xs text-slate-600 pt-1">
                {t("noCommitment")}
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
