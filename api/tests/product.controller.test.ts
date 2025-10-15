import { describe, it, expect, beforeEach, vi } from "vitest";
import { AppError } from "@core/errors/AppError";
import { ErrorCodes } from "@core/errors/codes";
import {
  listProductsController,
  getProductController,
  listProductsByCategoryController,
  listProductsByBrandController,
  listProductsByTagController,
} from "@modules/product/product.controller";
import { createMockRequest, createMockResponse } from "./test-utils";

vi.mock("@modules/product/product.service", () => ({
  listProducts: vi.fn(),
  getProduct: vi.fn(),
  listProductsByCategory: vi.fn(),
  listProductsByBrand: vi.fn(),
  listProductsByTag: vi.fn(),
}));

const servicePromise = import("@modules/product/product.service");

describe("product.controller", () => {
  beforeEach(async () => {
    const service = await servicePromise;
    vi.mocked(service.listProducts).mockReset();
    vi.mocked(service.getProduct).mockReset();
    vi.mocked(service.listProductsByCategory).mockReset();
    vi.mocked(service.listProductsByBrand).mockReset();
    vi.mocked(service.listProductsByTag).mockReset();
  });

  it("listProductsController returns list payload", async () => {
    const service = await servicePromise;
    vi.mocked(service.listProducts).mockResolvedValue({
      items: [{ id: "p1" }],
      page: 1,
      size: 12,
      total: 1,
      hasNext: false,
    });
    const req = createMockRequest({ query: { page: "1" } });
    const res = createMockResponse();

    await listProductsController(req, res, vi.fn());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      data: {
        items: [{ id: "p1" }],
        page: 1,
        size: 12,
        total: 1,
        hasNext: false,
      },
    });
    expect(service.listProducts).toHaveBeenCalledWith({ page: "1" });
  });

  it("getProductController returns product payload", async () => {
    const service = await servicePromise;
    vi.mocked(service.getProduct).mockResolvedValue({ id: "p1" });
    const req = createMockRequest({ params: { id: "p1" } });
    const res = createMockResponse();

    await getProductController(req, res, vi.fn());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ data: { id: "p1" } });
    expect(service.getProduct).toHaveBeenCalledWith("p1");
  });

  it("getProductController forwards errors", async () => {
    const service = await servicePromise;
    const err = new AppError(ErrorCodes.NOT_FOUND, "Product not found");
    vi.mocked(service.getProduct).mockRejectedValue(err);
    const req = createMockRequest({ params: { id: "missing" } });
    const res = createMockResponse();
    const next = vi.fn();

    await getProductController(req, res, next);
    await vi.waitFor(() => {
      expect(next).toHaveBeenCalledWith(err);
    });
  });

  it("listProductsByCategoryController passes filters", async () => {
    const service = await servicePromise;
    vi.mocked(service.listProductsByCategory).mockResolvedValue({
      items: [],
      page: 2,
      size: 5,
      total: 0,
      hasNext: false,
    });
    const req = createMockRequest({
      params: { category: "electronics" },
      query: { page: "2", size: "5", sort: "price_desc" },
    });
    const res = createMockResponse();

    await listProductsByCategoryController(req, res, vi.fn());

    expect(service.listProductsByCategory).toHaveBeenCalledWith("electronics", {
      page: "2",
      size: "5",
      sort: "price_desc",
    });
    expect(res.statusCode).toBe(200);
  });

  it("listProductsByBrandController passes filters", async () => {
    const service = await servicePromise;
    vi.mocked(service.listProductsByBrand).mockResolvedValue({
      items: [],
      page: 1,
      size: 10,
      total: 0,
      hasNext: false,
    });
    const req = createMockRequest({
      params: { brand: "apple" },
      query: { page: "1", size: "10" },
    });
    const res = createMockResponse();

    await listProductsByBrandController(req, res, vi.fn());

    expect(service.listProductsByBrand).toHaveBeenCalledWith("apple", {
      page: "1",
      size: "10",
    });
    expect(res.statusCode).toBe(200);
  });

  it("listProductsByTagController passes filters", async () => {
    const service = await servicePromise;
    vi.mocked(service.listProductsByTag).mockResolvedValue({
      items: [],
      page: 1,
      size: 10,
      total: 0,
      hasNext: false,
    });
    const req = createMockRequest({
      params: { tag: "sale" },
      query: { page: "1", size: "10", sort: "newest" },
    });
    const res = createMockResponse();

    await listProductsByTagController(req, res, vi.fn());

    expect(service.listProductsByTag).toHaveBeenCalledWith("sale", {
      page: "1",
      size: "10",
      sort: "newest",
    });
    expect(res.statusCode).toBe(200);
  });
});
