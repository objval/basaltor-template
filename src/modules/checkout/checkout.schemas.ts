import { z } from "zod";

export const checkoutLineSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().positive().max(25),
});

export const checkoutCustomerSchema = z.object({
  mode: z.enum(["account", "guest"]),
  fullName: z.string().trim().min(1).max(120),
  email: z.email().trim().max(160),
  contactHandle: z.string().trim().max(80).optional().default(""),
  country: z.string().trim().max(80).optional().default(""),
  note: z.string().trim().max(240).optional().default(""),
});

export const createCheckoutSchema = z.object({
  provider: z.enum(["stripe", "paddle"]),
  items: z.array(checkoutLineSchema).min(1),
  customer: checkoutCustomerSchema,
  notes: z.string().trim().max(400).optional().default(""),
});

export const resolveMockPaymentSchema = z.object({
  paymentAttemptPublicId: z.string().trim().min(1),
  outcome: z.enum(["paid", "failed"]),
  guestToken: z.string().trim().min(1).optional(),
});

export type CheckoutCustomerInput = z.infer<typeof checkoutCustomerSchema>;
export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
export type ResolveMockPaymentInput = z.infer<typeof resolveMockPaymentSchema>;
