import { z } from "zod";

export const CheckoutBodySchema = z.object({
  shippingAddressId: z.string().cuid().optional(),
  shippingAddress: z
    .object({
      label: z.string().optional(),
      recipientName: z.string().min(1),
      phone: z.string().optional(),
      company: z.string().optional(),
      line1: z.string().min(1),
      line2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      countryCode: z.string().length(2),
      latitude: z.coerce.number().optional(),
      longitude: z.coerce.number().optional(),
    })
    .partial()
    .refine((o) => !!o.line1 && !!o.city && !!o.countryCode, {
      message: "shippingAddress must include line1, city, countryCode",
    })
    .optional(),
  paymentMethod: z.enum(["COD", "CARD"]).default("COD"),
});

export const OrderIdParamSchema = z.object({
  orderId: z.string().cuid(),
});
