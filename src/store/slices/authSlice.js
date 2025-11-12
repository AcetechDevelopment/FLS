import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../services/api";
import { toast } from "react-toastify";

// Async thunks
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiService.login(credentials);
      const token =
        response?.token ||
        response?.access_token ||
        response?.data?.token ||
        response?.data?.access_token;
      const user = response?.user || response?.data?.user;

      if (token && user) {
        sessionStorage.setItem("authToken", token);
        sessionStorage.setItem("Name", user?.name || "");
        const encodedRoleId = btoa(user?.role_id ?? "");
        sessionStorage.setItem("RoleId", encodedRoleId);
        return { token, user };
      } else {
        return rejectWithValue("Invalid login credentials");
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  sessionStorage.removeItem("authToken");
  sessionStorage.removeItem("Name");
  sessionStorage.removeItem("RoleId");
});

// Safe function to get token from sessionStorage
const getInitialToken = () => {
  try {
    return sessionStorage.getItem("authToken") || null;
  } catch {
    return null;
  }
};

const initialState = {
  token: getInitialToken(),
  user: null,
  isAuthenticated: !!getInitialToken(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        toast.success("Login successful!");
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || "Login failed");
      })
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;

