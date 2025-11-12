import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../services/api";
import { toast } from "react-toastify";

// Async thunks
export const fetchPriceMasterCustomer = createAsyncThunk(
  "priceMaster/fetchPriceMasterCustomer",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getPriceMasterCustomer();
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load price master data");
    }
  }
);

export const updatePriceMaster = createAsyncThunk(
  "priceMaster/updatePriceMaster",
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.updatePriceMaster(data);
      toast.success("Price updated successfully");
      return response;
    } catch (error) {
      toast.error("Failed to update price");
      return rejectWithValue(error.message || "Failed to update price");
    }
  }
);

const initialState = {
  customers: [],
  loading: false,
  error: null,
};

const priceMasterSlice = createSlice({
  name: "priceMaster",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPriceMasterCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPriceMasterCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = Array.isArray(action.payload) ? action.payload : action.payload?.data || [];
      })
      .addCase(fetchPriceMasterCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = priceMasterSlice.actions;
export default priceMasterSlice.reducer;

