import { Router } from "express";
import { authGuard } from "@app/middlewares/authGuard";
import { validate } from "@app/http/validator";
import {
  CheckoutBodySchema,
  OrderIdParamSchema,
} from "@modules/order/order.schema";
import {
  checkoutController,
  getOrderController,
  listOrdersController,
} from "@modules/order/order.controller";

const router = Router();
router.use(authGuard);

// POST /api/v1/checkout
router.post("/checkout", validate(CheckoutBodySchema), checkoutController);

// GET /api/v1/orders
router.get("/orders", listOrdersController);

// GET /api/v1/orders/:orderId
router.get(
  "/orders/:orderId",
  validate(OrderIdParamSchema, "params"),
  getOrderController
);

export default router;
