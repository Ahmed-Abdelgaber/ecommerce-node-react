import { AppError } from "@core/errors/AppError";
import { ErrorCodes } from "@core/errors/codes";
import * as repo from "@modules/profile/profile.repo";
import * as cartRepo from "@modules/cart/cart.repo";

/* -------- Profile -------- */

export async function getProfile(userId: string) {
  const row = await repo.findProfileByUserId(userId);
  if (!row)
    throw new AppError(ErrorCodes.NOT_FOUND, "Profile not found", { userId });
  return row;
}

/** Idempotent init: make sure profile exists + activeCartId wired. */
export async function initProfile(
  userId: string,
  input: {
    displayName?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
  }
) {
  // make sure a cart exists (separate query)
  const cartId = await cartRepo.createEmptyCart(userId);

  await repo.createProfile(userId, { ...input, activeCartId: cartId });
  return await repo.findProfileByUserId(userId);
}

export async function updateProfile(
  userId: string,
  input: {
    displayName?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
  }
) {
  const existing = await repo.findProfileByUserId(userId);
  if (!existing)
    throw new AppError(ErrorCodes.NOT_FOUND, "Profile not found", { userId });

  await repo.updateProfile(userId, input);
  return await repo.findProfileByUserId(userId);
}

/* -------- Addresses -------- */

export async function createAddress(
  userId: string,
  data: {
    label?: string;
    recipientName?: string;
    phone?: string;
    company?: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    countryCode: string;
    isDefaultShipping?: boolean;
    isDefaultBilling?: boolean;
    latitude?: number;
    longitude?: number;
  }
) {
  // ensure profileId exists (create minimal profile if missing)
  let profileId = await repo.findProfileIdByUserId(userId);
  if (!profileId) {
    const cartId = await cartRepo.createEmptyCart(userId);
    await repo.createProfile(userId, { activeCartId: cartId });
    profileId = (await repo.findProfileIdByUserId(userId))!;
  }

  if (data.isDefaultShipping) await repo.clearDefaultShipping(profileId);
  if (data.isDefaultBilling) await repo.clearDefaultBilling(profileId);

  await repo.createAddress(profileId, data);
  return await repo.findProfileByUserId(userId);
}

export async function updateAddress(
  userId: string,
  addressId: string,
  data: {
    label?: string;
    recipientName?: string;
    phone?: string;
    company?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    countryCode?: string;
    isDefaultShipping?: boolean;
    isDefaultBilling?: boolean;
    latitude?: number;
    longitude?: number;
  }
) {
  const addr = await repo.getAddressWithOwner(addressId);
  if (!addr || addr.profile.userId !== userId) {
    throw new AppError(ErrorCodes.FORBIDDEN, "You cannot modify this address", {
      addressId,
    });
  }

  if (data.isDefaultShipping === true)
    await repo.clearDefaultShipping(addr.profileId);
  if (data.isDefaultBilling === true)
    await repo.clearDefaultBilling(addr.profileId);

  await repo.updateAddress(addressId, data);
  return await repo.findProfileByUserId(userId);
}

export async function deleteAddress(userId: string, addressId: string) {
  const addr = await repo.getAddressWithOwner(addressId);
  if (!addr || addr.profile.userId !== userId) {
    throw new AppError(ErrorCodes.FORBIDDEN, "You cannot modify this address", {
      addressId,
    });
  }
  await repo.deleteAddress(addressId);
  return await repo.findProfileByUserId(userId);
}
