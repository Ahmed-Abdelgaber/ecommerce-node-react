import { Router } from "express";
import validate from "@app/http/validator";
import {
  AddItemBodySchema,
  ItemIdParamSchema,
  UpdateItemBodySchema,
} from "@modules/cart/cart.schema";
import {
  addItemController,
  updateItemController,
  removeItemController,
  clearCartController,
} from "@modules/cart/cart.controller";
import { authGuard } from "@app/middlewares/authGuard";

const router = Router();

router.use(authGuard);

// POST /api/v1/cart/items
router.post(
  "/:cartId/items",
  validate(AddItemBodySchema, "body"),
  addItemController
);

// PATCH /api/v1/cart/items/:itemId
router.patch(
  "/:cartId/items/:itemId",
  validate(ItemIdParamSchema, "params"),
  validate(UpdateItemBodySchema, "body"),
  updateItemController
);

// DELETE /api/v1/cart/items/:itemId?userId=...
router.delete(
  "/:cartId/items/:itemId",
  validate(ItemIdParamSchema, "params"),
  removeItemController
);

// POST /api/v1/cart/clear
router.post("/:cartId/clear", clearCartController);

export default router;
