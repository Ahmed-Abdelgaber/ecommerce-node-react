import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cart/cartSlice";
import wishlistReducer from "./wishlist/wishlistSlice";

export function createStore(preloadedState) {
  return configureStore({
    reducer: {
      cart: cartReducer,
      wishlist: wishlistReducer,
    },
    devTools: import.meta.env.MODE !== "production",
    preloadedState,
  });
}

export const store = createStore();

export function setupStore(preloadedState) {
  return createStore(preloadedState);
}

export function getStoreState() {
  return store.getState();
}
