"use client";

import { useTranslations } from "next-intl";
import { Shield } from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-600">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2 text-slate-900">
              <Shield className="h-5 w-5 text-cyan-600" />
              <span className="font-semibold">NIS2 Compliance</span>
            </div>
            <p className="text-sm leading-relaxed">
              {t("description")}
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-900">{t("services.title")}</h4>
            <ul className="space-y-2 text-sm">
              <li className="cursor-pointer transition-colors hover:text-slate-900">{t("services.nis2")}</li>
              <li className="cursor-pointer transition-colors hover:text-slate-900">{t("services.gdpr")}</li>
              <li className="cursor-pointer transition-colors hover:text-slate-900">{t("services.aiAct")}</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-900">{t("company.title")}</h4>
            <ul className="space-y-2 text-sm">
              <li className="cursor-pointer transition-colors hover:text-slate-900">{t("company.about")}</li>
              <li className="cursor-pointer transition-colors hover:text-slate-900">{t("company.team")}</li>
              <li className="cursor-pointer transition-colors hover:text-slate-900">{t("company.contact")}</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-900">{t("legal.title")}</h4>
            <ul className="space-y-2 text-sm">
              <li className="cursor-pointer transition-colors hover:text-slate-900">{t("legal.imprint")}</li>
              <li className="cursor-pointer transition-colors hover:text-slate-900">{t("legal.privacy")}</li>
              <li className="cursor-pointer transition-colors hover:text-slate-900">{t("legal.terms")}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Tyrnon Compliance GmbH. {t("rights")}
        </div>
      </div>
    </footer>
  );
}
