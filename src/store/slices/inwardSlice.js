import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../services/api";
import { toast } from "react-toastify";

// Async thunks
export const createInward = createAsyncThunk(
  "inward/createInward",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await apiService.createInward(formData);
      toast.success("Inward saved successfully!");
      return response;
    } catch (error) {
      toast.error("Failed to save inward");
      return rejectWithValue(error.message || "Failed to save inward");
    }
  }
);

export const getInwardData = createAsyncThunk(
  "inward/getInwardData",
  async (inwardId, { rejectWithValue }) => {
    try {
      const data = await apiService.getInwardData(inwardId);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to get inward data");
    }
  }
);

const initialState = {
  inwardData: null,
  loading: false,
  error: null,
};

const inwardSlice = createSlice({
  name: "inward",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearInwardData: (state) => {
      state.inwardData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create inward
      .addCase(createInward.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInward.fulfilled, (state, action) => {
        state.loading = false;
        state.inwardData = action.payload;
      })
      .addCase(createInward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get inward data
      .addCase(getInwardData.pending, (state) => {
        state.loading = true;
      })
      .addCase(getInwardData.fulfilled, (state, action) => {
        state.loading = false;
        state.inwardData = action.payload;
      })
      .addCase(getInwardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearInwardData } = inwardSlice.actions;
export default inwardSlice.reducer;

