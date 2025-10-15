import { dbPublic as db } from "@db/prisma";

/* ---------- Profile ---------- */

export async function findProfileByUserId(userId: string) {
  return db.profile.findUnique({
    where: { userId },
    include: {
      addresses: {
        orderBy: [
          { isDefaultShipping: "desc" },
          { isDefaultBilling: "desc" },
          { creationDate: "desc" },
        ],
      },
      activeCart: { select: { id: true } },
    },
  });
}

export async function findProfileIdByUserId(userId: string) {
  const row = await db.profile.findUnique({
    where: { userId },
    select: { id: true },
  });
  return row?.id ?? null;
}

export async function createProfile(
  userId: string,
  data: {
    displayName?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
    activeCartId?: string | null;
  }
) {
  return db.profile.create({
    data: {
      userId,
      displayName: data.displayName,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      avatarUrl: data.avatarUrl,
      activeCartId: data.activeCartId ?? null,
    },
  });
}

export async function updateProfile(
  userId: string,
  data: {
    displayName?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
  }
) {
  return db.profile.update({
    where: { userId },
    data,
  });
}

export async function setActiveCartId(userId: string, cartId: string) {
  return db.profile.update({
    where: { userId },
    data: { activeCartId: cartId },
    select: { id: true, activeCartId: true },
  });
}

/* ---------- Address ---------- */

export async function getAddressWithOwner(addressId: string) {
  return db.address.findUnique({
    where: { id: addressId },
    select: {
      id: true,
      profileId: true,
      profile: { select: { userId: true } },
    },
  });
}

export async function createAddress(
  profileId: string,
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
  return db.address.create({
    data: {
      profileId,
      label: data.label,
      recipientName: data.recipientName,
      phone: data.phone,
      company: data.company,
      line1: data.line1,
      line2: data.line2,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      countryCode: data.countryCode.toUpperCase(),
      isDefaultShipping: !!data.isDefaultShipping,
      isDefaultBilling: !!data.isDefaultBilling,
      latitude: data.latitude as any,
      longitude: data.longitude as any,
    },
    select: { id: true },
  });
}

export async function updateAddress(
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
  return db.address.update({
    where: { id: addressId },
    data: {
      ...data,
      ...(data.countryCode
        ? { countryCode: data.countryCode.toUpperCase() }
        : {}),
    },
  });
}

export async function deleteAddress(addressId: string) {
  await db.address.update({
    where: { id: addressId },
    data: { deleteFlag: true },
  });
}

/* mirrors for “one default per profile” — non-atomic (by design here) */
export async function clearDefaultShipping(profileId: string) {
  await db.address.updateMany({
    where: { profileId, isDefaultShipping: true },
    data: { isDefaultShipping: false },
  });
}

export async function clearDefaultBilling(profileId: string) {
  await db.address.updateMany({
    where: { profileId, isDefaultBilling: true },
    data: { isDefaultBilling: false },
  });
}

export async function setDefaultShipping(id: string) {
  await db.address.updateMany({
    where: { id },
    data: { isDefaultShipping: true },
  });
}

export async function setDefaultBilling(id: string) {
  await db.address.updateMany({
    where: { id },
    data: { isDefaultBilling: true },
  });
}
