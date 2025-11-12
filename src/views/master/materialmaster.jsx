import React, { useState, useEffect, useCallback, useMemo, Fragment } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";
import { exportTableToPDF, exportTableToExcel, printTable } from "../../utils/exportUtils";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import Loading from "../../components/Loading";
import {
  fetchMaterials,
  fetchMaterialTypes,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from "../../store/slices/materialSlice";
import { fetchCustomersOptions } from "../../store/slices/customerSlice";
import api from "../../services/api";

// ===============================
// MODAL COMPONENT
// ===============================
const MaterialModal = ({
  visible,
  onClose,
  onSave,
  saving,
  customers,
  materialTypes,
  formData,
  setFormData,
  selectedCustomerId,
  setSelectedCustomerId,
  selectedTypeId,
  setSelectedTypeId,
  refreshMaterialTypes,
  dispatch,
}) => {
  if (!visible) return null;

  return (
    <>
      <div className="modal fade show d-block" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content" style={{ fontSize: "13px" }}>
            <div className="modal-header py-2">
              <h6 className="modal-title">{formData?.isEditing ? "Edit Material" : "Add Material"}</h6>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body p-2" style={{ maxHeight: "320px", overflowY: "auto" }}>
              {/* Customer */}
              <div className="mb-2">
                <label className="form-label">Customer</label>
                <select
                  className="form-select form-select-sm"
                  value={selectedCustomerId || ""}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                >
                  <option value="">-- Select Customer --</option>
                  {(customers || []).map((c) => (
                    <option key={c?.id} value={c?.id}>
                      {c?.customer_name || c?.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Material Code (read-only when editing if you want) */}
              {formData?.isEditing && (
                <div className="mb-2">
                  <label className="form-label">Material Code</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={formData?.material_id || ""}
                    onChange={(e) => setFormData((p) => ({ ...p, material_id: e.target.value }))}
                  />
                </div>
              )}

              {/* Name */}
              <div className="mb-2">
                <label className="form-label">Material Name</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={formData?.material_name || ""}
                  onChange={(e) => setFormData((p) => ({ ...p, material_name: e.target.value }))}
                />
              </div>

              {/* Default Price */}
              <div className="mb-2">
                <label className="form-label">Default Price</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={formData?.default_price ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^\d*\.?\d*$/.test(v)) {
                      setFormData((p) => ({ ...p, default_price: v }));
                    }
                  }}
                />
              </div>

              {/* Weight */}
              <div className="mb-2">
                <label className="form-label">Weight</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={formData?.weight ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^\d*\.?\d*$/.test(v)) {
                      setFormData((p) => ({ ...p, weight: v }));
                    }
                  }}
                />
              </div>

              {/* Material Type with inline add/edit */}
              <div className="mb-2">
                <label className="form-label">Material Type</label>
                <div className="d-flex gap-2">
                  <select
                    className="form-select form-select-sm flex-grow-1"
                    value={formData?.material_type || ""}
                    onChange={(e) => {
                      const opt = e.target.selectedOptions?.[0];
                      const typeId = opt ? opt.getAttribute("data-id") : null;
                      setSelectedTypeId(typeId);
                      setFormData((prev) => ({
                        ...prev,
                        material_type: e.target.value,
                      }));
                    }}
                  >
                    <option value="">-- Select Type --</option>
                    {(materialTypes || []).map((type) => (
                      <option key={type?.id} value={type?.material_type} data-id={type?.id}>
                        {type?.material_type}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    title={selectedTypeId ? "Update Material Type" : "Add New Material Type"}
                    onClick={async () => {
                      const currentTypeName = selectedTypeId 
                        ? materialTypes.find((t) => String(t?.id) === String(selectedTypeId))?.material_type || ""
                        : "";
                      
                      const input = window.prompt(
                        selectedTypeId 
                          ? `Update Material Type name:\n(Current: ${currentTypeName})` 
                          : "Enter new Material Type name:",
                        currentTypeName
                      );
                      const trimmed = (input || "").trim();
                      if (!trimmed) return;

                      try {
                        let res;
                        if (selectedTypeId) {
                          // Update existing material type
                          res = await api.post(`/material-type/edit/${selectedTypeId}`, {
                            material_type: trimmed,
                          });
                        } else {
                          // Create new material type
                          res = await api.post(`/material-type/create?material_type=${encodeURIComponent(trimmed)}`);
                        }
                        const ok =
                          (res.data?.message || "").toLowerCase().includes("success") ||
                          res.data?.status === "success";
                        if (ok) {
                          toast.success(selectedTypeId ? "Material Type updated" : "Material Type added");
                          await refreshMaterialTypes();
                          setFormData((prev) => ({ ...prev, material_type: trimmed }));
                          // Clear selectedTypeId after adding new type
                          if (!selectedTypeId) {
                            setSelectedTypeId(null);
                          }
                        } else {
                          toast.error("Failed to save Material Type");
                        }
                      } catch (err) {
                        toast.error("Error saving material type");
                      }
                    }}
                  >
                    {selectedTypeId ? "✎" : "+"}
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer py-2">
              <button className="btn btn-sm btn-secondary" onClick={onClose}>
                Close
              </button>
              <button className="btn btn-sm btn-primary" onClick={onSave} disabled={!!saving}>
                {saving ? "Saving..." : formData?.isEditing ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

// ===============================
// MAIN COMPONENT
// ===============================
const MaterialMaster = () => {
  const dispatch = useAppDispatch();
  const { materials = [], materialTypes = [], loading = false } = useAppSelector((state) => state?.materials || {});
  const { customersOptions = [] } = useAppSelector((state) => state?.customers || {});

  const [formData, setFormData] = useState({
    id: "",
    material_name: "",
    material_id: "",
    default_price: "",
    material_type: "",
    weight: "",
    isEditing: false,
  });

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  const [selectedTypeId, setSelectedTypeId] = useState(null);

  // ===============================
  // Initial Load
  // ===============================
  useEffect(() => {
    dispatch(fetchCustomersOptions());
    dispatch(fetchMaterialTypes());
    dispatch(fetchMaterials());
  }, [dispatch]);

  useEffect(() => {
    if (customersOptions.length > 0) {
      setCustomers(customersOptions);
    }
  }, [customersOptions]);

  // ===============================
  // Handlers
  // ===============================
  const handleNew = () => {
    setFormData({
      id: "",
      material_name: "",
      material_id: "",
      default_price: "",
      material_type: "",
      weight: "",
      isEditing: false,
    });
    setSelectedCustomerId("");
    setSelectedTypeId(null);
    setShowModal(true);
  };

  const handleEdit = (m) => {
    setFormData({
      id: m?.id || "",
      material_name: m?.material_name || "",
      material_id: m?.material_id || "",
      default_price: m?.default_price?.toString?.() || "",
      material_type: m?.material_type || "",
      weight: m?.weight?.toString?.() || "",
      isEditing: true,
    });
    setSelectedCustomerId(m?.customer_id || "");
    setSelectedTypeId(null);
    setShowModal(true);
  };

  const handleSave = useCallback(async () => {
    if (saving) return;

    if (
      !formData?.material_name?.trim() ||
      !formData?.default_price?.toString()?.trim() ||
      !formData?.material_type?.trim() ||
      !selectedCustomerId
    ) {
      toast.error("Please fill all required fields including customer.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: formData?.id || undefined,
        material_name: formData?.material_name?.trim(),
        material_id: formData?.material_id?.trim(),
        default_price: formData?.default_price === "" ? null : Number(formData.default_price),
        material_type: formData?.material_type?.trim(),
        weight: formData?.weight === "" ? null : Number(formData.weight),
        customer_id: selectedCustomerId,
      };

      if (formData?.isEditing) {
        await dispatch(updateMaterial(payload));
      } else {
        await dispatch(createMaterial(payload));
      }
      
      await dispatch(fetchMaterials());
      setShowModal(false);
    } catch (err) {
      toast.error("Failed to save material");
    } finally {
      setSaving(false);
    }
  }, [formData, saving, selectedCustomerId, dispatch]);

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm("Delete this material?")) return;
      try {
        await dispatch(deleteMaterial(id));
        await dispatch(fetchMaterials());
      } catch (err) {
        toast.error("Failed to delete material");
      }
    },
    [dispatch]
  );

  // ===============================
  // Filter + Exports
  // ===============================
  const filteredMaterials = useMemo(() => {
    const q = (search || "").toLowerCase();
    return (materials || []).filter((m) => {
      const name = m?.material_name?.toLowerCase?.() || "";
      const code = m?.material_id?.toLowerCase?.() || "";
      const price = (m?.default_price ?? "").toString();
      const type = m?.material_type?.toLowerCase?.() || "";
      const customerName =
        m?.customer_name ||
        customers.find((c) => String(c?.id) === String(m?.customer_id))?.customer_name ||
        "";
      return (
        name.includes(q) ||
        code.includes(q) ||
        price.includes(q) ||
        type.includes(q) ||
        customerName.toLowerCase().includes(q)
      );
    });
  }, [materials, customers, search]);

  const exportPDF = () => {
    const headers = ["Code", "Customer", "Name", "Price", "Type", "Weight"];
    const rows = (materials || []).map((m) => [
      m?.material_id ?? "",
      m?.customer_name ||
        customers.find((c) => String(c?.id) === String(m?.customer_id))?.customer_name ||
        "",
      m?.material_name ?? "",
      m?.default_price ?? "",
      m?.material_type ?? "",
      m?.weight ?? "",
    ]);
    exportTableToPDF({
      title: "Material Master",
      filename: "MaterialMaster.pdf",
      headers,
      rows,
    });
  };

  const exportExcel = () => {
    const headers = ["Material Code", "Customer", "Material Name", "Default Price", "Material Type", "Weight"];
    const rows = (materials || []).map((m) => [
      m?.material_id ?? "",
      m?.customer_name ||
        customers.find((c) => String(c?.id) === String(m?.customer_id))?.customer_name ||
        "",
      m?.material_name ?? "",
      m?.default_price ?? "",
      m?.material_type ?? "",
      m?.weight ?? "",
    ]);
    exportTableToExcel({
      filename: "MaterialMaster.xlsx",
      sheetName: "Materials",
      headers,
      rows,
    });
  };

  const handlePrint = () => {
    const headers = ["Code", "Customer", "Name", "Price", "Type", "Weight"];
    const rows = (filteredMaterials || []).map((m) => [
      m?.material_id ?? "",
      m?.customer_name ||
        customers.find((c) => String(c?.id) === String(m?.customer_id))?.customer_name ||
        "",
      m?.material_name ?? "",
      m?.default_price ?? "",
      m?.material_type ?? "",
      m?.weight ?? "",
    ]);
    printTable({
      title: "Material Master",
      headers,
      rows,
    });
  };

  // ===============================
  // Render
  // ===============================
  return (
    <Fragment>
      <div className="page-container">
        <div className="main-container">
          <div className="container-fluid p-3" id="material-container" tabIndex="-1">
            {/* Toolbar */}
            <div className="d-flex flex-wrap gap-2 mb-2 px-2">
              <button
                className="btn btn-sm btn-success py-1 px-2 d-flex align-items-center"
                style={{ borderRadius: "8px", fontSize: "13px" }}
                onClick={handleNew}
              >
                <span className="material-icons-two-tone me-1" style={{ fontSize: "12px" }}>
                  add
                </span>
                New
              </button>

              <button
                className="btn btn-sm btn-danger py-1 px-2 d-flex align-items-center"
                style={{ borderRadius: "8px", fontSize: "13px" }}
                onClick={exportPDF}
              >
                <span className="material-icons-two-tone me-1" style={{ fontSize: "14px" }}>
                  picture_as_pdf
                </span>
                PDF
              </button>

              <button
                className="btn btn-sm text-white py-1 px-2 d-flex align-items-center"
                style={{
                  backgroundColor: "#1D6F42",
                  borderColor: "#1D6F42",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
                onClick={exportExcel}
              >
                <span className="material-icons-two-tone me-1" style={{ fontSize: "14px" }}>
                  grid_on
                </span>
                Excel
              </button>

              <button
                className="btn btn-sm btn-primary py-1 px-2 d-flex align-items-center"
                style={{ borderRadius: "8px", fontSize: "13px" }}
                onClick={handlePrint}
              >
                <span className="material-icons-two-tone me-1" style={{ fontSize: "14px" }}>
                  print
                </span>
                Print
              </button>

              <div className="ms-auto">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  style={{ width: 260 }}
                  placeholder="Search by name, code, type, price, customer…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Table */}
            <div
              className="table-responsive"
              style={{
                border: "1.5px solid #2f2f2f",
                borderRadius: "4px",
                overflow: "hidden",
                backgroundColor: "#fff",
              }}
            >
              <table
                id="material-table"
                className="table align-middle mb-0 text-center"
                style={{
                  fontSize: "11px",
                  width: "100%",
                  borderCollapse: "collapse",
                  tableLayout: "fixed",
                }}
              >
                <thead
                  style={{
                    backgroundColor: "#e3f0fd",
                    color: "#000",
                    fontWeight: "700",
                  }}
                >
                  <tr>
                    {["Code", "Customer", "Name", "Price", "Type", "Weight", "Action"].map((h, i) => (
                      <th
                        key={i}
                        style={{
                          padding: "6px 5px",
                          border: "1.5px solid #2f2f2f",
                          textAlign: "center",
                          verticalAlign: "middle",
                          background: "#e3f0fd",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {loading || materials.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        style={{
                          textAlign: "center",
                          color: "#0d6efd",
                          fontSize: "12px",
                          padding: "10px",
                          border: "1.5px solid #2f2f2f",
                          fontWeight: "600",
                        }}
                      >
                        <Loading message="Loading materials..." inline />
                      </td>
                    </tr>
                  ) : filteredMaterials.length ? (
                    filteredMaterials.map((m, index) => {
                      const custName =
                        m?.customer_name ||
                        customers.find((c) => String(c?.id) === String(m?.customer_id))?.customer_name ||
                        "";
                      return (
                        <tr
                          key={m?.id ?? `${m?.material_id}-${m?.material_name}`}
                          style={{
                            backgroundColor: index % 2 === 0 ? "#ffffff" : "#f6f8fa",
                            transition: "background-color 0.15s ease-in-out",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e0ebff")}
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#ffffff" : "#f6f8fa")
                          }
                        >
                          <td style={{ padding: "4px 5px", border: "1.5px solid #2f2f2f" }}>{m?.material_id}</td>
                          <td style={{ padding: "4px 5px", border: "1.5px solid #2f2f2f" }}>{custName}</td>
                          <td style={{ padding: "4px 5px", border: "1.5px solid #2f2f2f" }}>{m?.material_name}</td>
                          <td style={{ padding: "4px 5px", border: "1.5px solid #2f2f2f" }}>{m?.default_price}</td>
                          <td style={{ padding: "4px 5px", border: "1.5px solid #2f2f2f" }}>{m?.material_type}</td>
                          <td style={{ padding: "4px 5px", border: "1.5px solid #2f2f2f" }}>{m?.weight}</td>
                          <td style={{ padding: "4px 5px", border: "1.5px solid #2f2f2f" }}>
                            <button
                              className="btn btn-sm p-0 me-2"
                              style={{ background: "transparent", border: "none" }}
                              onClick={() => handleEdit(m)}
                              title="Edit"
                            >
                              <span
                                className="material-icons-two-tone"
                                style={{ fontSize: "12px", color: "#ffc107", cursor: "pointer" }}
                              >
                                edit
                              </span>
                            </button>
                            <button
                              className="btn btn-sm p-0"
                              style={{ background: "transparent", border: "none" }}
                              onClick={() => handleDelete(m?.id)}
                              title="Delete"
                            >
                              <span
                                className="material-icons-two-tone"
                                style={{ fontSize: "12px", color: "#dc3545", cursor: "pointer" }}
                              >
                                delete
                              </span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : !loading ? (
                    <tr>
                      <td
                        colSpan="7"
                        style={{
                          textAlign: "center",
                          color: "#6c757d",
                          fontSize: "10px",
                          padding: "6px",
                          border: "1.5px solid #2f2f2f",
                          fontWeight: "500",
                        }}
                      >
                        No materials found
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            {/* Modal */}
            <MaterialModal
              visible={showModal}
              onClose={() => setShowModal(false)}
              onSave={handleSave}
              saving={saving}
              customers={customers}
              materialTypes={materialTypes}
              formData={formData}
              setFormData={setFormData}
              selectedCustomerId={selectedCustomerId}
              setSelectedCustomerId={setSelectedCustomerId}
              selectedTypeId={selectedTypeId}
              setSelectedTypeId={setSelectedTypeId}
              refreshMaterialTypes={() => dispatch(fetchMaterialTypes())}
              dispatch={dispatch}
            />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default MaterialMaster;
