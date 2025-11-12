import axios from "axios";
import { toast } from "react-toastify";
import { getAuthToken, isValidToken } from "../utils/authUtils";

// API Base URL
const API_BASE_URL = "https://115.124.111.111/FLS/public/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (isValidToken(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Don't throw error for login endpoint
      if (!config.url?.includes("/auth/login")) {
        toast.error("Invalid or missing session. Please login again.");
        throw new Error("Invalid or missing token");
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    // Check for 401 even in successful responses (when validateStatus is used)
    if (response.status === 401) {
      toast.error("Session expired. Please login again.");
      // Clear all auth-related sessionStorage items
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("Name");
      sessionStorage.removeItem("RoleId");
      // Use replace to prevent back button issues
      window.location.replace("/login");
      return Promise.reject(new Error("Unauthorized"));
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      toast.error("Session expired. Please login again.");
      // Clear all auth-related sessionStorage items
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("Name");
      sessionStorage.removeItem("RoleId");
      // Use replace to prevent back button issues
      window.location.replace("/login");
    } else if (error.response?.status >= 500) {
      toast.error("Server error. Please try again later.");
    } else if (error.message === "Network Error") {
      toast.error("Network error. Please check your connection.");
    }
    return Promise.reject(error);
  }
);

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: "/auth/login",
  },

  // Materials
  materials: {
    list: "/material/list",
    create: "/material/create",
    update: "/material/update",
    delete: (id) => `/material/delete/${id}`,
  },
  materialTypes: {
    list: "/material-type/list",
    create: "/material-type/create",
    edit: (id = 0) => `/material-type/edit/${id || 0}`,
  },

  // Customers/Suppliers
  customers: {
    list: "/customer/list",
    create: "/customer/create",
    update: "/customer/update",
    delete: (id) => `/customer/delete/${id}`,
    show: (id) => `/customer/show/${id}`,
    edit: (id) => `/customer/edit/${id}`,
  },

  // Supplier Groups
  supplierGroups: {
    list: "/supplier-group/list",
    create: "/supplier-group/create",
    update: "/supplier-group/update",
    delete: (id) => `/supplier-group/delete/${id}`,
    edit: (id) => `/supplier-group/edit/${id}`,
  },
  supplierMaterials: {
    list: "/supplier-material/list",
    create: "/supplier-material/create",
    update: "/supplier-material/update",
    delete: (id) => `/supplier-material/delete/${id}`,
  },

  // Options
  options: {
    getCustomers: "/options/getcustomers",
    getInwardData: (inwardId) => `/options/getinwarddata/${inwardId}`,
    dashboardCount: "/options/dashboard-count",
  },

  // Inward
  inward: {
    create: "/inward/create",
    list: "/inward/list",
  },

  // Dispatch
  dispatch: {
    create: "/dispatch/create",
    list: "/dispatch/list",
  },

  // Stock
  stock: {
    list: "/stock/list",
    adjustment: "/stock/adjustment",
    stockManagement: "/material/stock-management",
    stockAdjustment: "/material/stock-adjustment",
  },

  // Price Master
  priceMaster: {
    getCustomer: "/price-master/getcustomer",
    update: "/price-master/update",
  },

  // Users
  users: {
    list: "/auth/userlist",
    create: "/auth/register",
    update: (id) => `/auth/update_user/${id}`,
    delete: (id) => `/auth/delete_user/${id}`,
  },

  // Dashboard
  dashboard: "/dashboard",
  
  // Material Stock Management
  materialStock: "/material/stock-management",
};

// API Service Functions
export const apiService = {
  // Auth
  login: async (credentials) => {
    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.auth.login}`,
      credentials,
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  },

  // Materials
  getMaterials: async () => {
    const response = await api.get(API_ENDPOINTS.materials.list, {
      validateStatus: (s) => s < 500,
    });
    return response.data?.data || response.data?.materials || (Array.isArray(response.data) ? response.data : []);
  },

  createMaterial: async (data) => {
    const response = await api.post(API_ENDPOINTS.materials.create, data);
    return response.data;
  },

  updateMaterial: async (data) => {
    const response = await api.post(API_ENDPOINTS.materials.update, data);
    return response.data;
  },

  deleteMaterial: async (id) => {
    const response = await api.delete(API_ENDPOINTS.materials.delete(id));
    return response.data;
  },

  getMaterialTypes: async () => {
    const response = await api.get(API_ENDPOINTS.materialTypes.list, {
      validateStatus: (s) => s < 500,
    });
    return response.data?.data || [];
  },

  createMaterialType: async (materialType) => {
    const response = await api.post(
      `${API_ENDPOINTS.materialTypes.create}?material_type=${encodeURIComponent(materialType)}`
    );
    return response.data;
  },

  updateMaterialType: async (id, materialType) => {
    const response = await api.post(API_ENDPOINTS.materialTypes.edit(id), {
      material_type: materialType,
    });
    return response.data;
  },

  // Customers/Suppliers
  getCustomers: async () => {
    const response = await api.get(API_ENDPOINTS.customers.list, {
      validateStatus: (s) => s < 500,
    });
    return response.data?.data || response.data?.customers || response.data?.list || (Array.isArray(response.data) ? response.data : []);
  },

  getCustomersOptions: async () => {
    const response = await api.get(API_ENDPOINTS.options.getCustomers, {
      validateStatus: (s) => s < 500,
    });
    return response.data?.data || response.data?.customers || response.data?.list || (Array.isArray(response.data) ? response.data : []);
  },

  createCustomer: async (formData) => {
    const response = await api.post(API_ENDPOINTS.customers.create, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateCustomer: async (formData) => {
    const response = await api.post(API_ENDPOINTS.customers.update, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  deleteCustomer: async (id) => {
    const response = await api.delete(API_ENDPOINTS.customers.delete(id));
    return response.data;
  },

  getCustomer: async (id) => {
    const response = await api.get(API_ENDPOINTS.customers.show(id));
    return response.data;
  },

  editCustomer: async (id) => {
    const response = await api.get(API_ENDPOINTS.customers.edit(id));
    return response.data;
  },

  // Supplier Groups
  getSupplierGroups: async () => {
    const response = await api.get(API_ENDPOINTS.supplierGroups.list);
    return response.data?.data || [];
  },

  createSupplierGroup: async (formData) => {
    const response = await api.post(API_ENDPOINTS.supplierGroups.create, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateSupplierGroup: async (formData) => {
    const response = await api.post(API_ENDPOINTS.supplierGroups.update, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  deleteSupplierGroup: async (id) => {
    const response = await api.delete(API_ENDPOINTS.supplierGroups.delete(id));
    return response.data;
  },

  getSupplierGroup: async (id) => {
    const response = await api.get(API_ENDPOINTS.supplierGroups.edit(id));
    return response.data;
  },

  getSupplierMaterials: async (groupId) => {
    const response = await api.get(`${API_ENDPOINTS.supplierMaterials.list}?supplier_group_id=${groupId}`);
    return response.data?.data || [];
  },

  createSupplierMaterial: async (formData) => {
    const response = await api.post(API_ENDPOINTS.supplierMaterials.create, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateSupplierMaterial: async (formData) => {
    const response = await api.post(API_ENDPOINTS.supplierMaterials.update, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  deleteSupplierMaterial: async (id) => {
    const response = await api.delete(API_ENDPOINTS.supplierMaterials.delete(id));
    return response.data;
  },

  // Inward
  createInward: async (formData) => {
    const response = await api.post(API_ENDPOINTS.inward.create, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  getInwardData: async (inwardId) => {
    const response = await api.get(API_ENDPOINTS.options.getInwardData(inwardId));
    return response.data?.data || response.data;
  },

  // Dispatch
  createDispatch: async (formData) => {
    const response = await api.post(API_ENDPOINTS.dispatch.create, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Stock
  getStock: async () => {
    const response = await api.get(API_ENDPOINTS.stock.list);
    return response.data;
  },

  stockAdjustment: async (data) => {
    const response = await api.post(API_ENDPOINTS.stock.adjustment, data);
    return response.data;
  },

  // Price Master
  getPriceMasterCustomer: async () => {
    const response = await api.get(API_ENDPOINTS.priceMaster.getCustomer);
    return response.data;
  },

  updatePriceMaster: async (data) => {
    const response = await api.post(API_ENDPOINTS.priceMaster.update, data);
    return response.data;
  },

  // Users
  getUsers: async () => {
    const response = await api.get(API_ENDPOINTS.users.list);
    return response.data;
  },

  createUser: async (data) => {
    const response = await api.post(API_ENDPOINTS.users.create, data);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await api.put(API_ENDPOINTS.users.update(id), data);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(API_ENDPOINTS.users.delete(id));
    return response.data;
  },

  // Dashboard
  getDashboardData: async () => {
    const response = await api.get(API_ENDPOINTS.dashboard);
    return response.data;
  },

  getDashboardCount: async () => {
    const response = await api.get(API_ENDPOINTS.options.dashboardCount);
    return response.data || {};
  },

  // Material Stock Management
  getMaterialStock: async () => {
    const response = await api.get(API_ENDPOINTS.materialStock);
    return response.data?.data || [];
  },

  // Stock Adjustment
  updateStockAdjustment: async (data) => {
    const response = await api.post(API_ENDPOINTS.stock.stockAdjustment, data);
    return response.data;
  },
};

export default api;

