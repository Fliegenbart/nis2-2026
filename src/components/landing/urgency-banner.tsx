"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { X, AlertTriangle } from "lucide-react";

export function UrgencyBanner() {
  const [dismissed, setDismissed] = useState(false);
  const t = useTranslations("landing.urgencyBanner");

  if (dismissed) return null;

  return (
    <div className="relative bg-rose-600 text-white">
      <div className="container mx-auto flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium">
        <AlertTriangle className="h-4 w-4 shrink-0 animate-pulse" />
        <span className="text-center">
          <span className="hidden sm:inline">{t("text")}</span>
          <span className="sm:hidden">{t("textShort")}</span>
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-rose-700 transition-colors"
        aria-label="close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
