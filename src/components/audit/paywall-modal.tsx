"use client";

import { useTranslations, useLocale } from "next-intl";
import { Lock, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
}

export function PaywallModal({
  isOpen,
  onClose,
  categoryName,
}: PaywallModalProps) {
  const t = useTranslations("paywall");
  const locale = useLocale();

  const benefits = [
    t("benefit1"),
    t("benefit2"),
    t("benefit3"),
    t("benefit4"),
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-slate-700/50 bg-slate-900 text-white sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10">
            <Lock className="h-6 w-6 text-cyan-400" />
          </div>
          <DialogTitle className="text-center text-white">{t("title")}</DialogTitle>
          <DialogDescription className="text-center text-slate-400">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 space-y-3">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
              <span className="text-sm text-slate-300">{benefit}</span>
            </div>
          ))}
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <a
            href="mailto:kontakt@nis2-audit.de"
            className="inline-flex w-full items-center justify-center rounded-md bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-400"
          >
            {t("cta")}
          </a>
          <a
            href={`/${locale}/dashboard`}
            onClick={onClose}
            className="inline-flex w-full items-center justify-center rounded-md border border-slate-700 px-4 py-2 text-sm text-slate-400 transition-colors hover:border-slate-600 hover:text-white"
          >
            {t("back")}
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
