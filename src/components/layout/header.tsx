"use client";

import { useTranslations } from "next-intl";
import { Shield } from "lucide-react";
import { LanguageSwitcher } from "./language-switcher";
import Link from "next/link";
import { useLocale } from "next-intl";

export function Header() {
  const t = useTranslations("common");
  const locale = useLocale();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-indigo-600" />
          <span className="text-lg font-bold text-slate-900">
            {t("appName")}
          </span>
        </Link>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
