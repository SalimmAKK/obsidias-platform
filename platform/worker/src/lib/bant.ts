import { z } from "zod";

// Value vocabulary matches exactly what the dashboard's Review Queue and
// Lead Detail pages already render (see platform/frontend's bantDisplay /
// bantClass helpers) — changing these enums means changing the frontend
// display logic too, so don't drift them apart casually.
export const BantAssessmentSchema = z.object({
  budget: z.enum(["unknown", "low", "medium", "high"]),
  authority: z.enum(["unknown", "true", "false"]),
  need: z.enum(["unknown", "weak", "moderate", "strong"]),
  timeline: z.enum(["unknown", "immediate", "3months", "6months"]),
  confidence: z.number().min(0).max(1),
  qualification_notes: z.string().min(1),
  disqualified: z.boolean(),
  disqualify_reason: z.string().optional(),
});

export type BantAssessment = z.infer<typeof BantAssessmentSchema>;

export function scoreFromConfidence(confidence: number): number {
  return Math.round(confidence * 100);
}

export function bucketFromScore(score: number): "hot" | "warm" | "cold" {
  if (score >= 70) return "hot";
  if (score >= 40) return "warm";
  return "cold";
}
