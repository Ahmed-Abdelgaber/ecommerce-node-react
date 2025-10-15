import { describe, it, expect, beforeEach, vi } from "vitest";
import { AppError } from "@core/errors/AppError";
import { ErrorCodes } from "@core/errors/codes";
import {
  checkoutController,
  getOrderController,
  listOrdersController,
} from "@modules/order/order.controller";
import { createMockRequest, createMockResponse } from "./test-utils";

vi.mock("@modules/order/order.service", () => ({
  checkout: vi.fn(),
  getOrder: vi.fn(),
  listMyOrders: vi.fn(),
}));

const servicePromise = import("@modules/order/order.service");

describe("order.controller", () => {
  beforeEach(async () => {
    const service = await servicePromise;
    vi.mocked(service.checkout).mockReset();
    vi.mocked(service.getOrder).mockReset();
    vi.mocked(service.listMyOrders).mockReset();
  });

  it("checkoutController returns order for authenticated user", async () => {
    const service = await servicePromise;
    const fakeOrder = { id: "order-1" };
    vi.mocked(service.checkout).mockResolvedValue(fakeOrder);

    const req = createMockRequest({
      user: { id: "user-1" },
      body: {
        shippingAddress: {
          line1: "123 Main St",
          city: "Cairo",
          countryCode: "EG",
        },
        paymentMethod: "COD",
      },
    });
    const res = createMockResponse();

    await checkoutController(req, res, vi.fn());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ data: fakeOrder });
    expect(service.checkout).toHaveBeenCalledWith("user-1", {
      shippingAddressId: undefined,
      shippingAddress: {
        line1: "123 Main St",
        city: "Cairo",
        countryCode: "EG",
      },
      paymentMethod: "COD",
    });
  });

  it("checkoutController forwards service errors", async () => {
    const service = await servicePromise;
    const err = new AppError(ErrorCodes.VALIDATION, "Cart is empty");
    vi.mocked(service.checkout).mockRejectedValue(err);
    const req = createMockRequest({
      user: { id: "user-1" },
      body: { shippingAddress: { line1: "a", city: "b", countryCode: "EG" }, paymentMethod: "COD" },
    });
    const res = createMockResponse();
    const next = vi.fn();

    await checkoutController(req, res, next);

    expect(next).toHaveBeenCalledWith(err);
  });

  it("getOrderController returns user order", async () => {
    const service = await servicePromise;
    const fakeOrder = { id: "order-1" };
    vi.mocked(service.getOrder).mockResolvedValue(fakeOrder);

    const req = createMockRequest({
      user: { id: "user-1" },
      params: { orderId: "clu90q1j90000l50ed4mekr8g" },
    });
    const res = createMockResponse();

    await getOrderController(req, res, vi.fn());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ data: fakeOrder });
    expect(service.getOrder).toHaveBeenCalledWith(
      "user-1",
      "clu90q1j90000l50ed4mekr8g"
    );
  });

  it("getOrderController forwards not found errors", async () => {
    const service = await servicePromise;
    const err = new AppError(ErrorCodes.NOT_FOUND, "Order not found");
    vi.mocked(service.getOrder).mockRejectedValue(err);
    const req = createMockRequest({
      user: { id: "user-1" },
      params: { orderId: "clu90q1j90000l50ed4mekr8h" },
    });
    const res = createMockResponse();
    const next = vi.fn();

    await getOrderController(req, res, next);

    expect(next).toHaveBeenCalledWith(err);
  });

  it("listOrdersController returns paginated result", async () => {
    const service = await servicePromise;
    const payload = { rows: [], total: 0, page: 2, size: 5, hasNext: false };
    vi.mocked(service.listMyOrders).mockResolvedValue(payload);
    const req = createMockRequest({
      user: { id: "user-1" },
      query: { page: "2", size: "5" },
    });
    const res = createMockResponse();

    await listOrdersController(req, res, vi.fn());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ data: payload });
    expect(service.listMyOrders).toHaveBeenCalledWith("user-1", 2, 5);
  });
});
