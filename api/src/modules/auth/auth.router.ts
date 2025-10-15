import { Router } from "express";
import validate from "@app/http/validator";
import { RegisterSchema, SigninSchema } from "@modules/auth/auth.schemas";
import {
  registerHandler,
  signinHandler,
  refreshHandler,
  logoutHandler,
} from "@modules/auth/auth.controller";

const router = Router();
router.post("/register", validate(RegisterSchema), registerHandler);
router.post("/signin", validate(SigninSchema), signinHandler);
router.post("/refresh", refreshHandler); // uses refresh_token cookie + CSRF header
router.post("/logout", logoutHandler);
export default router;
