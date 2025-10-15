import { z } from "zod";

/* -------- Profile -------- */

export const ProfileInitBodySchema = z.object({
  displayName: z.string().trim().min(1).optional(),
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  phone: z.string().trim().optional(),
  avatarUrl: z.url().optional(),
});

export const ProfileUpdateBodySchema = ProfileInitBodySchema; // same fields for now

/* -------- Address -------- */

export const AddressCreateBodySchema = z.object({
  label: z.string().trim().optional(),
  recipientName: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  company: z.string().trim().optional(),

  line1: z.string().trim().min(1),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(1),
  state: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  countryCode: z.string().trim(),

  isDefaultShipping: z.coerce.boolean().optional(),
  isDefaultBilling: z.coerce.boolean().optional(),

  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

export const AddressUpdateBodySchema = AddressCreateBodySchema.partial();

export const AddressIdParamSchema = z.object({
  addressId: z.uuid(),
});
