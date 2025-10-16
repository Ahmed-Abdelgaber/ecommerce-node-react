import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  status: "idle",
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    upsertItem: (state, action) => {
      const item = action.payload;
      if (!item || !item.id) return;
      const existingIndex = state.items.findIndex((entry) => entry.id === item.id);
      if (existingIndex >= 0) {
        state.items[existingIndex] = { ...state.items[existingIndex], ...item };
      } else {
        state.items.push({ ...item });
      }
    },
    removeItem: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter((item) => item.id !== id);
    },
    clearCart: (state) => {
      state.items = [];
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
  },
});

export const { upsertItem, removeItem, clearCart, setStatus } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartStatus = (state) => state.cart.status;
export const selectCartCount = (state) => state.cart.items.length;

export default cartSlice.reducer;
