"use client";

import { useLocale } from "next-intl";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { getScoreColor, getScoreLabel } from "@/lib/scoring";

interface ComplianceScoreChartProps {
  score: number;
}

export function ComplianceScoreChart({ score }: ComplianceScoreChartProps) {
  const locale = useLocale();
  const color = getScoreColor(score);
  const label = getScoreLabel(score, locale);

  const data = [
    { name: "compliant", value: score },
    { name: "gap", value: 100 - score },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-48 w-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill={color} />
              <Cell fill="#e2e8f0" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold" style={{ color }}>
            {score}%
          </span>
        </div>
      </div>
      <span
        className="mt-2 text-sm font-semibold"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
}
