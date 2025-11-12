import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../services/api";
import { toast } from "react-toastify";

// Async thunks
export const createDispatch = createAsyncThunk(
  "dispatch/createDispatch",
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiService.createDispatch(data);
      toast.success("Dispatch created successfully!");
      return response;
    } catch (error) {
      toast.error("Failed to save dispatch");
      return rejectWithValue(error.message || "Failed to save dispatch");
    }
  }
);

const initialState = {
  loading: false,
  error: null,
};

const dispatchSlice = createSlice({
  name: "dispatch",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createDispatch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDispatch.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createDispatch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = dispatchSlice.actions;
export default dispatchSlice.reducer;

