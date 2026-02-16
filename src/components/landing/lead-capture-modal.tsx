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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
          categoryId: questionId.split("-")[0] === "rm" ? "risk-management" :
                      questionId.split("-")[0] === "ih" ? "incident-handling" :
                      questionId.split("-")[0] === "au" ? "authentication" :
                      questionId.split("-")[0] === "bc" ? "business-continuity" :
                      "cryptography",
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
            <Mail className="h-6 w-6 text-indigo-600" />
          </div>
          <DialogTitle className="text-center">{t("title")}</DialogTitle>
          <DialogDescription className="text-center">
            {t("subtitle")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lead-email">{t("email")}</Label>
            <Input
              id="lead-email"
              type="email"
              required
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead-company">{t("company")}</Label>
            <Input
              id="lead-company"
              type="text"
              placeholder={t("companyPlaceholder")}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="lead-consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 rounded border-slate-300"
              required
            />
            <Label htmlFor="lead-consent" className="text-sm text-slate-600 font-normal">
              {t("consent")}
            </Label>
          </div>

          {error && (
            <p className="text-sm text-rose-600">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500"
            disabled={!consent || !email || isSubmitting}
          >
            {isSubmitting ? t("submitting") : t("submit")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
