import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";
import { apiService } from "../../services/api";
import Loading from "../../components/Loading";

const SupplierGroup = () => {
  const [groups, setGroups] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    supplier_name: "",
    description: "",
    groupMembers: [],
  });

  const [materialForm, setMaterialForm] = useState({
    material_id: "",
    weight: "",
    price: "",
  });

  const [search, setSearch] = useState("");
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);

  const inputRefs = useRef([]);

  // Handle Enter focus
  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextIndex = index + 1;
      if (inputRefs.current[nextIndex]) inputRefs.current[nextIndex].focus();
    }
  };

  // -------------------- API --------------------
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const responseData = await apiService.getSupplierGroups();
      const normalized = responseData.map((g) => {
        let supplier_items = [];
        try {
          supplier_items =
            typeof g.supplier_items === "string"
              ? JSON.parse(g.supplier_items)
              : g.supplier_items || [];
        } catch {
          supplier_items = [];
        }
        return {
          id: g.id,
          supplier_name: g.supplier_name || "",
          description: g.description || "",
          supplier_items,
        };
      });
      setGroups(normalized);
    } catch (err) {
      toast.error("Failed to load supplier groups");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await apiService.getCustomers();
      setCustomers(data.map((c) => ({ id: c.id, name: c.customer_name })));
    } catch (err) {
      toast.error("Failed to load customers");
    }
  };

  const fetchMaterialsList = async () => {
    try {
      const data = await apiService.getMaterials();
      setMaterialsList(
        data.map((m) => ({
          id: m.id,
          name: m.name || m.material_name || "",
        }))
      );
    } catch (err) {
      toast.error("Failed to load materials list");
    }
  };

  const fetchMaterialsByGroup = async (groupId) => {
    try {
      // Try with query parameter first, fallback to client-side filtering
      const allMaterials = await apiService.getSupplierMaterials(groupId);
      
      // If query parameter doesn't work, filter client-side
      // Check if response already filtered or needs client-side filtering
      const filtered = allMaterials
        .filter((m) => {
          // Try supplier_group_id first, then fallback to supplier_id if needed
          if (m.supplier_group_id !== undefined) {
            return Number(m.supplier_group_id) === Number(groupId);
          }
          // Fallback: if API doesn't support query param, filter by supplier_id
          // Note: This might not be correct if supplier_id != supplier_group_id
          return Number(m.supplier_id) === Number(groupId);
        })
        .map((item) => {
          // Use material_id from response if available, otherwise find by name
          let material_id = item.material_id;
          if (!material_id && item.material_name) {
            const matchedMaterial = materialsList.find(
              (m) => m.name === item.material_name
            );
            material_id = matchedMaterial?.id || null;
          }
          
          return {
            id: item.id,
            material_id: material_id || null,
            material_name: item.material_name || "Unknown",
            weight: item.weight,
            price: item.price,
          };
        });
      setMaterials(filtered);
    } catch (err) {
      toast.error("Failed to load materials");
    }
  };

  // -------------------- CRUD --------------------
  const handleSaveGroup = async () => {
    if (!formData.supplier_name.trim()) {
      return toast.error("Group name is required");
    }

    try {
      const isEdit = Boolean(editingGroup);
      const endpoint = isEdit
        ? "/supplier-group/update"
        : "/supplier-group/create";

      const fd = new FormData();
      if (isEdit) fd.append("id", editingGroup.id);
      fd.append("supplier_name", formData.supplier_name.trim());

      const supplierId = sessionStorage.getItem("supplier_id") || 1;
      fd.append("supplier_id", supplierId);

      formData.groupMembers.forEach((id, index) => {
        fd.append(`customer_id[${index}]`, id);
      });

      const res = isEdit
        ? await apiService.updateSupplierGroup(fd)
        : await apiService.createSupplierGroup(fd);

      if (
        res.status === "success" ||
        res.success === true ||
        res.message?.toLowerCase().includes("success") ||
        res.message?.toLowerCase().includes("stored")
      ) {
        toast.success(res.message || (isEdit ? "Group updated successfully" : "Group created successfully"));
        fetchGroups();
        setShowModal(false);
        setEditingGroup(null);
        setFormData({ supplier_name: "", description: "", groupMembers: [] });
      } else {
        toast.error(res.message || "Failed to save group");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save group");
    }
  };

  const deleteGroup = async (id) => {
    if (!window.confirm("Delete this group?")) return;
    try {
      const res = await apiService.deleteSupplierGroup(id);
      if (
        res.status === "success" ||
        res.success === true ||
        res.message?.toLowerCase().includes("success")
      ) {
        toast.success(res.message || "Group deleted successfully");
        fetchGroups();
      } else {
        toast.error(res.message || "Failed to delete group");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete group");
    }
  };

  const handleAddMaterial = async () => {
    if (!materialForm.material_id || !materialForm.weight || !materialForm.price)
      return toast.warning("Please fill all fields");

    try {
      const supplierId = sessionStorage.getItem("supplier_id") || 1;
      if (!selectedGroupId) {
        toast.error("Please select a group first");
        return;
      }

      const payload = {
        supplier_id: supplierId,
        supplier_group_id: selectedGroupId,
        material_id: materialForm.material_id,
        weight: materialForm.weight,
        price: materialForm.price,
      };

      const formData = new FormData();
      formData.append("supplier_id", supplierId);
      formData.append("supplier_group_id", selectedGroupId);
      formData.append("material_id", materialForm.material_id);
      formData.append("weight", materialForm.weight);
      formData.append("price", materialForm.price);
      
      const res = await apiService.createSupplierMaterial(formData);

      if (res.message?.toLowerCase().includes("stored") ||
          res.message?.toLowerCase().includes("success") ||
          res.id
      ) {
        toast.success("Material added successfully");
        setMaterialForm({ material_id: "", weight: "", price: "" });
        // Refresh materials list from API
        await fetchMaterialsByGroup(selectedGroupId);
      } else {
        toast.error(res.data?.message || "Failed to add material");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add material");
    }
  };

  const deleteMaterial = async (material) => {
    const material_id = material.id;
    if (!material_id) return toast.error("Invalid material ID");
    try {
      const res = await apiService.deleteSupplierMaterial(material_id);
      if (res.status === 200 || res.data?.success) {
        toast.success("Material deleted successfully");
        // Refresh materials list from API
        if (selectedGroupId) {
          await fetchMaterialsByGroup(selectedGroupId);
        }
      } else toast.error("Failed to delete material");
    } catch (err) {
      toast.error("Failed to delete material");
    }
  };

  const handleEditGroup = async (group) => {
    try {
      setEditingGroup(group);
      const res = await apiService.getSupplierGroup(group.id);
      const data = res?.data;
      if (!data) return toast.error("Failed to load group details");

      const memberIds = Array.isArray(data.customer_id)
        ? data.customer_id.map((id) => Number(id))
        : [];

      setFormData({
        supplier_name: data.supplier_name || "",
        description: data.description || "",
        groupMembers: memberIds,
      });
      setShowModal(true);
    } catch (err) {
      toast.error("Failed to fetch group details");
    }
  };

  const openMaterialModal = async (groupId) => {
    setSelectedGroupId(groupId);
    setMaterialForm({ material_id: "", weight: "", price: "" });
    await fetchMaterialsByGroup(groupId);
    setShowMaterialModal(true);
  };

  // -------------------- useEffect --------------------
  useEffect(() => {
    fetchGroups();
    fetchCustomers();
    fetchMaterialsList();
  }, []);

  // -------------------- UI --------------------
  const filteredGroups = groups.filter((g) =>
    (g.supplier_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      {/* Toolbar */}
      <div className="d-flex justify-content-between align-items-center mb-2 px-2">
        <button
          className="btn btn-sm btn-success py-1 px-2"
          onClick={() => {
            setEditingGroup(null);
            setFormData({ supplier_name: "", description: "", groupMembers: [] });
            setShowModal(true);
          }}
        >
          + New
        </button>
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="🔍 Search group..."
          style={{ width: "250px" }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-sm align-middle">
          <thead className="table-light text-center" style={{ fontSize: "12px" }}>
            <tr>
              <th>Group Name</th>
              <th>Materials</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3">
                  <Loading message="Loading groups..." />
                </td>
              </tr>
            ) : filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <tr key={group.id} className="text-center">
                  <td>{group.supplier_name}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-success mt-1"
                      onClick={() => openMaterialModal(group.id)}
                    >
                      +
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm text-warning me-1"
                      onClick={() => handleEditGroup(group)}
                    >
                      ✎
                    </button>
                    <button
                      className="btn btn-sm text-danger"
                      onClick={() => deleteGroup(group.id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center text-muted">
                  No groups found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- Group Modal ---------- */}
      {showModal && (
        <div className="modal fade show d-block" style={{ background: "#00000080" }}>
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-header py-2">
                <h6>{editingGroup ? "Edit Group" : "Add Group"}</h6>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body p-2">
                <label>Group Name</label>
                <input
                  type="text"
                  className="form-control form-control-sm mb-2"
                  value={formData.supplier_name}
                  onChange={(e) =>
                    setFormData({ ...formData, supplier_name: e.target.value })
                  }
                  ref={(el) => (inputRefs.current[0] = el)}
                  onKeyDown={(e) => handleKeyDown(e, 0)}
                />

                <label>Members</label>
                <div
                  className="border rounded p-2"
                  style={{ maxHeight: "150px", overflowY: "auto" }}
                >
                  {customers.map((cust) => (
                    <div className="form-check" key={cust.id}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={formData.groupMembers.includes(cust.id)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...formData.groupMembers, cust.id]
                            : formData.groupMembers.filter((id) => id !== cust.id);
                          setFormData({ ...formData, groupMembers: updated });
                        }}
                      />
                      <label className="form-check-label">{cust.name}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer py-2">
                <button className="btn btn-sm btn-primary" onClick={handleSaveGroup}>
                  {editingGroup ? "Update" : "Save"}
                </button>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Material Modal ---------- */}
      {showMaterialModal && (
        <div className="modal fade show d-block" style={{ background: "#00000080" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header py-2">
                <h6>Manage Materials</h6>
                <button
                  className="btn-close"
                  onClick={() => setShowMaterialModal(false)}
                ></button>
              </div>
              <div className="modal-body p-2 row">
                {/* Left: Material List */}
                <div className="col-6 border-end">
                  <h6 style={{ fontSize: "13px" }}>Current Materials</h6>
                  {materials.length > 0 ? (
                    <ul className="list-group list-group-sm">
                      {materials.map((m) => (
                        <li
                          key={m.id}
                          className="list-group-item d-flex justify-content-between align-items-center py-1 px-2"
                        >
                          <span>
                            {m.material_name} | {m.weight} Kg | ₹{m.price}
                          </span>
                          <button
                            className="btn btn-sm btn-danger py-0 px-2"
                            onClick={() => deleteMaterial(m)}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted">No materials found</p>
                  )}
                </div>

                {/* Right: Add Material */}
                <div className="col-6">
                  <h6 style={{ fontSize: "13px" }}>Add New</h6>
                  <label>Material</label>
                  <select
                    className="form-select form-select-sm mb-2"
                    value={materialForm.material_id}
                    onChange={(e) =>
                      setMaterialForm({ ...materialForm, material_id: e.target.value })
                    }
                  >
                    <option value="">Select</option>
                    {materialsList.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>

                  <label>Weight (Kg)</label>
                  <input
                    type="text"
                    className="form-control form-control-sm mb-2"
                    value={materialForm.weight}
                    onChange={(e) =>
                      setMaterialForm({ ...materialForm, weight: e.target.value })
                    }
                  />

                  <label>Price (₹)</label>
                  <input
                    type="text"
                    className="form-control form-control-sm mb-2"
                    value={materialForm.price}
                    onChange={(e) =>
                      setMaterialForm({ ...materialForm, price: e.target.value })
                    }
                  />

                  <button className="btn btn-sm btn-success" onClick={handleAddMaterial}>
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierGroup;
