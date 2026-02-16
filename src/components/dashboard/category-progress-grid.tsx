"use client";

import { useTranslations } from "next-intl";
import { CategoryProgressCard } from "@/components/dashboard/category-progress-card";
import type { NIS2Category } from "@/data/nis2-framework";
import type { CategoryScore } from "@/lib/scoring";

interface CategoryProgressGridProps {
  categories: NIS2Category[];
  categoryScores: CategoryScore[];
  auditId: string;
}

export function CategoryProgressGrid({
  categories,
  categoryScores,
  auditId,
}: CategoryProgressGridProps) {
  const t = useTranslations("dashboard");

  const scoreMap = new Map(
    categoryScores.map((cs) => [cs.categoryId, cs])
  );

  return (
    <section>
      <h2 className="mb-6 text-xl font-semibold">{t("categories")}</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const cs = scoreMap.get(category.id);
          return (
            <CategoryProgressCard
              key={category.id}
              category={category}
              score={cs?.score ?? 0}
              answeredCount={cs?.answeredCount ?? 0}
              totalCount={cs?.totalCount ?? category.questions.length}
              isFree={category.isFree}
              auditId={auditId}
            />
          );
        })}
      </div>
    </section>
  );
}
