import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export const SigninSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});
