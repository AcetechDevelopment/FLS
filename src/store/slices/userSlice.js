import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../services/api";
import { toast } from "react-toastify";

// Async thunks
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getUsers();
      const data = response?.data || response || [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load users");
    }
  }
);

export const createUser = createAsyncThunk(
  "users/createUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiService.createUser(userData);
      toast.success("User created successfully");
      return response;
    } catch (error) {
      toast.error("Failed to create user");
      return rejectWithValue(error.message || "Failed to create user");
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateUser(id, userData);
      toast.success("User updated successfully");
      return response;
    } catch (error) {
      toast.error("Failed to update user");
      return rejectWithValue(error.message || "Failed to update user");
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await apiService.deleteUser(id);
      toast.success("User deleted successfully");
      return id;
    } catch (error) {
      toast.error("Failed to delete user");
      return rejectWithValue(error.message || "Failed to delete user");
    }
  }
);

const initialState = {
  users: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createUser.fulfilled, (state) => {
        // Refresh users list
      })
      .addCase(updateUser.fulfilled, (state) => {
        // Refresh users list
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;

