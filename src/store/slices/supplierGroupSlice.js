import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../services/api";
import { toast } from "react-toastify";

// Async thunks
export const fetchSupplierGroups = createAsyncThunk(
  "supplierGroups/fetchSupplierGroups",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiService.getSupplierGroups();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load supplier groups");
    }
  }
);

export const fetchSupplierMaterials = createAsyncThunk(
  "supplierGroups/fetchSupplierMaterials",
  async (groupId, { rejectWithValue }) => {
    try {
      const data = await apiService.getSupplierMaterials(groupId);
      return { groupId, materials: Array.isArray(data) ? data : [] };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load supplier materials");
    }
  }
);

export const createSupplierGroup = createAsyncThunk(
  "supplierGroups/createSupplierGroup",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await apiService.createSupplierGroup(formData);
      toast.success("Supplier group created successfully");
      return response;
    } catch (error) {
      toast.error("Failed to create supplier group");
      return rejectWithValue(error.message || "Failed to create supplier group");
    }
  }
);

export const updateSupplierGroup = createAsyncThunk(
  "supplierGroups/updateSupplierGroup",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await apiService.updateSupplierGroup(formData);
      toast.success("Supplier group updated successfully");
      return response;
    } catch (error) {
      toast.error("Failed to update supplier group");
      return rejectWithValue(error.message || "Failed to update supplier group");
    }
  }
);

export const deleteSupplierGroup = createAsyncThunk(
  "supplierGroups/deleteSupplierGroup",
  async (id, { rejectWithValue }) => {
    try {
      await apiService.deleteSupplierGroup(id);
      toast.success("Supplier group deleted successfully");
      return id;
    } catch (error) {
      toast.error("Failed to delete supplier group");
      return rejectWithValue(error.message || "Failed to delete supplier group");
    }
  }
);

export const createSupplierMaterial = createAsyncThunk(
  "supplierGroups/createSupplierMaterial",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await apiService.createSupplierMaterial(formData);
      toast.success("Material added successfully");
      return response;
    } catch (error) {
      toast.error("Failed to add material");
      return rejectWithValue(error.message || "Failed to add material");
    }
  }
);

export const updateSupplierMaterial = createAsyncThunk(
  "supplierGroups/updateSupplierMaterial",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await apiService.updateSupplierMaterial(formData);
      toast.success("Material updated successfully");
      return response;
    } catch (error) {
      toast.error("Failed to update material");
      return rejectWithValue(error.message || "Failed to update material");
    }
  }
);

export const deleteSupplierMaterial = createAsyncThunk(
  "supplierGroups/deleteSupplierMaterial",
  async (id, { rejectWithValue }) => {
    try {
      await apiService.deleteSupplierMaterial(id);
      toast.success("Material deleted successfully");
      return id;
    } catch (error) {
      toast.error("Failed to delete material");
      return rejectWithValue(error.message || "Failed to delete material");
    }
  }
);

const initialState = {
  groups: [],
  materials: {},
  loading: false,
  error: null,
};

const supplierGroupSlice = createSlice({
  name: "supplierGroups",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMaterials: (state) => {
      state.materials = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch supplier groups
      .addCase(fetchSupplierGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSupplierGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload;
      })
      .addCase(fetchSupplierGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch supplier materials
      .addCase(fetchSupplierMaterials.fulfilled, (state, action) => {
        state.materials[action.payload.groupId] = action.payload.materials;
      })
      // Create supplier group
      .addCase(createSupplierGroup.fulfilled, (state) => {
        // Refresh groups list
      })
      // Update supplier group
      .addCase(updateSupplierGroup.fulfilled, (state) => {
        // Refresh groups list
      })
      // Delete supplier group
      .addCase(deleteSupplierGroup.fulfilled, (state, action) => {
        state.groups = state.groups.filter((g) => g.id !== action.payload);
      })
      // Delete supplier material
      .addCase(deleteSupplierMaterial.fulfilled, (state, action) => {
        Object.keys(state.materials).forEach((groupId) => {
          state.materials[groupId] = state.materials[groupId].filter(
            (m) => m.id !== action.payload
          );
        });
      });
  },
});

export const { clearError, clearMaterials } = supplierGroupSlice.actions;
export default supplierGroupSlice.reducer;

