import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../services/api";
import { toast } from "react-toastify";

// Async thunks
export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiService.getCustomers();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load customers");
    }
  }
);

export const fetchCustomersOptions = createAsyncThunk(
  "customers/fetchCustomersOptions",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiService.getCustomersOptions();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load customers");
    }
  }
);

export const createCustomer = createAsyncThunk(
  "customers/createCustomer",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await apiService.createCustomer(formData);
      toast.success("Customer created successfully");
      return response;
    } catch (error) {
      toast.error("Failed to create customer");
      return rejectWithValue(error.message || "Failed to create customer");
    }
  }
);

export const updateCustomer = createAsyncThunk(
  "customers/updateCustomer",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await apiService.updateCustomer(formData);
      toast.success("Customer updated successfully");
      return response;
    } catch (error) {
      toast.error("Failed to update customer");
      return rejectWithValue(error.message || "Failed to update customer");
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  "customers/deleteCustomer",
  async (id, { rejectWithValue }) => {
    try {
      await apiService.deleteCustomer(id);
      toast.success("Customer deleted successfully");
      return id;
    } catch (error) {
      toast.error("Failed to delete customer");
      return rejectWithValue(error.message || "Failed to delete customer");
    }
  }
);

export const getCustomer = createAsyncThunk(
  "customers/getCustomer",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiService.getCustomer(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to get customer");
    }
  }
);

const initialState = {
  customers: [],
  customersOptions: [],
  selectedCustomer: null,
  loading: false,
  error: null,
};

const customerSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch customers
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch customers options
      .addCase(fetchCustomersOptions.fulfilled, (state, action) => {
        state.customersOptions = action.payload;
      })
      // Create customer
      .addCase(createCustomer.fulfilled, (state) => {
        // Refresh customers list
      })
      // Update customer
      .addCase(updateCustomer.fulfilled, (state) => {
        // Refresh customers list
      })
      // Delete customer
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.customers = state.customers.filter((c) => c.id !== action.payload);
      })
      // Get customer
      .addCase(getCustomer.fulfilled, (state, action) => {
        state.selectedCustomer = action.payload;
      });
  },
});

export const { clearError, clearSelectedCustomer } = customerSlice.actions;
export default customerSlice.reducer;

