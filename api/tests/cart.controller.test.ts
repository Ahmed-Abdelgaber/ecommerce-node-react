import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  addItemController,
  updateItemController,
  removeItemController,
  clearCartController,
} from "@modules/cart/cart.controller";
import { createMockRequest, createMockResponse } from "./test-utils";

vi.mock("@modules/cart/cart.service", () => ({
  addItem: vi.fn(),
  setItemQuantity: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}));

const servicePromise = import("@modules/cart/cart.service");

const sampleCart = {
  id: "cart-123",
  items: [],
  itemsCount: 0,
  subtotal: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("cart.controller", () => {
  beforeEach(async () => {
    const service = await servicePromise;
    vi.mocked(service.addItem).mockReset();
    vi.mocked(service.setItemQuantity).mockReset();
    vi.mocked(service.removeItem).mockReset();
    vi.mocked(service.clear).mockReset();
  });

  it("addItemController adds item and returns 201", async () => {
    const service = await servicePromise;
    vi.mocked(service.addItem).mockResolvedValue(sampleCart);
    const req = createMockRequest({
      params: { cartId: "cart-123" },
      body: { productId: "prod-1", quantity: 2 },
    });
    const res = createMockResponse();

    await addItemController(req, res, vi.fn());

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ data: sampleCart });
    expect(service.addItem).toHaveBeenCalledWith(
      "cart-123",
      "prod-1",
      2,
      undefined
    );
  });

  it("updateItemController sets quantity", async () => {
    const service = await servicePromise;
    vi.mocked(service.setItemQuantity).mockResolvedValue(sampleCart);
    const req = createMockRequest({
      params: {
        cartId: "cart-123",
        itemId: "00000000-0000-0000-0000-000000000001",
      },
      body: { quantity: 5 },
    });
    const res = createMockResponse();

    await updateItemController(req, res, vi.fn());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ data: sampleCart });
    expect(service.setItemQuantity).toHaveBeenCalledWith(
      "cart-123",
      "00000000-0000-0000-0000-000000000001",
      5
    );
  });

  it("removeItemController removes item", async () => {
    const service = await servicePromise;
    vi.mocked(service.removeItem).mockResolvedValue(sampleCart);
    const req = createMockRequest({
      params: {
        cartId: "cart-123",
        itemId: "00000000-0000-0000-0000-000000000001",
      },
    });
    const res = createMockResponse();

    await removeItemController(req, res, vi.fn());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ data: sampleCart });
    expect(service.removeItem).toHaveBeenCalledWith(
      "cart-123",
      "00000000-0000-0000-0000-000000000001"
    );
  });

  it("clearCartController clears cart", async () => {
    const service = await servicePromise;
    vi.mocked(service.clear).mockResolvedValue(sampleCart);
    const req = createMockRequest({ params: { cartId: "cart-123" } });
    const res = createMockResponse();

    await clearCartController(req, res, vi.fn());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ data: sampleCart });
    expect(service.clear).toHaveBeenCalledWith("cart-123");
  });
});
