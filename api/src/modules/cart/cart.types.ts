import z from "zod";
import {
  AddItemBodySchema,
  ApiCartDTOSchema,
  ApiCartItemDTOSchema,
  UpdateItemBodySchema,
} from "@modules/cart/cart.schema";
import type { Prisma } from "@prisma/client";

export type AddItemBody = z.infer<typeof AddItemBodySchema>;
export type UpdateItemBody = z.infer<typeof UpdateItemBodySchema>;
export type ApiCartDTO = z.infer<typeof ApiCartDTOSchema>;
export type ApiCartItemDTO = z.infer<typeof ApiCartItemDTOSchema>;
export type ItemOptions = Prisma.InputJsonValue;
