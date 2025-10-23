import { useState, useContext, useEffect } from "react";
import { MaterialContext } from "../../contexts/MaterialContext";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import React, { useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { getAuthToken, isValidToken, handleAuthError } from "../../utils/authUtils";
import useAuth from "../../hooks/useAuth";

// API Base URL and endpoints
const API_BASE_URL = "https://115.124.111.111/FLS/public/api";
const API_ENDPOINTS = {
  list: `${API_BASE_URL}/material/list`,
  create: `${API_BASE_URL}/material/create`,
  edit: (id) => `${API_BASE_URL}/material/edit/${id}`,
  update: `${API_BASE_URL}/material/update`,
  delete: (id) => `${API_BASE_URL}/material/delete/${id}`
};

// Create axios instance with interceptors
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (!token) {
      console.error('No auth token available');
      throw new Error('Authentication required');
    }

    if (!isValidToken(token)) {
      console.error('Invalid token format');
      throw new Error('Invalid authentication token');
    }

    config.headers.Authorization = `Bearer ${token}`;
    console.log('Request:', { url: config.url, method: config.method, headers: config.headers });
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response:', { url: response.config.url, status: response.status, data: response.data });
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    if (error.response?.status === 401) {
      console.log('Unauthorized access - clearing token');
      handleAuthError();
      return Promise.reject(new Error('Session expired. Please login again.'));
    }
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(new Error('Network error'));
    }
    const errorMessage = error.response?.data?.message || 'An error occurred';
    toast.error(errorMessage);
    return Promise.reject(error);
  }
);

const MaterialMaster = () => {
  const { isAuthenticated, handleAuthError } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    material_name: "",
    material_code: "",
    default_price: "",
    material_type: "",
    weight: ""
  });

  const inputRefs = useRef([]);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const token = getAuthToken();
      if (!isValidToken(token)) {
        console.log('No valid token found on mount');
        handleAuthError();
        return;
      }
      try {
        await fetchMaterials();
      } catch (error) {
        console.error('Initial fetch failed:', error);
      }
    };
    checkAuthAndFetch();
  }, []);

const fetchMaterials = async () => {
  try {
    setLoading(true);
    const token = sessionStorage.getItem("authToken");
    if (!token || token === "undefined" || token === "null") {
      toast.error("Session expired. Please login again.");
      sessionStorage.removeItem("authToken");
      window.location.href = "/login";
      return;
    }

    // Single fetch without looping
    const response = await axiosInstance.get(`${API_ENDPOINTS.list}`, {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: (status) => status < 500,
    });

    const resData = response.data;
    const allMaterials = resData?.data || resData?.materials || resData?.list || (Array.isArray(resData) ? resData : []);

    if (allMaterials.length > 0) {
      console.log("✅ All materials fetched:", allMaterials);
      setMaterials(allMaterials);
    } else {
      toast.warn("No materials found.");
      setMaterials([]);
    }
  } catch (error) {
    console.error("❌ Fetch error:", error);
    toast.error("Error fetching materials.");
  } finally {
    setLoading(false);
  }
};


  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputRefs.current[index + 1]) inputRefs.current[index + 1].focus();
      else document.getElementById("saveMaterialBtn")?.focus();
    }
  };

  const generateMaterialCode = () => {
    const maxCode = materials.reduce((max, material) => {
      const codeNum = parseInt(material.material_code?.replace('MAT', '') || '0');
      return Math.max(max, codeNum);
    }, 0);
    return `MAT${String(maxCode + 1).padStart(3, "0")}`;
  };

  const handleNewMaterial = () => {
    setEditingMaterial(null);
    setFormData({
      material_name: "",
      material_code: generateMaterialCode(),
      default_price: "",
      material_type: "",
      weight: "",
    });
    setShowModal(true);
  };

const handleEditMaterial = async (material) => {
  try {
    const token = getAuthToken();
    if (!isValidToken(token)) {
      toast.error("Session expired. Please login again.");
      handleAuthError();
      return;
    }

    const response = await axiosInstance.get(API_ENDPOINTS.edit(material.id), {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: (status) => status < 500,
    });

    console.log("Full Edit API response:", response);

    // Safely parse the API response
    const responseData = typeof response.data === "string" ? JSON.parse(response.data) : response.data;
    const apiData = responseData?.data || responseData?.material || responseData || {};

    if (!apiData || Object.keys(apiData).length === 0) {
      toast.error("Material details not found in API response");
      return;
    }

    setFormData({
      material_name: apiData.material_name || "",
      material_code: apiData.material_code || "",
      default_price: apiData.default_price || "",
      material_type: apiData.material_type || "",
      weight: apiData.weight || "",
    });

    setEditingMaterial(material);
    setShowModal(true);
  } catch (error) {
    console.error("Error fetching material details:", error);
    if (axios.isAxiosError(error)) {
      if (error.response) toast.error(error.response.data?.message || "Failed to fetch material details");
      else if (error.request) toast.error("No response from server. Please try again.");
      else toast.error(error.message || "Error fetching material details");
    } else toast.error("Unexpected error occurred. Please try again.");
  }
};
const handleSaveMaterial = async () => {
  try {
    setLoading(true);

    // Validation
    if (!formData.material_name?.trim()) return toast.error("Material Name is required");
    if (!formData.material_type?.trim()) return toast.error("Material Type is required");
    if (!formData.default_price) return toast.error("Default Price is required");

    const materialData = {
      material_name: formData.material_name.trim(),
      material_code: formData.material_code.trim(),
      material_type: formData.material_type,
      default_price: parseFloat(formData.default_price),
      weight: formData.weight ? parseFloat(formData.weight) : null
    };

    let response;

    if (editingMaterial) {
      // Update existing material
      materialData.id = editingMaterial.id;
      response = await axiosInstance.post(API_ENDPOINTS.update, materialData);

      if (response.data?.status === "success") {
        toast.success("Material updated successfully");
        // Update local state without refetching entire list
        setMaterials(prev =>
          prev.map(m => (m.id === editingMaterial.id ? { ...m, ...materialData } : m))
        );
        setShowModal(false);
      } else {
        toast.error(response.data?.message || "Failed to update material");
      }

    } else {
      // Create new material
      response = await axiosInstance.post(API_ENDPOINTS.create, materialData);

      if (response.data?.status === "success") {
        toast.success("Material created successfully");
        // Add new material to local state immediately
        const newMaterial = response.data?.data || materialData;
        setMaterials(prev => [...prev, newMaterial]);
        setShowModal(false);
      } else {
        toast.error(response.data?.message || "Failed to create material");
      }
    }

  } catch (error) {
    console.error("Error saving material:", error);
    toast.error(error.message || "Error saving material. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const deleteMaterial = async (id) => {
    if (!window.confirm("Are you sure you want to delete this material?")) return;
    try {
      const token = getAuthToken();
      if (!isValidToken(token)) { toast.error("Session expired. Please login again."); handleAuthError(); return; }
      const response = await axiosInstance.delete(API_ENDPOINTS.delete(id));
      if (response.data?.status === "success") { toast.success("Material deleted successfully"); fetchMaterials(); }
      else toast.error(response.data?.message || "Failed to delete material");
    } catch (error) { console.error("Error deleting material:", error); toast.error("Error deleting material. Please try again."); }
  };

  const exportPDF = () => {
    if (!materials.length) return alert("No materials to export.");
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Material Master", doc.internal.pageSize.getWidth() / 2, 15, { align: "center" });
    autoTable(doc, {
      startY: 25,
      head: [["Code", "Name", "Price", "Type"]],
      body: materials.map((m) => [m.material_code, m.material_name, m.default_price, m.material_type]),
      theme: "grid",
      styles: { halign: "center", fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] },
      margin: { left: 20, right: 20 },
      tableWidth: "auto",
    });
    doc.save("MaterialMaster.pdf");
  };

  const exportExcel = () => {
    if (!materials.length) return alert("No materials to export.");
    const data = materials.map((m) => ({
      "Material Code": m.material_code,
      "Material Name": m.material_name,
      "Default Price": m.default_price,
      "Material Type": m.material_type,
      "Weight": m.weight
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Materials");
    XLSX.writeFile(workbook, "MaterialMaster.xlsx");
  };

  const handlePrint = () => {
    if (!materials.length) return alert("No materials to print.");
    const table = document.getElementById("material-table");
    if (!table) return;
    const cloneTable = table.cloneNode(true);
    const headerRow = cloneTable.querySelector("thead tr");
    if (headerRow) headerRow.removeChild(headerRow.lastElementChild);
    cloneTable.querySelectorAll("tbody tr").forEach((row) => row.removeChild(row.lastElementChild));
    const printWindow = window.open("", "", "width=900,height=600");
    printWindow.document.write(`<html><head><title>Material Master</title><style>body{font-family:Arial,sans-serif;margin:20px}table{width:100%;border-collapse:collapse;font-size:13px}th,td{border:1px solid #ddd;padding:4px;text-align:center}th{background:#16a085;color:#fff}</style></head><body>`);
    printWindow.document.write(cloneTable.outerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  const formatPrice = (price) => (typeof price === 'number' ? price.toFixed(2) : price);

  const filteredMaterials = materials.filter((m) =>
    String(m.material_name || '').toLowerCase().includes(search.toLowerCase()) ||
    String(m.material_code || '').toLowerCase().includes(search.toLowerCase()) ||
    String(m.default_price || '').toLowerCase().includes(search.toLowerCase()) ||
    String(m.material_type || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mt-0">
      {/* Toolbar */}
      <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap px-2">
        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-sm btn-success py-1 px-2 d-flex align-items-center" style={{ borderRadius: "8px", fontSize: "13px" }} onClick={handleNewMaterial}>
            <span className="material-icons-two-tone me-1" style={{ fontSize: "12px" }}>add</span>New
          </button>
          <button className="btn btn-sm btn-danger py-1 px-2 d-flex align-items-center" style={{ borderRadius: "8px", fontSize: "13px" }} onClick={exportPDF}>
            <span className="material-icons-two-tone me-1" style={{ fontSize: "14px" }}>picture_as_pdf</span>PDF
          </button>
          <button className="btn btn-sm text-white py-1 px-2 d-flex align-items-center" style={{ backgroundColor: "#1D6F42", borderColor: "#1D6F42", borderRadius: "8px", fontSize: "13px" }} onClick={exportExcel}>
            <span className="material-icons-two-tone me-1" style={{ fontSize: "14px" }}>grid_on</span>Excel
          </button>
          <button className="btn btn-sm btn-primary py-1 px-2 d-flex align-items-center" style={{ borderRadius: "8px", fontSize: "13px" }} onClick={handlePrint}>
            <span className="material-icons-two-tone me-1" style={{ fontSize: "14px" }}>print</span>Print
          </button>
        </div>
        <div style={{ width: "250px" }}>
          <input type="text" className="form-control form-control-sm" placeholder="🔍 Search material..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ borderRadius: "8px" }} />
        </div>
      </div>

      {/* Table */}
<div className="table-responsive">
  <table
    id="material-table"
    className="table table-bordered table-striped align-middle"
    style={{ fontSize: "12px" }}
  >
    <thead className="table-primary" style={{ fontSize: "12px" }}>
      <tr className="text-center">
        <th className="py-1 px-1">Material Code</th>
        <th className="py-1 px-1">Material Name</th>
        <th className="py-1 px-1">Default Price</th>
        <th className="py-1 px-1">Material Type</th>
        <th className="py-1 px-1" style={{ minWidth: "140px" }}>Action</th>
      </tr>
    </thead>

    <tbody style={{ lineHeight: "1.1" }}>
      {loading ? (
        <tr>
          <td colSpan="5" className="text-center py-2">
            <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            Loading materials...
          </td>
        </tr>
      ) : filteredMaterials.length > 0 ? (
        filteredMaterials.map((material) => (
          <tr key={material.id} className="text-center" style={{ fontSize: "12px", lineHeight: "1.1" }}>
            <td className="py-0 px-1 align-middle">{material.material_code}</td>
            <td className="py-0 px-1 align-middle">{material.material_name}</td>
            <td className="py-0 px-1 align-middle">{formatPrice(material.default_price)}</td>
            <td className="py-0 px-1 align-middle">{material.material_type}</td>

            <td className="py-0 px-1 align-middle text-center">
              {/* Edit button */}
              <button
                className="btn btn-sm p-0 me-1"
                style={{ background: "transparent", border: "none", padding: 0 }}
                title="Edit"
                onClick={() => handleEditMaterial(material)}
              >
                <span
                  className="material-icons-two-tone text-warning"
                  style={{ fontSize: "15px", verticalAlign: "middle", cursor: "pointer" }}
                >
                  edit
                </span>
              </button>

              {/* Delete button */}
              <button
                className="btn btn-sm p-0"
                style={{ background: "transparent", border: "none", padding: 0 }}
                title="Delete"
                onClick={() => deleteMaterial(material.id)}
              >
                <span
                  className="material-icons-two-tone text-danger"
                  style={{ fontSize: "15px", verticalAlign: "middle", cursor: "pointer" }}
                >
                  delete
                </span>
              </button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="5" className="text-center text-muted" style={{ fontSize: "11px", padding: "2px 0" }}>
            No materials found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

      {/* Modal */}
     {showModal && (
  <div className="modal fade show d-block" tabIndex="-1">
    <div className="modal-dialog modal-sm"> {/* ✅ smaller width */}
      <div className="modal-content" style={{ fontSize: "13px" }}> {/* ✅ reduced font */}
        
        {/* Header */}
        <div className="modal-header py-2">
          <h6 className="modal-title"> {/* ✅ smaller title */}
            {editingMaterial ? "Edit Material" : "New Material"}
          </h6>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowModal(false)}
            style={{ fontSize: "10px" }}
          ></button>
        </div>

        {/* Body */}
        <div className="modal-body p-2">
          <div className="mb-2">
            <label className="form-label" style={{ fontSize: "12px" }}>
              Material Name
            </label>
          <input
  type="text"
  className="form-control form-control-sm"
  placeholder="Material Name"
  value={formData.material_name || ''} // ✅ matches state
  onChange={(e) =>
    setFormData({ ...formData, material_name: e.target.value }) // ✅ update same key
  }
  ref={(el) => (inputRefs.current[0] = el)}
  onKeyDown={(e) => handleKeyDown(e, 0)}
/>

          </div>
          
<div className="mb-2">
  <label className="form-label" style={{ fontSize: "12px" }}>
    Default Price
  </label>
  <input
    type="text"
    className="form-control form-control-sm"
    placeholder="Default Price"
    value={formData.default_price || ''}   // ✅ use snake_case
    onKeyDown={(e) => {
      const char = e.key;
      const allowedChars = "0123456789";
      const controlKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter"];

      if (controlKeys.includes(char)) {
        if (char === "Enter") {
          e.preventDefault();
          const nextIndex = 2; // move focus to Weight field
          if (inputRefs.current[nextIndex]) {
            inputRefs.current[nextIndex].focus();
          }
        }
        return;
      }

      if (char === "." && !e.target.value.includes(".")) return;

      if (!allowedChars.includes(char)) e.preventDefault();
    }}
    onChange={(e) =>
      setFormData({ ...formData, default_price: e.target.value })  // ✅ update snake_case
    }
    ref={(el) => (inputRefs.current[1] = el)}
  />
</div>

<div className="mb-2">
  <label className="form-label" style={{ fontSize: "12px" }}>
    Weight
  </label>
  <input
    type="text"   // ✅ use text so key filtering works
    className="form-control form-control-sm"
    placeholder="Enter weight"
    value={formData.weight}
    onKeyDown={(e) => {
      const char = e.key;
      const allowedchars = "0123456789";
      const controlKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter"];

      if (controlKeys.includes(char)) {
        // ✅ handle Enter navigation
        if (char === "Enter") {
          e.preventDefault();
          const nextIndex = 3; // move focus to Material Type (next select box)
          if (inputRefs.current[nextIndex]) {
            inputRefs.current[nextIndex].focus();
          }
        }
        return;
      }

      // ✅ allow one decimal point
      if (char === "." && !e.target.value.includes(".")) return;

      // ❌ block everything else
      if (!allowedchars.includes(char)) {
        e.preventDefault();
      }
    }}
    onChange={(e) =>
      setFormData({ ...formData, weight: e.target.value })
    }
    ref={(el) => (inputRefs.current[2] = el)}
  />
</div>

          <div className="mb-2">
            <label className="form-label" style={{ fontSize: "12px" }}>
              Material Type
            </label>
          <select
  className="form-select form-select-sm"
  value={formData.material_type || ""} // ✅ matches formData key
  onChange={(e) =>
    setFormData({ ...formData, material_type: e.target.value }) // ✅ update same key
  }
  ref={(el) => (inputRefs.current[2] = el)} // ✅ index should follow the order of inputs: 0=Name, 1=Default Price, 2=Material Type
  onKeyDown={(e) => handleKeyDown(e, 2)} // ✅ Enter moves to next input/button
>
  <option value="">Select Type</option>   {/* placeholder */}
  <option value="Bedsheet">Bedsheet</option>
  <option value="Towel">Towel</option>
</select>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer py-2">
          <button
            id="saveMaterialBtn"
            className="btn btn-primary btn-sm"
            onClick={handleSaveMaterial}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                {editingMaterial ? "Updating..." : "Adding..."}
              </>
            ) : (
              editingMaterial ? "Update" : "Add"
            )}
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowModal(false)}
            disabled={loading}
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default MaterialMaster;
