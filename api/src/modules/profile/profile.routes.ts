import { Router } from "express";
import { authGuard } from "@app/middlewares/authGuard";
import validate from "@app/http/validator";
import {
  ProfileInitBodySchema,
  ProfileUpdateBodySchema,
  AddressCreateBodySchema,
  AddressUpdateBodySchema,
  AddressIdParamSchema,
} from "@modules/profile/profile.schema";
import {
  getProfileController,
  initProfileController,
  updateProfileController,
  createAddressController,
  updateAddressController,
  deleteAddressController,
} from "@modules/profile/profile.controller";

const router = Router();

// all profile routes require auth
router.use(authGuard);

/* Profile */
router.get("/", getProfileController);
router.post(
  "/init",
  validate(ProfileInitBodySchema, "body"),
  initProfileController
);
router.patch(
  "/",
  validate(ProfileUpdateBodySchema, "body"),
  updateProfileController
);

/* Addresses */
router.post(
  "/addresses",
  validate(AddressCreateBodySchema, "body"),
  createAddressController
);
router.patch(
  "/addresses/:addressId",
  validate(AddressIdParamSchema, "params"),
  validate(AddressUpdateBodySchema, "body"),
  updateAddressController
);
router.delete(
  "/addresses/:addressId",
  validate(AddressIdParamSchema, "params"),
  deleteAddressController
);

export default router;
