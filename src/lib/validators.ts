import { z } from "zod";

export const leadCaptureSchema = z.object({
  email: z.string().email(),
  companyName: z.string().optional(),
  consent: z.literal(true),
  auditId: z.string().uuid(),
});

export const createAuditSchema = z.object({
  companyName: z.string().optional(),
  revenue: z.number().min(0).optional(),
  employeeCount: z.number().int().min(0).optional(),
  industry: z.string().optional(),
  locale: z.enum(["de", "en"]).default("de"),
});

export const saveAnswersSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      categoryId: z.string(),
      value: z.enum(["fulfilled", "partial", "not_fulfilled", "not_applicable"]),
      notes: z.string().optional(),
    })
  ),
});

export const updateAuditSchema = z.object({
  companyName: z.string().optional(),
  revenue: z.number().min(0).optional(),
  employeeCount: z.number().int().min(0).optional(),
  industry: z.string().optional(),
});

export type LeadCaptureInput = z.infer<typeof leadCaptureSchema>;
export type CreateAuditInput = z.infer<typeof createAuditSchema>;
export type SaveAnswersInput = z.infer<typeof saveAnswersSchema>;
export type UpdateAuditInput = z.infer<typeof updateAuditSchema>;
