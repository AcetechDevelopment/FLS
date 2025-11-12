import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import materialSlice from "./slices/materialSlice";
import customerSlice from "./slices/customerSlice";
import supplierGroupSlice from "./slices/supplierGroupSlice";
import inwardSlice from "./slices/inwardSlice";
import dispatchSlice from "./slices/dispatchSlice";
import stockSlice from "./slices/stockSlice";
import userSlice from "./slices/userSlice";
import priceMasterSlice from "./slices/priceMasterSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    materials: materialSlice,
    customers: customerSlice,
    supplierGroups: supplierGroupSlice,
    inward: inwardSlice,
    dispatch: dispatchSlice,
    stock: stockSlice,
    users: userSlice,
    priceMaster: priceMasterSlice,
  },
});

