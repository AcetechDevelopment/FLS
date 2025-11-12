import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiService } from "../../services/api";
import { toast } from "react-toastify";

// Async thunks
export const fetchMaterials = createAsyncThunk(
  "materials/fetchMaterials",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiService.getMaterials();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load materials");
    }
  }
);

export const fetchMaterialTypes = createAsyncThunk(
  "materials/fetchMaterialTypes",
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiService.getMaterialTypes();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return rejectWithValue(error.message || "Failed to load material types");
    }
  }
);

export const createMaterial = createAsyncThunk(
  "materials/createMaterial",
  async (materialData, { rejectWithValue }) => {
    try {
      const response = await apiService.createMaterial(materialData);
      toast.success("Material created successfully");
      return response;
    } catch (error) {
      toast.error("Failed to create material");
      return rejectWithValue(error.message || "Failed to create material");
    }
  }
);

export const updateMaterial = createAsyncThunk(
  "materials/updateMaterial",
  async (materialData, { rejectWithValue }) => {
    try {
      const response = await apiService.updateMaterial(materialData);
      toast.success("Material updated successfully");
      return response;
    } catch (error) {
      toast.error("Failed to update material");
      return rejectWithValue(error.message || "Failed to update material");
    }
  }
);

export const deleteMaterial = createAsyncThunk(
  "materials/deleteMaterial",
  async (id, { rejectWithValue }) => {
    try {
      await apiService.deleteMaterial(id);
      toast.success("Material deleted successfully");
      return id;
    } catch (error) {
      toast.error("Failed to delete material");
      return rejectWithValue(error.message || "Failed to delete material");
    }
  }
);

const initialState = {
  materials: [],
  materialTypes: [],
  customers: [],
  loading: false,
  error: null,
};

const materialSlice = createSlice({
  name: "materials",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch materials
      .addCase(fetchMaterials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        state.loading = false;
        state.materials = action.payload;
      })
      .addCase(fetchMaterials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch material types
      .addCase(fetchMaterialTypes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMaterialTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.materialTypes = action.payload;
      })
      .addCase(fetchMaterialTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create material
      .addCase(createMaterial.fulfilled, (state) => {
        // Refresh materials list
      })
      // Update material
      .addCase(updateMaterial.fulfilled, (state) => {
        // Refresh materials list
      })
      // Delete material
      .addCase(deleteMaterial.fulfilled, (state, action) => {
        state.materials = state.materials.filter((m) => m.id !== action.payload);
      });
  },
});

export const { clearError } = materialSlice.actions;
export default materialSlice.reducer;

