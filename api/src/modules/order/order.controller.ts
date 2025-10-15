import type { RequestHandler } from "express";
import { ok } from "@app/http/response";
import * as service from "@modules/order/order.service";

export const checkoutController: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req as any).user.id as string;
    const { shippingAddressId, shippingAddress, paymentMethod } =
      req.body as any;
    const order = await service.checkout(userId, {
      shippingAddressId,
      shippingAddress,
      paymentMethod,
    });
    return ok(res, order);
  } catch (err) {
    return next(err);
  }
};

export const getOrderController: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req as any).user.id as string;
    const { orderId } = req.params as { orderId: string };
    const order = await service.getOrder(userId, orderId);
    return ok(res, order);
  } catch (err) {
    return next(err);
  }
};

export const listOrdersController: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req as any).user.id as string;
    const page = Number(req.query.page ?? 1) || 1;
    const size = Number(req.query.size ?? 10) || 10;
    const data = await service.listMyOrders(userId, page, size);
    return ok(res, data);
  } catch (err) {
    return next(err);
  }
};
