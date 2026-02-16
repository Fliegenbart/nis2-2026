"use client";

import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("common");

  return (
    <footer className="border-t bg-slate-50">
      <div className="container mx-auto flex flex-col items-center gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:justify-between">
        <p>&copy; {new Date().getFullYear()} {t("appName")}</p>
        <div className="flex gap-4">
          <span className="hover:text-slate-700 cursor-pointer">{t("imprint")}</span>
          <span className="hover:text-slate-700 cursor-pointer">{t("privacy")}</span>
          <span className="hover:text-slate-700 cursor-pointer">{t("terms")}</span>
        </div>
      </div>
    </footer>
  );
}
