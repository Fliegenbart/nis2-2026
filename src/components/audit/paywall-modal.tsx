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
import { Button } from "@/components/ui/button";

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
            <Lock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <DialogTitle className="text-center">{t("title")}</DialogTitle>
          <DialogDescription className="text-center">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 space-y-3">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
              <span className="text-sm">{benefit}</span>
            </div>
          ))}
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <Button
            className="w-full"
            asChild
          >
            <a href="mailto:kontakt@nis2-audit.de">
              {t("cta")}
            </a>
          </Button>
          <Button
            variant="outline"
            className="w-full"
            asChild
          >
            <a href={`/${locale}/dashboard`} onClick={onClose}>
              {t("back")}
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
