"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Calendar, CheckCircle, Loader2, ShieldCheck } from "lucide-react";

export function CTABookingSection() {
  const t = useTranslations("landing.booking");
  const locale = useLocale();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [size, setSize] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const nextSteps =
    locale === "de"
      ? [
          "30-minütiges Erstgespräch mit Compliance-Fokus",
          "NIS2-Risikoprofil und Prioritäten in 48h",
          "Klare Roadmap mit Festpreisoptionen",
        ]
      : [
          "30-minute kickoff call with compliance focus",
          "NIS2 risk profile and priorities within 48h",
          "Clear roadmap with fixed-price options",
        ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          company,
          source: "booking-form",
          metadata: { firstName, lastName, phone, size },
        }),
      });

      if (!response.ok) {
        throw new Error("Lead submission failed");
      }

      setSubmitted(true);
    } catch {
      setSubmitError(
        locale === "de"
          ? "Ihre Anfrage konnte nicht gesendet werden. Bitte erneut versuchen."
          : "Your request could not be sent. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputClasses =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100";

  return (
    <section
      className="landing-section relative overflow-hidden"
      id="booking"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_6%,rgba(34,211,238,0.16),transparent_38%),radial-gradient(circle_at_92%_95%,rgba(16,185,129,0.13),transparent_38%)]" />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="landing-eyebrow">Final Step</p>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-700">{t("subtitle")}</p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="landing-panel p-6 sm:p-8">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50">
              <ShieldCheck className="h-5 w-5 text-cyan-700" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              {locale === "de" ? "Was Sie als Nächstes bekommen" : "What happens next"}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {locale === "de"
                ? "Kein Sales-Blabla, sondern ein belastbarer NIS2-Plan für Ihr Unternehmen."
                : "No sales fluff, just a concrete NIS2 plan for your company."}
            </p>
            <div className="mt-6 space-y-3">
              {nextSteps.map((step) => (
                <div key={step} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <p className="text-sm text-slate-700">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <div className="landing-card p-8">
            <div className="mb-8 flex items-center justify-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50">
                <Calendar className="h-4 w-4 text-cyan-700" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{t("formTitle")}</h3>
            </div>

            {submitted ? (
              <div className="flex flex-col items-center gap-4 py-10">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
                <p className="text-xl font-bold text-slate-900">{t("success")}</p>
                <p className="text-center text-sm text-slate-600">{t("successHint")}</p>
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

                {submitError && <p className="text-sm text-rose-600">{submitError}</p>}

                <button
                  type="submit"
                  disabled={submitting || !email || !firstName || !lastName}
                  className="w-full rounded-xl bg-cyan-500 py-4 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500"
                >
                  {submitting ? (
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  ) : (
                    t("submit")
                  )}
                </button>

                <p className="pt-1 text-center text-xs text-slate-500">{t("noCommitment")}</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
