"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Calculator, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { calculateMaxFine, formatFine, isLikelyAffected } from "@/lib/fine-calculator";

export function LiabilityCalculator() {
  const t = useTranslations("landing.calculator");
  const locale = useLocale();
  const [revenue, setRevenue] = useState<string>("");
  const [employees, setEmployees] = useState<string>("");

  const revenueNum = parseFloat(revenue.replace(/[^0-9]/g, "")) || 0;
  const employeesNum = parseInt(employees.replace(/[^0-9]/g, "")) || 0;
  const maxFine = calculateMaxFine(revenueNum);
  const affected = isLikelyAffected(revenueNum, employeesNum);
  const hasInput = revenueNum > 0 || employeesNum > 0;

  return (
    <section className="py-16 sm:py-20 bg-white" id="calculator">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          <Card className="border-2 border-slate-200 shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                <Calculator className="h-6 w-6 text-rose-600" />
              </div>
              <CardTitle className="text-2xl">{t("title")}</CardTitle>
              <CardDescription>{t("subtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="revenue">{t("revenue")}</Label>
                  <Input
                    id="revenue"
                    type="text"
                    inputMode="numeric"
                    placeholder={t("revenuePlaceholder")}
                    value={revenue}
                    onChange={(e) => setRevenue(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employees">{t("employees")}</Label>
                  <Input
                    id="employees"
                    type="text"
                    inputMode="numeric"
                    placeholder={t("employeesPlaceholder")}
                    value={employees}
                    onChange={(e) => setEmployees(e.target.value)}
                  />
                </div>
              </div>

              {hasInput && (
                <div className="space-y-4 pt-4">
                  <div className="rounded-lg bg-rose-50 border border-rose-200 p-6 text-center">
                    <p className="text-sm font-medium text-rose-600 mb-1">
                      {t("result")}
                    </p>
                    <p className="text-4xl font-extrabold text-rose-700">
                      {formatFine(maxFine, locale)}
                    </p>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg border p-4">
                    {affected ? (
                      <>
                        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-900">
                            {t("affected")}
                          </p>
                          <Badge variant="destructive" className="mt-1">
                            NIS2
                          </Badge>
                        </div>
                      </>
                    ) : (
                      <>
                        <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-900">
                            {t("notAffected")}
                          </p>
                          <p className="text-sm text-slate-500 mt-1">
                            {t("notAffectedHint")}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
