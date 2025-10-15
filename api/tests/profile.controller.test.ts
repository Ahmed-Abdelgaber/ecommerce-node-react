import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getProfileController,
  initProfileController,
  updateProfileController,
  createAddressController,
  updateAddressController,
  deleteAddressController,
} from "@modules/profile/profile.controller";
import { createMockRequest, createMockResponse } from "./test-utils";

vi.mock("@modules/profile/profile.service", () => ({
  getProfile: vi.fn(),
  initProfile: vi.fn(),
  updateProfile: vi.fn(),
  createAddress: vi.fn(),
  updateAddress: vi.fn(),
  deleteAddress: vi.fn(),
}));

const servicePromise = import("@modules/profile/profile.service");

const fakeProfile = {
  id: "profile-1",
  userId: "user-1",
  displayName: "Tester",
  addresses: [],
  activeCart: { id: "cart-1" },
};

describe("profile.controller", () => {
  beforeEach(async () => {
    const service = await servicePromise;
    vi.mocked(service.getProfile).mockReset();
    vi.mocked(service.initProfile).mockReset();
    vi.mocked(service.updateProfile).mockReset();
    vi.mocked(service.createAddress).mockReset();
    vi.mocked(service.updateAddress).mockReset();
    vi.mocked(service.deleteAddress).mockReset();
  });

  it("getProfileController returns profile for current user", async () => {
    const service = await servicePromise;
    vi.mocked(service.getProfile).mockResolvedValue(fakeProfile);
    const req = createMockRequest({ user: { id: "user-1" } });
    const res = createMockResponse();

    await getProfileController(req, res, vi.fn());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ data: fakeProfile });
    expect(service.getProfile).toHaveBeenCalledWith("user-1");
  });

  it("initProfileController initializes profile and returns payload", async () => {
    const service = await servicePromise;
    vi.mocked(service.initProfile).mockResolvedValue(fakeProfile);
    const req = createMockRequest({
      user: { id: "user-1" },
      body: { displayName: "Tester" },
    });
    const res = createMockResponse();

    await initProfileController(req, res, vi.fn());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ data: fakeProfile });
    expect(service.initProfile).toHaveBeenCalledWith("user-1", {
      displayName: "Tester",
    });
  });

  it("updateProfileController updates profile", async () => {
    const service = await servicePromise;
    vi.mocked(service.updateProfile).mockResolvedValue(fakeProfile);
    const req = createMockRequest({
      user: { id: "user-1" },
      body: { firstName: "John" },
    });
    const res = createMockResponse();

    await updateProfileController(req, res, vi.fn());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ data: fakeProfile });
    expect(service.updateProfile).toHaveBeenCalledWith("user-1", {
      firstName: "John",
    });
  });

  it("createAddressController creates address and returns profile", async () => {
    const service = await servicePromise;
    vi.mocked(service.createAddress).mockResolvedValue(fakeProfile);
    const payload = { line1: "123 Main St", city: "Cairo", countryCode: "EG" };
    const req = createMockRequest({
      user: { id: "user-1" },
      body: payload,
    });
    const res = createMockResponse();

    await createAddressController(req, res, vi.fn());

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ data: fakeProfile });
    expect(service.createAddress).toHaveBeenCalledWith("user-1", payload);
  });

  it("updateAddressController updates address", async () => {
    const service = await servicePromise;
    vi.mocked(service.updateAddress).mockResolvedValue(fakeProfile);
    const req = createMockRequest({
      user: { id: "user-1" },
      params: { addressId: "00000000-0000-0000-0000-000000000001" },
      body: { city: "Giza" },
    });
    const res = createMockResponse();

    await updateAddressController(req, res, vi.fn());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ data: fakeProfile });
    expect(service.updateAddress).toHaveBeenCalledWith(
      "user-1",
      "00000000-0000-0000-0000-000000000001",
      { city: "Giza" }
    );
  });

  it("deleteAddressController deletes address and returns profile", async () => {
    const service = await servicePromise;
    vi.mocked(service.deleteAddress).mockResolvedValue(fakeProfile);
    const req = createMockRequest({
      user: { id: "user-1" },
      params: { addressId: "00000000-0000-0000-0000-000000000001" },
    });
    const res = createMockResponse();

    await deleteAddressController(req, res, vi.fn());

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ data: fakeProfile });
    expect(service.deleteAddress).toHaveBeenCalledWith(
      "user-1",
      "00000000-0000-0000-0000-000000000001"
    );
  });
});
