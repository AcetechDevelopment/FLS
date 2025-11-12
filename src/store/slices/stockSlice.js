import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../services/api";
import { toast } from "react-toastify";

// Async thunks
export const fetchStock = createAsyncThunk(
  "stock/fetchStock",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiService.getStock();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load stock");
    }
  }
);

export const stockAdjustment = createAsyncThunk(
  "stock/stockAdjustment",
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.stockAdjustment(data);
      toast.success("Stock adjustment saved successfully");
      return response;
    } catch (error) {
      toast.error("Failed to save stock adjustment");
      return rejectWithValue(error.message || "Failed to save stock adjustment");
    }
  }
);

const initialState = {
  stock: [],
  loading: false,
  error: null,
};

const stockSlice = createSlice({
  name: "stock",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStock.fulfilled, (state, action) => {
        state.loading = false;
        state.stock = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(stockAdjustment.fulfilled, (state) => {
        // Refresh stock list
      });
  },
});

export const { clearError } = stockSlice.actions;
export default stockSlice.reducer;

