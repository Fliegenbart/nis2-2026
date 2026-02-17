"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCategoryForQuestion } from "@/data/nis2-framework";
import type { AnswerValue } from "@/data/nis2-framework";

interface LeadCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quickCheckAnswers: Record<string, AnswerValue>;
  initialCompanyName?: string;
}

export function LeadCaptureModal({
  open,
  onOpenChange,
  quickCheckAnswers,
  initialCompanyName,
}: LeadCaptureModalProps) {
  const t = useTranslations("landing.leadCapture");
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (!companyName && initialCompanyName) {
      setCompanyName(initialCompanyName);
    }
  }, [open, companyName, initialCompanyName]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // 1. Create audit
      const auditRes = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ locale, companyName: companyName || undefined }),
      });
      if (!auditRes.ok) {
        throw new Error("Audit creation failed");
      }
      const audit = await auditRes.json();

      // 2. Save quick-check answers
      const answersPayload = Object.entries(quickCheckAnswers).map(
        ([questionId, value]) => ({
          questionId,
          categoryId: getCategoryForQuestion(questionId)?.id ?? "risk-management",
          value,
        })
      );

      const answersRes = await fetch(`/api/audit/${audit.id}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ answers: answersPayload }),
      });
      if (!answersRes.ok) {
        throw new Error("Saving answers failed");
      }

      // 3. Create lead
      const leadRes = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          companyName: companyName || undefined,
          consent: true,
          auditId: audit.id,
        }),
      });
      if (!leadRes.ok) {
        throw new Error("Lead creation failed");
      }

      // 4. Redirect to dashboard
      router.push(`/${locale}/audit/${audit.id}/dashboard`);
    } catch (submitError) {
      console.error("Lead capture submit error:", submitError);
      setError(
        locale === "de"
          ? "Scanner konnte nicht abgeschlossen werden. Bitte erneut versuchen."
          : "Scanner could not be completed. Please try again."
      );
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border border-slate-200 bg-white text-slate-900 shadow-[0_32px_70px_-44px_rgba(15,23,42,0.42)]">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-cyan-200 bg-cyan-50">
            <Mail className="h-6 w-6 text-cyan-700" />
          </div>
          <DialogTitle className="text-center text-slate-900">{t("title")}</DialogTitle>
          <DialogDescription className="text-center text-slate-600">
            {t("subtitle")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="lead-email"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              {t("email")}
            </label>
            <input
              id="lead-email"
              type="email"
              required
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="lead-company"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              {t("company")}
            </label>
            <input
              id="lead-company"
              type="text"
              placeholder={t("companyPlaceholder")}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="lead-consent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-200 focus:ring-2 focus:ring-offset-0"
                required
              />
              <label htmlFor="lead-consent" className="text-sm text-slate-600">
                {t("consent")}
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <button
            type="submit"
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-extrabold text-slate-950 transition-all hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!consent || !email || isSubmitting}
          >
            {isSubmitting ? t("submitting") : t("submit")}
          </button>

          <p className="text-center text-xs text-slate-500">
            {locale === "de"
              ? "Kein Spam. Nur Ihr persönlicher Compliance-Report."
              : "No spam. Just your personalized compliance report."}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
