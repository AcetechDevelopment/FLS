import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { MaterialContext } from "../../contexts/MaterialContext";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import axios from "axios";
import { toast } from "react-toastify";
import { getAuthToken, isValidToken } from "../../utils/authUtils";
import useAuth from "../../hooks/useAuth";

// ✅ API Configuration
const API_BASE_URL = "https://115.124.111.111/FLS/public/api";
const API_ENDPOINTS = {
  list: "/material/list",
  create: "/material/create",
  update: "/material/update",
  delete: (id) => `/material/delete/${id}`,
  customerMaterials: (customerId) => `/material/customer/${customerId}`,
  customers: "/options/getcustomers",
};

// ✅ Axios Instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (!isValidToken(token)) throw new Error("Invalid or missing token");
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      toast.error("Session expired. Please login again.");
    } else if (!error.response) {
      toast.error("Network error. Check your connection.");
    } else {
      toast.error(error.response.data?.message || "Server error");
    }
    return Promise.reject(error);
  }
);

const MaterialMaster = () => {
  const { materials, setMaterials } = useContext(MaterialContext);
  const { handleAuthError } = useAuth();

  const [formData, setFormData] = useState({
    material_name: "",
    material_id: "",
    default_price: "",
    material_type: "",
    weight: "",
  });

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customers, setCustomers] = useState([]);
  const inputRefs = useRef([]);

  // ✅ Fetch Materials
  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(API_ENDPOINTS.list);
      const data = res.data?.data || res.data?.materials || [];
      setMaterials(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load materials");
    } finally {
      setLoading(false);
    }
  }, [setMaterials]);

  // ✅ Fetch Customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(API_ENDPOINTS.customers);
        let data = [];

        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (Array.isArray(response.data?.data)) {
          data = response.data.data;
        } else if (Array.isArray(response.data?.customers)) {
          data = response.data.customers;
        }

        setCustomers(data);
        if (data.length === 0) toast.warn("No customers found");
      } catch (error) {
        console.error("Error fetching customers:", error);
        toast.error("Failed to load customers");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // ✅ Fetch materials on mount
  useEffect(() => {
    const token = getAuthToken();
    if (!isValidToken(token)) return handleAuthError();
    if (!materials.length) fetchMaterials();
  }, [fetchMaterials, handleAuthError, materials.length]);

  // ✅ Handlers
  const handleNew = useCallback(() => {
    setEditingMaterial(null);
    setFormData({
      material_name: "",
      material_id: "",
      default_price: "",
      material_type: "",
      weight: "",
    });
    setSelectedCustomerId("");
    setShowModal(true);
  }, []);

  const handleEdit = useCallback((mat) => {
    setFormData({
      material_name: mat.material_name || "",
      material_id: mat.material_id || "",
      default_price: mat.default_price || "",
      material_type: mat.material_type || "",
      weight: mat.weight || "",
    });
    setSelectedCustomerId(mat.customer_id || "");
    setEditingMaterial(mat);
    setShowModal(true);
  }, []);

const handleSave = useCallback(async () => {
  if (saving) return;
  if (
    !formData.material_name ||
    !formData.default_price ||
    !formData.material_type ||
    !selectedCustomerId
  ) {
    toast.error("Please fill all required fields including customer");
    return;
  }

  setSaving(true);
  try {
    const endpoint = editingMaterial
      ? API_ENDPOINTS.update
      : API_ENDPOINTS.create;

    const payload = editingMaterial
      ? { ...formData, id: editingMaterial.id, customer_id: selectedCustomerId }
      : { ...formData, customer_id: selectedCustomerId };

    const res = await axiosInstance.post(endpoint, payload);

    if (res.data?.message?.toLowerCase().includes("success")) {
      toast.success(
        `Material ${editingMaterial ? "updated" : "created"} successfully`
      );

      // ✅ Fix: Update customer instantly in table
      const updatedCustomer =
        customers.find((c) => c.id == selectedCustomerId)?.customer_name ||
        customers.find((c) => c.id == selectedCustomerId)?.name ||
        "";

      if (editingMaterial) {
        // Update that record in local state immediately
        setMaterials((prev) =>
          prev.map((m) =>
            m.id === editingMaterial.id
              ? {
                  ...m,
                  ...formData,
                  customer_id: selectedCustomerId,
                  customer_name: updatedCustomer,
                }
              : m
          )
        );
      } else {
        // If it's a new material, refetch all
        await fetchMaterials();
      }

      setShowModal(false);
    } else {
      toast.error("Failed to save material");
    }
  } catch (err) {
    console.error("Save failed:", err);
    toast.error("Save failed");
  } finally {
    setSaving(false);
  }
}, [
  formData,
  editingMaterial,
  fetchMaterials,
  saving,
  selectedCustomerId,
  customers,
]);
  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm("Delete this material?")) return;
      try {
        await axiosInstance.delete(API_ENDPOINTS.delete(id));
        toast.success("Material deleted");
        fetchMaterials();
      } catch (err) {
        toast.error("Delete failed");
      }
    },
    [fetchMaterials]
  );

  // ✅ Memoized Filter
  const filteredMaterials = useMemo(() => {
    const q = search.toLowerCase();
    return materials.filter(
      (m) =>
        m.material_name?.toLowerCase().includes(q) ||
        m.material_id?.toLowerCase().includes(q) ||
        m.default_price?.toString().includes(q) ||
        m.material_type?.toLowerCase().includes(q)
    );
  }, [materials, search]);

  // ✅ Export PDF & Excel
  const exportPDF = () => {
    if (!materials.length) return toast.info("No materials to export.");
    const doc = new jsPDF();
    doc.text("Material Master", doc.internal.pageSize.getWidth() / 2, 15, {
      align: "center",
    });
    autoTable(doc, {
      startY: 25,
      head: [["Code", "Customer", "Name", "Price", "Type"]],
      body: materials.map((m) => [
        m.material_id,
        m.customer_name ||
          customers.find((c) => c.id == m.customer_id)?.customer_name ||
          "",
        m.material_name,
        m.default_price,
        m.material_type,
      ]),
    });
    doc.save("MaterialMaster.pdf");
  };

  const exportExcel = () => {
    if (!materials.length) return toast.info("No materials to export.");
    const ws = XLSX.utils.json_to_sheet(
      materials.map((m) => ({
        "Material Code": m.material_id,
        Customer:
          m.customer_name ||
          customers.find((c) => c.id == m.customer_id)?.customer_name ||
          "",
        "Material Name": m.material_name,
        "Default Price": m.default_price,
        "Material Type": m.material_type,
        Weight: m.weight,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Materials");
    XLSX.writeFile(wb, "MaterialMaster.xlsx");
  };

  const handlePrint = () => {
    const table = document.getElementById("data-table");
    if (!table) return alert("No data table found to print.");
    const printWindow = window.open("", "", "width=900,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h2 { text-align: center; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
            th { background-color: #0d6efd; color: white; }
          </style>
        </head>
        <body>
          <h2>Data List</h2>
          ${table.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  // ✅ Render
  return (
    <div className="container mt-0">
      {/* Toolbar */}
      <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap px-2">
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-success" onClick={handleNew}>
            + New
          </button>
          <button className="btn btn-sm btn-danger" onClick={exportPDF}>
            PDF
          </button>
          <button className="btn btn-sm btn-success" onClick={exportExcel}>
            Excel
          </button>
          <button className="btn btn-sm btn-primary" onClick={handlePrint}>
            Print
          </button>
        </div>
        <input
          type="text"
          className="form-control form-control-sm"
          style={{ width: 250 }}
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table
          id="data-table"
          className="table table-bordered table-striped table-sm text-center align-middle"
        >
          <thead className="table-primary">
            <tr>
              <th>Code</th>
              <th>Customer</th>
              <th>Name</th>
              <th>Price</th>
              <th>Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6">Loading...</td>
              </tr>
            ) : filteredMaterials.length ? (
              filteredMaterials.map((m) => (
                <tr key={m.id}>
                  <td>{m.material_id}</td>
                  <td>
                    {m.customer_name ||
                      customers.find((c) => c.id == m.customer_id)
                        ?.customer_name ||
                      ""}
                  </td>
                  <td>{m.material_name}</td>
                  <td>{m.default_price}</td>
                  <td>{m.material_type}</td>
                  <td>
                    <button
                      className="btn btn-sm text-warning p-0 me-1"
                      onClick={() => handleEdit(m)}
                    >
                      ✎
                    </button>
                    <button
                      className="btn btn-sm text-danger p-0"
                      onClick={() => handleDelete(m.id)}
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-muted">
                  No materials found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block">
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-header py-2">
                <h6>{editingMaterial ? "Edit Material" : "New Material"}</h6>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div className="modal-body p-2">
                {/* Customer Dropdown */}
              <div>
  <label className="form-label">Select Customer</label>
  <select
    className="form-select form-select-sm"
    value={selectedCustomerId}
    onChange={(e) => setSelectedCustomerId(e.target.value)}
  >
    <option value="">Select</option>
    {customers.map((cust) => (
      <option key={cust.id} value={cust.id}>
        {cust.customer_name || cust.name}
      </option>
    ))}
  </select>
</div>

                {/* Material Fields */}
                {["material_name", "default_price", "weight"].map((field, i) => (
                  <div className="mb-2" key={field}>
                    <label className="form-label text-capitalize">
                      {field.replace("_", " ")}
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={formData[field]}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numericFields = ["default_price", "weight"];
                        if (numericFields.includes(field)) {
                          if (/^\d*\.?\d*$/.test(value))
                            setFormData({ ...formData, [field]: value });
                        } else {
                          setFormData({ ...formData, [field]: value });
                        }
                      }}
                      ref={(el) => (inputRefs.current[i] = el)}
                    />
                  </div>
                ))}

                {/* Material Type Dropdown */}
                <div>
                  <label className="form-label">Material Type</label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.material_type}
                    onChange={(e) =>
                      setFormData({ ...formData, material_type: e.target.value })
                    }
                  >
                    <option value="">Select</option>
                    <option value="Bedsheet">Bedsheet</option>
                    <option value="Towel">Towel</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer py-2">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : editingMaterial ? "Update" : "Add"}
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowModal(false)}
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
