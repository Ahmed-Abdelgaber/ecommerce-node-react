import { Router } from "express";
import authRouter from "@modules/auth/auth.router";
import productRouter from "@modules/product/product.routes";
import cartRouter from "@modules/cart/cart.routes";
import profileRouter from "@modules/profile/profile.routes";
import orderRouter from "@modules/order/order.router";

const api = Router();
api.use("/auth", authRouter);
api.use("/products", productRouter);
api.use("/cart", cartRouter);
api.use("/orders", orderRouter);
api.use("/profile", profileRouter);
export default api;
