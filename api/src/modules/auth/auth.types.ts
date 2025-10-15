import { z } from "zod";
import { RegisterSchema, SigninSchema } from "@modules/auth/auth.schemas";

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type SigninInput = z.infer<typeof SigninSchema>;
