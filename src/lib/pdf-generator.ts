import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { NIS2_CATEGORIES, getCategoryForQuestion } from "@/data/nis2-framework";
import type { AnswerValue, NIS2Question } from "@/data/nis2-framework";
import { calculateAuditScoreV2, getScoreLabel } from "./scoring";
import { calculateMaxFine, formatFine } from "./fine-calculator";

interface AuditData {
  companyName: string | null;
  revenue: number | null;
  locale: string;
  clientName?: string | null;
  consultantName?: string | null;
}

interface AnswerData {
  questionId: string;
  categoryId: string;
  value: string;
  notes?: string | null;
}

interface ActionItemData {
  title: string;
  priority: string;
  status: string;
  categoryId?: string | null;
  questionId?: string | null;
}

const translations = {
  de: {
    title: "NIS2 Compliance Audit Report",
    executiveSummary: "Zusammenfassung",
    overallScore: "Gesamtbewertung",
    fineRisk: "Maximales Bußgeldrisiko",
    categoryDetails: "Kategorie-Details",
    gapAnalysis: "Gap-Analyse",
    actionPlan: "Maßnahmenplan",
    question: "Frage",
    status: "Status",
    severity: "Schweregrad",
    generatedOn: "Erstellt am",
    preparedFor: "Erstellt für",
    preparedBy: "Erstellt von",
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
    consultantNote: "Anmerkung des Beraters",
    recommendation: "Empfehlung",
    measure: "Maßnahme",
    priority: "Priorität",
    category: "Kategorie",
    noActions: "Keine Maßnahmen definiert.",
    open: "Offen",
    inProgress: "In Bearbeitung",
    blocked: "Blockiert",
    done: "Erledigt",
    critical: "Kritisch",
    high: "Hoch",
    medium: "Mittel",
    low: "Niedrig",
  },
  en: {
    title: "NIS2 Compliance Audit Report",
    executiveSummary: "Executive Summary",
    overallScore: "Overall Score",
    fineRisk: "Maximum Fine Risk",
    categoryDetails: "Category Details",
    gapAnalysis: "Gap Analysis",
    actionPlan: "Action Plan",
    question: "Question",
    status: "Status",
    severity: "Severity",
    generatedOn: "Generated on",
    preparedFor: "Prepared for",
    preparedBy: "Prepared by",
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
    consultantNote: "Consultant Note",
    recommendation: "Recommendation",
    measure: "Measure",
    priority: "Priority",
    category: "Category",
    noActions: "No action items defined.",
    open: "Open",
    inProgress: "In Progress",
    blocked: "Blocked",
    done: "Done",
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
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

function getPriorityLabel(
  priority: string,
  t: (typeof translations)["de"]
): string {
  const map: Record<string, string> = {
    critical: t.critical,
    high: t.high,
    medium: t.medium,
    low: t.low,
  };
  return map[priority] || priority;
}

function getStatusLabel(
  status: string,
  t: (typeof translations)["de"]
): string {
  const map: Record<string, string> = {
    open: t.open,
    in_progress: t.inProgress,
    blocked: t.blocked,
    done: t.done,
  };
  return map[status] || status;
}

function getRecommendation(question: NIS2Question, locale: "de" | "en"): string | null {
  const q = question as NIS2Question & { recommendation?: { de: string; en: string } };
  if (q.recommendation) {
    return q.recommendation[locale];
  }
  return null;
}

export async function generateAuditPDF(
  audit: AuditData,
  answerData: AnswerData[],
  actionItems?: ActionItemData[]
): Promise<Uint8Array> {
  const locale = (audit.locale === "en" ? "en" : "de") as "de" | "en";
  const t = translations[locale];
  const doc = new jsPDF("p", "mm", "a4");

  const answersMap = new Map<string, AnswerValue>();
  const notesMap = new Map<string, string>();
  for (const a of answerData) {
    answersMap.set(a.questionId, a.value as AnswerValue);
    if (a.notes) notesMap.set(a.questionId, a.notes);
  }

  const scoreModel = calculateAuditScoreV2(answersMap, NIS2_CATEGORIES);
  const categoryScores = scoreModel.categoryScores.map((cat) => ({
    id: cat.categoryId,
    score: cat.score,
  }));
  const overallScore = scoreModel.overallScore;

  // --- Cover Page ---
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 105, "F");

  // Branding area
  if (audit.consultantName) {
    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFontSize(10);
    doc.text(audit.consultantName, 20, 20);
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.text(t.title, 105, 50, { align: "center" });

  // Client / Company
  const displayName = audit.clientName || audit.companyName || "---";
  doc.setFontSize(14);
  doc.text(displayName, 105, 68, { align: "center" });

  if (audit.clientName && audit.companyName && audit.clientName !== audit.companyName) {
    doc.setFontSize(11);
    doc.setTextColor(148, 163, 184);
    doc.text(audit.companyName, 105, 78, { align: "center" });
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(
    `${t.generatedOn} ${new Date().toLocaleDateString(locale === "de" ? "de-DE" : "en-US")}`,
    105,
    95,
    { align: "center" }
  );

  // Score display
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(56);
  doc.text(`${overallScore}%`, 105, 150, { align: "center" });

  doc.setFontSize(14);
  doc.text(
    `${t.overallScore}: ${getScoreLabel(overallScore, locale)}`,
    105,
    165,
    { align: "center" }
  );

  // Fine risk
  if (audit.revenue) {
    const maxFine = calculateMaxFine(audit.revenue);
    doc.setTextColor(225, 29, 72);
    doc.setFontSize(12);
    doc.text(`${t.fineRisk}: ${formatFine(maxFine, locale)}`, 105, 185, {
      align: "center",
    });
  }

  // Prepared for/by section
  let infoY = 210;
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  if (audit.clientName) {
    doc.text(`${t.preparedFor}: ${audit.clientName}`, 105, infoY, { align: "center" });
    infoY += 6;
  }
  if (audit.consultantName) {
    doc.text(`${t.preparedBy}: ${audit.consultantName}`, 105, infoY, { align: "center" });
  }

  // --- Executive Summary (Page 2) ---
  doc.addPage();
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(20);
  doc.text(t.executiveSummary, 20, 25);

  autoTable(doc, {
    startY: 40,
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
            data.cell.styles.textColor = [16, 185, 129];
          else if (val === t.partial)
            data.cell.styles.textColor = [245, 158, 11];
          else if (val === t.notFulfilled)
            data.cell.styles.textColor = [225, 29, 72];
        }
      },
    });

    // Notes and recommendations below the table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let detailY = (doc as any).lastAutoTable?.finalY + 8 || 120;

    for (const q of category.questions) {
      const answer = answersMap.get(q.id);
      const note = notesMap.get(q.id);
      const recommendation = getRecommendation(q, locale);
      const showRecommendation = answer === "not_fulfilled" && recommendation;

      if (!note && !showRecommendation) continue;

      // Check page space
      if (detailY > 250) {
        doc.addPage();
        detailY = 20;
      }

      // Question reference
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`${q.id}: ${q.text[locale].substring(0, 80)}...`, 20, detailY);
      detailY += 5;

      // Consultant note (gray box)
      if (note) {
        doc.setFillColor(241, 245, 249); // slate-100
        const noteLines = doc.splitTextToSize(note, 160);
        const noteH = noteLines.length * 4 + 6;
        doc.rect(20, detailY, 170, noteH, "F");
        doc.setFontSize(7);
        doc.setTextColor(71, 85, 105); // slate-600
        doc.text(`${t.consultantNote}:`, 23, detailY + 4);
        doc.setTextColor(30, 41, 59);
        doc.text(noteLines, 23, detailY + 8);
        detailY += noteH + 3;
      }

      // Recommendation (blue box)
      if (showRecommendation) {
        doc.setFillColor(219, 234, 254); // blue-100
        const recLines = doc.splitTextToSize(recommendation, 160);
        const recH = recLines.length * 4 + 6;
        doc.rect(20, detailY, 170, recH, "F");
        doc.setFontSize(7);
        doc.setTextColor(29, 78, 216); // blue-700
        doc.text(`${t.recommendation}:`, 23, detailY + 4);
        doc.setTextColor(30, 58, 138);
        doc.text(recLines, 23, detailY + 8);
        detailY += recH + 3;
      }

      detailY += 4;
    }
  }

  // --- Action Plan ---
  const priorityOrder = ["critical", "high", "medium", "low"];

  let actionList = actionItems || [];

  // Auto-generate from not_fulfilled if no manual action items
  if (actionList.length === 0) {
    actionList = NIS2_CATEGORIES.flatMap((cat) =>
      cat.questions
        .filter((q) => answersMap.get(q.id) === "not_fulfilled")
        .map((q) => {
          const rec = getRecommendation(q, locale);
          return {
            title: rec || q.text[locale],
            priority: q.severity === "kritisch" ? "critical" : q.severity === "hoch" ? "high" : "medium",
            status: "open",
            categoryId: cat.id,
            questionId: q.id,
          };
        })
    );
  }

  if (actionList.length > 0) {
    doc.addPage();
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(20);
    doc.text(t.actionPlan, 20, 25);

    const sortedActions = [...actionList].sort(
      (a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
    );

    autoTable(doc, {
      startY: 35,
      head: [[t.measure, t.priority, t.status, t.category]],
      body: sortedActions.map((item) => {
        const cat = item.categoryId
          ? NIS2_CATEGORIES.find((c) => c.id === item.categoryId)
          : item.questionId
            ? getCategoryForQuestion(item.questionId)
            : null;
        return [
          item.title,
          getPriorityLabel(item.priority, t),
          getStatusLabel(item.status, t),
          cat ? cat.name[locale] : "---",
        ];
      }),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [15, 23, 42] },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 25 },
        2: { cellWidth: 30 },
        3: { cellWidth: 35 },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 1) {
          const val = data.cell.text[0];
          if (val === t.critical) data.cell.styles.textColor = [225, 29, 72];
          else if (val === t.high) data.cell.styles.textColor = [245, 158, 11];
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
      headStyles: { fillColor: [225, 29, 72] },
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
