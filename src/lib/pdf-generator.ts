import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { NIS2_CATEGORIES } from "@/data/nis2-framework";
import type { AnswerValue } from "@/data/nis2-framework";
import { calculateCategoryScore, getScoreLabel } from "./scoring";
import { calculateMaxFine, formatFine } from "./fine-calculator";

interface AuditData {
  companyName: string | null;
  revenue: number | null;
  locale: string;
}

interface AnswerData {
  questionId: string;
  categoryId: string;
  value: string;
}

const translations = {
  de: {
    title: "NIS2 Compliance Audit Report",
    executiveSummary: "Zusammenfassung",
    overallScore: "Gesamtbewertung",
    fineRisk: "Maximales Bußgeldrisiko",
    categoryDetails: "Kategorie-Details",
    gapAnalysis: "Gap-Analyse",
    question: "Frage",
    status: "Status",
    severity: "Schweregrad",
    generatedOn: "Erstellt am",
    disclaimer:
      "Dieser Bericht dient ausschließlich zur Information und stellt keine Rechtsberatung dar.",
    fulfilled: "Erfüllt",
    partial: "Teilweise",
    notFulfilled: "Nicht erfüllt",
    notApplicable: "N/A",
    kritisch: "Kritisch",
    hoch: "Hoch",
    mittel: "Mittel",
    score: "Score",
    noGaps: "Keine offenen Lücken identifiziert.",
  },
  en: {
    title: "NIS2 Compliance Audit Report",
    executiveSummary: "Executive Summary",
    overallScore: "Overall Score",
    fineRisk: "Maximum Fine Risk",
    categoryDetails: "Category Details",
    gapAnalysis: "Gap Analysis",
    question: "Question",
    status: "Status",
    severity: "Severity",
    generatedOn: "Generated on",
    disclaimer:
      "This report is for informational purposes only and does not constitute legal advice.",
    fulfilled: "Fulfilled",
    partial: "Partial",
    notFulfilled: "Not Fulfilled",
    notApplicable: "N/A",
    kritisch: "Critical",
    hoch: "High",
    mittel: "Medium",
    score: "Score",
    noGaps: "No open gaps identified.",
  },
};

function getAnswerLabel(
  value: string,
  t: (typeof translations)["de"]
): string {
  const map: Record<string, string> = {
    fulfilled: t.fulfilled,
    partial: t.partial,
    not_fulfilled: t.notFulfilled,
    not_applicable: t.notApplicable,
  };
  return map[value] || value;
}

function getSeverityLabel(
  severity: string,
  t: (typeof translations)["de"]
): string {
  const map: Record<string, string> = {
    kritisch: t.kritisch,
    hoch: t.hoch,
    mittel: t.mittel,
  };
  return map[severity] || severity;
}

export async function generateAuditPDF(
  audit: AuditData,
  answerData: AnswerData[]
): Promise<Uint8Array> {
  const locale = (audit.locale === "en" ? "en" : "de") as "de" | "en";
  const t = translations[locale];
  const doc = new jsPDF("p", "mm", "a4");

  const answersMap = new Map<string, AnswerValue>();
  for (const a of answerData) {
    answersMap.set(a.questionId, a.value as AnswerValue);
  }

  // Calculate scores
  const categoryScores = NIS2_CATEGORIES.map((cat) => ({
    id: cat.id,
    name: cat.name[locale],
    score: calculateCategoryScore(answersMap, cat.questions),
  }));

  const overallScore =
    categoryScores.length > 0
      ? Math.round(
          categoryScores.reduce((s, c) => s + c.score, 0) /
            categoryScores.length
        )
      : 0;

  // --- Cover Page ---
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 100, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.text(t.title, 105, 45, { align: "center" });

  doc.setFontSize(14);
  doc.text(audit.companyName || "---", 105, 65, { align: "center" });

  doc.setFontSize(11);
  doc.text(
    `${t.generatedOn} ${new Date().toLocaleDateString(locale === "de" ? "de-DE" : "en-US")}`,
    105,
    80,
    { align: "center" }
  );

  // Score circle area
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(60);
  doc.text(`${overallScore}%`, 105, 155, { align: "center" });

  doc.setFontSize(14);
  doc.text(
    `${t.overallScore}: ${getScoreLabel(overallScore, locale)}`,
    105,
    170,
    { align: "center" }
  );

  // Fine risk
  if (audit.revenue) {
    const maxFine = calculateMaxFine(audit.revenue);
    doc.setTextColor(225, 29, 72); // rose-600
    doc.setFontSize(12);
    doc.text(`${t.fineRisk}: ${formatFine(maxFine, locale)}`, 105, 190, {
      align: "center",
    });
  }

  // --- Executive Summary (Page 2) ---
  doc.addPage();
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(20);
  doc.text(t.executiveSummary, 20, 25);

  doc.setFontSize(10);
  let yPos = 40;

  autoTable(doc, {
    startY: yPos,
    head: [
      [
        locale === "de" ? "Kategorie" : "Category",
        t.score,
        locale === "de" ? "Beantwortet" : "Answered",
      ],
    ],
    body: NIS2_CATEGORIES.map((cat) => {
      const cs = categoryScores.find((s) => s.id === cat.id);
      const answered = cat.questions.filter((q) => answersMap.has(q.id)).length;
      return [
        cat.name[locale],
        `${cs?.score || 0}%`,
        `${answered}/${cat.questions.length}`,
      ];
    }),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [15, 23, 42] },
  });

  // --- Category Details ---
  for (const category of NIS2_CATEGORIES) {
    doc.addPage();
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(16);
    doc.text(
      `${category.name[locale]} (${category.articleRef})`,
      20,
      25
    );

    const cs = categoryScores.find((s) => s.id === category.id);
    doc.setFontSize(11);
    doc.text(`${t.score}: ${cs?.score || 0}%`, 20, 35);

    const rows = category.questions.map((q) => {
      const answer = answersMap.get(q.id);
      return [
        q.text[locale],
        answer ? getAnswerLabel(answer, t) : "---",
        getSeverityLabel(q.severity, t),
      ];
    });

    autoTable(doc, {
      startY: 42,
      head: [[t.question, t.status, t.severity]],
      body: rows,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [15, 23, 42] },
      columnStyles: {
        0: { cellWidth: 110 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 1) {
          const val = data.cell.text[0];
          if (val === t.fulfilled)
            data.cell.styles.textColor = [16, 185, 129]; // emerald
          else if (val === t.partial)
            data.cell.styles.textColor = [245, 158, 11]; // amber
          else if (val === t.notFulfilled)
            data.cell.styles.textColor = [225, 29, 72]; // rose
        }
      },
    });
  }

  // --- Gap Analysis ---
  doc.addPage();
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(20);
  doc.text(t.gapAnalysis, 20, 25);

  const gaps = NIS2_CATEGORIES.flatMap((cat) =>
    cat.questions
      .filter((q) => answersMap.get(q.id) === "not_fulfilled")
      .map((q) => [
        q.text[locale],
        cat.name[locale],
        getSeverityLabel(q.severity, t),
        q.legalReference,
      ])
  );

  if (gaps.length > 0) {
    autoTable(doc, {
      startY: 35,
      head: [
        [
          t.question,
          locale === "de" ? "Kategorie" : "Category",
          t.severity,
          locale === "de" ? "Rechtsgrundlage" : "Legal Basis",
        ],
      ],
      body: gaps,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [225, 29, 72] }, // rose for gap analysis
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 30 },
      },
    });
  } else {
    doc.setFontSize(11);
    doc.text(t.noGaps, 20, 40);
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`${i} / ${pageCount}`, 105, 290, { align: "center" });
    doc.text(t.disclaimer, 105, 285, { align: "center" });
  }

  return new Uint8Array(doc.output("arraybuffer"));
}
