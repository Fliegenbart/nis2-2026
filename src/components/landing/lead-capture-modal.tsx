"use client";

import { useState } from "react";
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
}

export function LeadCaptureModal({
  open,
  onOpenChange,
  quickCheckAnswers,
}: LeadCaptureModalProps) {
  const t = useTranslations("landing.leadCapture");
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // 1. Create audit
      const auditRes = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, companyName: companyName || undefined }),
      });
      const audit = await auditRes.json();
      if (!auditRes.ok) throw new Error("Failed to create audit");

      // 2. Save quick-check answers
      const answersPayload = Object.entries(quickCheckAnswers).map(
        ([questionId, value]) => ({
          questionId,
          categoryId: getCategoryForQuestion(questionId)?.id ?? "risk-management",
          value,
        })
      );

      await fetch(`/api/audit/${audit.id}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answersPayload }),
      });

      // 3. Create lead
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          companyName: companyName || undefined,
          consent: true,
          auditId: audit.id,
        }),
      });

      // 4. Redirect to dashboard
      router.push(`/${locale}/audit/${audit.id}/dashboard`);
    } catch {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700/50 text-white">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <Mail className="h-6 w-6 text-cyan-400" />
          </div>
          <DialogTitle className="text-center text-white">{t("title")}</DialogTitle>
          <DialogDescription className="text-center text-slate-400">
            {t("subtitle")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="lead-email" className="block text-xs font-medium uppercase tracking-wider text-slate-400">
              {t("email")}
            </label>
            <input
              id="lead-email"
              type="email"
              required
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-700/50 bg-slate-900/80 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="lead-company" className="block text-xs font-medium uppercase tracking-wider text-slate-400">
              {t("company")}
            </label>
            <input
              id="lead-company"
              type="text"
              placeholder={t("companyPlaceholder")}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-700/50 bg-slate-900/80 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-colors"
            />
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="lead-consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/30 focus:ring-offset-slate-900"
              required
            />
            <label htmlFor="lead-consent" className="text-sm text-slate-500 font-normal">
              {t("consent")}
            </label>
          </div>

          {error && (
            <p className="text-sm text-rose-400">{error}</p>
          )}

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-all hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={!consent || !email || isSubmitting}
          >
            {isSubmitting ? t("submitting") : t("submit")}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
