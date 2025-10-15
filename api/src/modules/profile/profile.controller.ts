import handle from "@app/http/handle";
import { created, ok } from "@app/http/response";
import * as service from "@modules/profile/profile.service";

/* Profile */

export const getProfileController = handle(async (req, res) => {
  const userId = (req as any).user.id as string;
  const data = await service.getProfile(userId);
  ok(res, data);
});

export const initProfileController = handle(async (req, res) => {
  const userId = (req as any).user.id as string;
  const body = req.body as {
    displayName?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
  };
  const data = await service.initProfile(userId, body || {});
  ok(res, data);
});

export const updateProfileController = handle(async (req, res) => {
  const userId = (req as any).user.id as string;
  const body = req.body as {
    displayName?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
  };
  const data = await service.updateProfile(userId, body);
  ok(res, data);
});

/* Addresses */

export const createAddressController = handle(async (req, res) => {
  const userId = (req as any).user.id as string;
  const body = req.body as any;
  const data = await service.createAddress(userId, body);
  created(res, data);
});

export const updateAddressController = handle(async (req, res) => {
  const userId = (req as any).user.id as string;
  const { addressId } = req.params as { addressId: string };
  const body = req.body as any;
  const data = await service.updateAddress(userId, addressId, body);
  ok(res, data);
});

export const deleteAddressController = handle(async (req, res) => {
  const userId = (req as any).user.id as string;
  const { addressId } = req.params as { addressId: string };
  const data = await service.deleteAddress(userId, addressId);
  ok(res, data);
});
