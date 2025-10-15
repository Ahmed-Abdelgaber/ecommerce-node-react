import { describe, it, expect, beforeEach, vi } from "vitest";
import { AppError } from "@core/errors/AppError";
import { ErrorCodes } from "@core/errors/codes";
import {
  registerHandler,
  signinHandler,
  refreshHandler,
  logoutHandler,
} from "@modules/auth/auth.controller";
import { createMockRequest, createMockResponse } from "./test-utils";

vi.mock("@modules/auth/auth.service", () => ({
  register: vi.fn(),
  signin: vi.fn(),
}));

vi.mock("@core/security/jwt", () => ({
  signAccess: vi.fn(),
  signRefresh: vi.fn(),
  verifyAccess: vi.fn(),
  verifyRefresh: vi.fn(),
}));

const servicePromise = import("@modules/auth/auth.service");
const jwtPromise = import("@core/security/jwt");

describe("auth.controller", () => {
  beforeEach(async () => {
    const service = await servicePromise;
    const jwt = await jwtPromise;
    vi.mocked(service.register).mockReset();
    vi.mocked(service.signin).mockReset();
    vi.mocked(jwt.verifyRefresh).mockReset();
    vi.mocked(jwt.signAccess).mockReset();
  });

  it("registerHandler returns 201 with user and sets tokens", async () => {
    const service = await servicePromise;
    vi.mocked(service.register).mockResolvedValue({
      user: { id: "user-1", email: "test@example.com", name: "Tester" },
      tokens: { access: "access-token", refresh: "refresh-token" },
    });
    const req = createMockRequest({
      body: { email: "test@example.com", password: "password123", name: "Tester" },
    });
    const res = createMockResponse();

    await registerHandler(req, res, vi.fn());

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      data: { user: { id: "user-1", email: "test@example.com", name: "Tester" } },
    });
    expect(res.headers.get("x-access-token")).toBe("access-token");
    expect(res.cookies.get("refresh_token")).toMatchObject({
      value: "refresh-token",
    });
    expect(service.register).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
      name: "Tester",
    });
  });

  it("registerHandler propagates rejected errors", async () => {
    const service = await servicePromise;
    const err = new AppError(ErrorCodes.AUTH_CONFLICT, "Email already in use");
    vi.mocked(service.register).mockRejectedValue(err);
    const req = createMockRequest({
      body: { email: "test@example.com", password: "password123", name: "Tester" },
    });
    const res = createMockResponse();

    await expect(registerHandler(req, res, vi.fn())).rejects.toBe(err);
  });

  it("signinHandler returns 200 with user and sets tokens", async () => {
    const service = await servicePromise;
    vi.mocked(service.signin).mockResolvedValue({
      user: { id: "user-2", email: "test2@example.com", name: "Tester" },
      tokens: { access: "access-token", refresh: "refresh-token" },
    });
    const req = createMockRequest({
      body: { email: "test2@example.com", password: "password123" },
    });
    const res = createMockResponse();

    await signinHandler(req, res, vi.fn());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      data: { user: { id: "user-2", email: "test2@example.com", name: "Tester" } },
    });
    expect(res.headers.get("x-access-token")).toBe("access-token");
    expect(res.cookies.get("refresh_token")).toMatchObject({
      value: "refresh-token",
    });
    expect(service.signin).toHaveBeenCalledWith({
      email: "test2@example.com",
      password: "password123",
    });
  });

  it("signinHandler propagates AppError rejections", async () => {
    const service = await servicePromise;
    const err = new AppError(ErrorCodes.AUTH_INVALID, "Invalid credentials");
    vi.mocked(service.signin).mockRejectedValue(err);
    const req = createMockRequest({
      body: { email: "test2@example.com", password: "wrongpass" },
    });
    const res = createMockResponse();

    await expect(signinHandler(req, res, vi.fn())).rejects.toBe(err);
  });

  it("refreshHandler rotates access token", async () => {
    const jwt = await jwtPromise;
    vi.mocked(jwt.verifyRefresh).mockResolvedValue({ sub: "user-1", role: "USER" } as any);
    vi.mocked(jwt.signAccess).mockResolvedValue("new-access-token");
    const req = createMockRequest({
      cookies: { refresh_token: "old-refresh" },
    });
    const res = createMockResponse();

    await refreshHandler(req, res, vi.fn());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ data: { ok: true } });
    expect(res.headers.get("x-access-token")).toBe("new-access-token");
    expect(jwt.verifyRefresh).toHaveBeenCalledWith("old-refresh");
    expect(jwt.signAccess).toHaveBeenCalledWith({ sub: "user-1", role: "USER" });
  });

  it("refreshHandler returns 401 when refresh cookie missing", async () => {
    const req = createMockRequest({ cookies: {} });
    const res = createMockResponse();
    const next = vi.fn();

    await refreshHandler(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({
      error: { message: "Refresh token missing", status: 401 },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("refreshHandler forwards errors from verifyRefresh", async () => {
    const jwt = await jwtPromise;
    const err = new Error("token failed");
    vi.mocked(jwt.verifyRefresh).mockRejectedValue(err);
    const req = createMockRequest({ cookies: { refresh_token: "old-refresh" } });
    const res = createMockResponse();
    const next = vi.fn();

    await refreshHandler(req, res, next);

    expect(next).toHaveBeenCalledWith(err);
  });

  it("logoutHandler clears refresh cookie and returns ok", async () => {
    const res = createMockResponse();

    await logoutHandler(createMockRequest(), res, vi.fn());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ data: { ok: true } });
    expect(res.cookies.get("refresh_token")).toBeTruthy();
    expect(res.headers.get("x-access-token")).toBe("");
  });
});
