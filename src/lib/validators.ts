import { z } from "zod";

export const leadCaptureSchema = z.object({
  email: z.string().email(),
  companyName: z.string().optional(),
  consent: z.literal(true),
  auditId: z.string().uuid(),
});

const answerInputSchema = z.object({
  questionId: z.string(),
  categoryId: z.string(),
  value: z.enum(["fulfilled", "partial", "not_fulfilled", "not_applicable"]),
  notes: z.string().optional(),
});

export const createAuditSchema = z.object({
  companyName: z.string().optional(),
  revenue: z.number().min(0).optional(),
  employeeCount: z.number().int().min(0).optional(),
  industry: z.string().optional(),
  locale: z.enum(["de", "en"]).default("de"),
});

export const saveAnswersSchema = z.object({
  answers: z.array(answerInputSchema),
});

export const completeQuickCheckSchema = z.object({
  email: z.string().email(),
  companyName: z.string().optional(),
  consent: z.literal(true),
  locale: z.enum(["de", "en"]).default("de"),
  answers: z.array(answerInputSchema).min(1),
});

export const updateAuditSchema = z.object({
  companyName: z.string().optional(),
  revenue: z.number().min(0).optional(),
  employeeCount: z.number().int().min(0).optional(),
  industry: z.string().optional(),
});

export const updateProgramSchema = z.object({
  status: z
    .enum([
      "setup_in_progress",
      "blocked",
      "final_review",
      "continuous_compliance",
      "completed",
    ])
    .optional(),
  currentPhase: z
    .enum([
      "assessment",
      "gap_review",
      "roadmap",
      "policies",
      "controls",
      "training",
      "final_review",
      "continuous_compliance",
    ])
    .optional(),
  currentWeek: z.number().int().min(1).max(52).optional(),
  ownerUserId: z.string().uuid().nullable().optional(),
  targetDate: z.string().datetime().optional(),
});

export const createOrRefreshDocumentsSchema = z.object({
  regenerate: z.boolean().default(false),
  documentType: z
    .enum([
      "information_security_policy",
      "access_control_policy",
      "incident_response_policy",
      "backup_policy",
      "vendor_security_policy",
      "cyber_hygiene_handbook",
      "incident_communication_plan",
    ])
    .optional(),
});

export const updateDocumentArtifactSchema = z.object({
  title: z.string().min(1).optional(),
  customContent: z.string().min(1).optional(),
  status: z
    .enum([
      "generated",
      "customer_input_needed",
      "expert_review_needed",
      "legal_review_needed",
      "approved",
      "published",
    ])
    .optional(),
});

export const createTrainingCampaignSchema = z.object({
  type: z.enum([
    "security_basics",
    "phishing_awareness",
    "incident_reporting",
    "password_security",
    "sensitive_data_handling",
    "management_cybersecurity_briefing",
  ]),
  title: z.string().min(1),
  targetGroup: z.string().min(1),
  isMandatory: z.boolean().default(true),
  dueDate: z.string().datetime().nullable().optional(),
});

export const updateTrainingCampaignSchema = z.object({
  title: z.string().min(1).optional(),
  targetGroup: z.string().min(1).optional(),
  isMandatory: z.boolean().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  status: z.enum(["planned", "active", "completed", "overdue"]).optional(),
});

export const updateTrainingAssignmentSchema = z.object({
  participantLabel: z.string().min(1).optional(),
  participantEmail: z.string().email().nullable().optional(),
  completionPercent: z.number().int().min(0).max(100).optional(),
  quizScore: z.number().int().min(0).max(100).nullable().optional(),
  status: z
    .enum(["pending", "invited", "in_progress", "completed", "overdue"])
    .optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

export const updateReviewCaseSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "dismissed"]).optional(),
  decision: z
    .enum(["approved", "changes_required", "escalated", "rejected", "no_action"])
    .nullable()
    .optional(),
  details: z.string().min(1).optional(),
  assignedToUserId: z.string().uuid().nullable().optional(),
});

export type LeadCaptureInput = z.infer<typeof leadCaptureSchema>;
export type CreateAuditInput = z.infer<typeof createAuditSchema>;
export type SaveAnswersInput = z.infer<typeof saveAnswersSchema>;
export type UpdateAuditInput = z.infer<typeof updateAuditSchema>;
export type CompleteQuickCheckInput = z.infer<typeof completeQuickCheckSchema>;
