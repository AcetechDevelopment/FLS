import React, { useState, useEffect } from "react";
import { useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { toast } from "react-toastify";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: "https://115.124.111.111/FLS/public/api",
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
axios.interceptors.request.use(config => {
  const token = sessionStorage.getItem("authToken"); // Using sessionStorage and correct key
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

const SupplierGroup = () => {
  // State Management
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [tempMaterials, setTempMaterials] = useState([]);
  const [materialsList, setMaterialsList] = useState([]); // List of all available materials
  const [formData, setFormData] = useState({
    supplier_name: "",
    supplier_items:"",
    description: ""
  });
  const [materialForm, setMaterialForm] = useState({
    material_id: "",
    material_name: "",
    weight: "",
    price: ""
  });

  // Refs
  const inputRefs = useRef([]);

  // Input handlers
  const handleKeyDown = (e, index) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const nextIndex = index + 1;
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
    }
  };

  const isNumberKey = (e) => {
    const char = e.key;
    const allowedChars = "0123456789";
    const controlKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
    if (controlKeys.includes(char)) return;
    if (!allowedChars.includes(char)) e.preventDefault();
  };

  const isDecimalKey = (e) => {
    const char = e.key;
    const allowedChars = "0123456789.";
    const controlKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
    if (controlKeys.includes(char)) return;
    if (!allowedChars.includes(char)) {
      e.preventDefault();
      return;
    }
    if (char === "." && e.target.value.includes(".")) {
      e.preventDefault();
    }
  };

  // API handlers
  const fetchGroups = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        toast.error("Session expired. Please login again.");
        window.location.href = "/login";
        return;
      }

      const res = await axios.get(
        "https://115.124.111.111/FLS/public/api/supplier-group/list",
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          } 
        }
      );

      // Handle different possible response structures
      const responseData = res.data?.data || res.data || [];
      const normalizedGroups = responseData.map(group => {
        // Ensure supplier_items is always an array
        let supplier_items = [];
        try {
          if (typeof group.supplier_items === 'string') {
            supplier_items = JSON.parse(group.supplier_items) || [];
          } else if (Array.isArray(group.supplier_items)) {
            supplier_items = group.supplier_items;
          }
        } catch (e) {
          console.warn('Error parsing supplier_items:', e);
        }

        return {
          id: group.id,
          supplier_name: group.supplier_name || '',
          description: group.description || '',
          supplier_items: supplier_items
        };
      });

      console.log('Normalized groups:', normalizedGroups);
      setGroups(normalizedGroups);
      if (res.data && Array.isArray(res.data.data)) {
        setGroups(res.data.data.map(g => ({ ...g, materials: g.materials || [] })));
      }
    } catch (err) {
      console.error("Error fetching supplier groups:", err);
      toast.error("Failed to load supplier groups");
    }
  };

  const handleSaveGroup = async () => {
    if (!formData.supplier_name?.trim()) {
      toast.error("Supplier name is required");
      return;
    }

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      toast.error("You are not logged in. Please login again.");
      return;
    }

    try {
      // Use the same endpoint for both create and update
      const endpoint = "https://115.124.111.111/FLS/public/api/supplier-group/create";
      
      // Ensure supplier_items is properly formatted
      let supplier_items = [];
      try {
        if (Array.isArray(formData.supplier_items)) {
          supplier_items = formData.supplier_items;
        } else if (typeof formData.supplier_items === 'string') {
          supplier_items = JSON.parse(formData.supplier_items);
        }
      } catch (e) {
        console.warn('Error parsing supplier_items:', e);
      }

      const payload = {
        supplier_name: formData.supplier_name,
        supplier_items: supplier_items, // Send as array, not string
        description: formData.description || "",
        ...(editingGroup && { id: editingGroup.id })
      };

      console.log('Saving group with payload:', payload); // For debugging

      const res = await axios({
        method: 'post', // Always use POST for both create and update
        url: endpoint,
        data: payload,
        headers: { 
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (res.data && (res.data.success || res.status === 200)) {
        toast.success(editingGroup ? "Group updated successfully" : "Group created successfully");
        fetchGroups();
        setShowModal(false);
        setFormData({ supplier_name: "", description: "", supplier_items: [] });
      } else {
        console.error('API Response:', res.data);
        toast.error(res.data?.message || (editingGroup ? "Failed to update group" : "Failed to create group"));
      }
    } catch (err) {
      console.error("Error saving group:", err.response?.data || err);
      toast.error(err.response?.data?.message || "API error while saving group");
    }
  };

  const deleteRow = async (id) => {
    if (!window.confirm("Are you sure you want to delete this group?")) return;
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        toast.error("You are not logged in. Please login again.");
        return;
      }

      const res = await axios.delete(
        `https://115.124.111.111/FLS/public/api/supplier-group/delete/${id}`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          } 
        }
      );

      // Check both success flag and status code
      if (res.data && (res.data.success || res.status === 200)) {
        toast.success("Group deleted successfully");
        fetchGroups(); // Refresh the list
      } else {
        console.error('Delete response:', res.data);
        toast.error(res.data?.message || "Failed to delete group");
      }
    } catch (err) {
      console.error("Error deleting group:", err.response?.data || err);
      const errorMessage = err.response?.data?.message || "Failed to delete group";
      toast.error(errorMessage);
    }
  };

  const handleSaveMaterial = async () => {
    if (!selectedGroupId) return toast.warning("No group selected.");
    if (tempMaterials.length === 0) return toast.warning("No materials to save.");

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      toast.error("Session expired. Please login again.");
      window.location.href = "/login";
      return;
    }

    try {
      // Save all materials in tempMaterials array
      const savePromises = tempMaterials.map(material => 
        axios.post(
          "https://115.124.111.111/FLS/public/api/supplier-material/create",
          {
            supplier_group_id: selectedGroupId,
            material_id: material.material_id,
            weight: material.weight,
            price: material.price,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
          }
        )
      );

      // Wait for all materials to be saved
      await Promise.all(savePromises);
      
      toast.success("All materials saved successfully!");
      fetchGroups();
      setShowMaterialModal(false);
      setMaterialForm({ material: "", weight: "", price: "" });
      setTempMaterials([]); // Clear temp materials after saving
      
    } catch (error) {
      console.error("Error saving materials:", error);
      toast.error(error.response?.data?.message || "Failed to save materials");
    }
  };

  // Material handlers
  const addTempMaterial = async () => {
    if (!materialForm.material_id || !materialForm.weight || !materialForm.price) {
      toast.warning("Please fill all fields");
      return;
    }

    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        toast.error("Session expired. Please login again.");
        return;
      }

      // Get selected material details
      const selectedMaterial = materialsList.find(m => m.id.toString() === materialForm.material_id);
      
      // Add to temp materials first for immediate display
      const newMaterial = {
        ...materialForm,
        material_name: selectedMaterial?.name || '',
        material: selectedMaterial?.name || '',
        id: `temp_${Date.now()}` // temporary ID for UI purposes
      };
      setTempMaterials(prev => [...prev, newMaterial]);

      const res = await axios.post(
        "https://115.124.111.111/FLS/public/api/supplier-material/create",
        {
          supplier_group_id: selectedGroupId,
          material_id: materialForm.material_id,
          weight: materialForm.weight,
          price: materialForm.price,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        }
      );

      if (res.data && (res.data.success || res.status === 200)) {
        toast.success("Material added successfully!");
        
        // Get the material details from the materials list
        const materialDetails = materialsList.find(m => m.id === Number(materialForm.material_id));
        
        // Create the new material object with all necessary data
        const savedMaterial = {
          id: res.data.data?.id || newMaterial.id,
          material_id: materialForm.material_id,
          material_name: materialDetails?.name || materialForm.material_name,
          material: materialDetails?.name || materialForm.material_name, // For display compatibility
          weight: materialForm.weight,
          price: materialForm.price
        };

        // Update tempMaterials, replacing the temporary entry with the saved one
        setTempMaterials(prev => 
          prev.map(m => m.id === newMaterial.id ? savedMaterial : m)
        );
        
        // Reset only the form fields, not the materials list
        setMaterialForm({ 
          material_id: "", 
          material_name: "", 
          weight: "", 
          price: "" 
        });
      } else {
        // Remove from temp materials if save failed
        setTempMaterials(prev => prev.filter(m => m.id !== newMaterial.id));
        toast.error(res.data?.message || "Failed to add material");
      }
    } catch (error) {
      // Remove from temp materials if save failed
      setTempMaterials(prev => prev.filter(m => m.id !== `temp_${Date.now()}`));
      console.error("Error adding material:", error);
      toast.error(error.response?.data?.message || "Failed to add material");
    }
  };

  const removeTempMaterial = (index) => {
    setTempMaterials(tempMaterials.filter((_, i) => i !== index));
  };

  const deleteMaterial = async (materialId) => {
    if (!window.confirm("Are you sure you want to delete this material?")) return;
    
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        toast.error("Session expired. Please login again.");
        window.location.href = "/login";
        return;
      }

      // First remove from tempMaterials to update UI immediately
      setTempMaterials(prev => prev.filter(m => m.id !== materialId));

      const res = await axios.delete(
        `https://115.124.111.111/FLS/public/api/supplier-material/delete/${materialId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        }
      );

      if (res.data && (res.data.success || res.status === 200)) {
        toast.success("Material deleted successfully");
        // No need to fetch groups here since we're in the modal
      } else {
        // If delete failed, add the material back to the list
        const materialToRestore = tempMaterials.find(m => m.id === materialId);
        if (materialToRestore) {
          setTempMaterials(prev => [...prev, materialToRestore]);
        }
        console.error('Delete material response:', res.data);
        toast.error(res.data?.message || "Failed to delete material");
      }
    } catch (err) {
      // If delete failed, add the material back to the list
      const materialToRestore = tempMaterials.find(m => m.id === materialId);
      if (materialToRestore) {
        setTempMaterials(prev => [...prev, materialToRestore]);
      }
      console.error("Error deleting material:", err.response?.data || err);
      const errorMessage = err.response?.data?.message || "Failed to delete material";
      toast.error(errorMessage);
    }
  };

  // Modal handlers
  const handleNewGroup = () => {
    setEditingGroup(null);
    setFormData({ supplier_name: "", description: "", supplier_items: [] });
    setShowModal(true);
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setFormData(group);
    setShowModal(true);
  };

  const fetchMaterialsForGroup = async (groupId) => {
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        toast.error("Session expired. Please login again.");
        return [];
      }

      // Fetch current materials for this group
      const res = await axios.get(
        `https://115.124.111.111/FLS/public/api/supplier-group/list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      // Find the specific group and its materials
      const group = res.data?.data?.find(g => g.id === groupId);
      if (group && group.supplier_items) {
        let items = [];
        try {
          items = typeof group.supplier_items === 'string' 
            ? JSON.parse(group.supplier_items) 
            : group.supplier_items;
        } catch (e) {
          console.warn('Error parsing supplier_items:', e);
        }
        return Array.isArray(items) ? items : [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching group materials:", error);
      return [];
    }
  };

  const openMaterialModal = async (groupId) => {
    setSelectedGroupId(groupId);
    setMaterialForm({ material_id: "", material_name: "", weight: "", price: "" });
    
    const materials = await fetchMaterialsForGroup(groupId);
    console.log('Fetched materials:', materials); // For debugging
    setTempMaterials(materials);
    setShowMaterialModal(true);
  };

  // Filtered groups
  const filteredGroups = groups.filter((g) => {
    const searchTerm = search.toLowerCase();
    const supplierName = (g.supplier_name || "").toLowerCase();
    const description = (g.description || "").toLowerCase();
    
    return supplierName.includes(searchTerm) || description.includes(searchTerm);
  });

  // Function to fetch materials list
  const fetchMaterials = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        toast.error("Session expired. Please login again.");
        return;
      }

      const res = await axios.get(
        "https://115.124.111.111/FLS/public/api/material/list",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Materials response:', res.data); // For debugging

      // Handle different possible response structures
      const materialsData = res.data?.data || res.data || [];
      if (Array.isArray(materialsData)) {
        setMaterialsList(materialsData.map(m => ({
          id: m.id,
          name: m.name || m.material_name || '',
          description: m.description || ''
        })));
      } else {
        console.error('Unexpected materials data structure:', materialsData);
        toast.error("Invalid materials data received");
      }
    } catch (err) {
      console.error("Error fetching materials:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Failed to load materials list");
    }
  };

  // Load groups and materials on mount
  useEffect(() => {
    fetchGroups();
    fetchMaterials();
  }, []);

  return (
     
<div className="container">
      {/* Toolbar */}
<div className="d-flex justify-content-between align-items-center mb-2 px-2">
  {/* ✅ Action Buttons */}
  <div className="d-flex flex-wrap gap-2">
    {/* New Group */}
    <button
      className="btn btn-sm btn-success py-1 px-2 d-flex align-items-center"
      style={{ borderRadius: "8px", fontSize: "12px" }}
      onClick={handleNewGroup}
    >
      <span
        className="material-icons-two-tone me-1"
        style={{ fontSize: "12px" }}
      >
        add
      </span>
      New
    </button>

    {/* PDF */}
  
  </div>

  {/* ✅ Search Box */}
  <div style={{ width: "250px" }}>
    <input
      type="text"
      className="form-control form-control-sm"
      placeholder="🔍 Search group..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      style={{ borderRadius: "8px" }}
    />
  </div>
</div>

      {/* ✅ Table */}
<div className="table-responsive">
  <table className="table table-bordered table-sm align-middle">
    <thead className="table-light">
<tr className="text-center" style={{ fontSize: "12px" }}>
  <th>Supplier Name</th>
  {/* <th>Supplier</th> */}
  {/* <th>Material</th> */}
  <th>Materials</th>
  {/* <th>Pieces</th> */}
  <th style={{ minWidth: "100px" }}>Action</th>
</tr>
    </thead>

    <tbody style={{ lineHeight: "1.05" }}>
      {filteredGroups.map((group) => (
        <tr className="text-center" key={group.id}>
          {/* Group Name */}
          <td className="py-1 px-1">{group.supplier_name}</td>

          {/* Supplier Dropdown */}

          {/* Materials list + + button */}
<td>
  {Array.isArray(group.supplier_items) && group.supplier_items.length > 0 && (
    <ul className="mb-0">
      {group.supplier_items.map((m) => (
        <li key={m.id} className="d-flex justify-content-between align-items-center">
          <span>{m.material} | {m.weight} Kg | ₹{m.price}</span>
          <button
            className="btn btn-sm btn-danger py-0 px-1 ms-2"
            onClick={() => deleteMaterial(m.id)}
            style={{ fontSize: '10px' }}
          >
            x
          </button>
        </li>
      ))}
    </ul>
  )}

<button
  className="btn btn-success ms-2"
  style={{
    padding: "0.15rem 0.35rem", // smaller padding
    fontSize: "12px",           // smaller font
    lineHeight: "1",            // compact line-height
    height: "22px",              // optional fixed height
    minWidth: "22px"             // optional fixed width for a square look
  }}
  onClick={() => openMaterialModal(group.id)}
>
  +
</button> 
</td>

          {/* No. of Pieces */}

          {/* Action */}
          <td className="py-1 px-1">
            {/* Edit */}
            <button
              className="btn btn-sm p-0 me-1"
              style={{ background: "transparent", border: "none" }}
              onClick={() => handleEditGroup(group)}
              title="Edit"
            >
              <span
                className="material-icons-two-tone text-warning"
                style={{ fontSize: "16px", cursor: "pointer" }}
              >
                edit
              </span>
            </button>

            {/* Delete */}
            <button
              className="btn btn-sm p-0"
              style={{ background: "transparent", border: "none" }}
              onClick={() => deleteRow(group.id)}
              title="Delete"
            >
              <span
                className="material-icons-two-tone text-danger"
                style={{ fontSize: "16px", cursor: "pointer" }}
              >
                delete
              </span>
            </button>
          </td>
        </tr>
      ))}

      {filteredGroups.length === 0 && (
        <tr>
          <td colSpan="6" className="text-center text-muted py-1" style={{ fontSize: "12px" }}>
            No supplier groups found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

      {/* ✅ Group Modal (only keep one version) */}
{showModal && (
  <div
    className="modal fade show d-block"
    tabIndex="-1"
    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
  >
    <div className="modal-dialog modal-sm">
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header py-2 px-3">
          <h5 className="modal-title" style={{ fontSize: "14px" }}>
            {editingGroup ? "Edit Group" : "Add Group"}
          </h5>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setShowModal(false)}
          ></button>
        </div>

        {/* Body */}
        <div className="modal-body p-2" style={{ fontSize: "13px" }}>
          {/* Group Name */}
          <div className="mb-2">
            <label className="form-label" style={{ fontSize: "13px" }}>
              Group Name
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={formData.supplier_name || ""}
              onChange={(e) =>
                setFormData({ ...formData, supplier_name: e.target.value })
              }
              placeholder="Enter Supplier Name"
              ref={(el) => (inputRefs.current[0] = el)}
              onKeyDown={(e) => handleKeyDown(e, 0)}
            />
          </div>

          {/* Group Members */}
          <div className="mb-2">
            <label className="form-label" style={{ fontSize: "13px" }}>
              Group Members
            </label>
            <div
              className="border rounded p-2"
              style={{ maxHeight: "150px", overflowY: "auto" }}
            >
              {["Supplier 1", "Supplier 2", "Supplier 3", "Supplier 4"].map(
                (supplier, index) => (
                  <div className="form-check" key={index}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`supplier-${index}`}
                      value={supplier}
                      checked={
                        formData.groupMembers?.includes(supplier) || false
                      }
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...(formData.groupMembers || []), supplier]
                          : (formData.groupMembers || []).filter(
                              (s) => s !== supplier
                            );
                        setFormData({ ...formData, groupMembers: updated });
                      }}
                      ref={(el) => (inputRefs.current[index + 1] = el)}
                      onKeyDown={(e) => handleKeyDown(e, index + 1)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`supplier-${index}`}
                    >
                      {supplier}
                    </label>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer py-2 px-3">
          <button
            className="btn btn-sm btn-primary"
            onClick={handleSaveGroup}
            ref={(el) => (inputRefs.current[5] = el)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSaveGroup();
              }
            }}
          >
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
      {/* ====== NEW: Material Modal ====== */}
{showMaterialModal && (
  <div
    className="modal fade show d-block"
    tabIndex="-1"
    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
  >
    <div className="modal-dialog modal-lg">
      <div className="modal-content">
        <div className="modal-header py-2 px-3">
          <h5 className="modal-title" style={{ fontSize: "14px" }}>Add Material</h5>
          <div>
            <button
              type="button"
              className="btn btn-sm btn-primary me-2"
              onClick={() => {
                fetchGroups(); // Refresh the main list
                setShowMaterialModal(false);
              }}
            >
              Done
            </button>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => {
                fetchGroups(); // Refresh the main list
                setShowMaterialModal(false);
              }}
            ></button>
          </div>
        </div>

        <div
          className="modal-body p-2"
          style={{
            fontSize: "13px",
            maxHeight: "400px",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <div className="row">
            {/* Left Side - Materials List */}
<div className="col-6 border-end d-flex flex-column">
  <h6 style={{ fontSize: "13px" }}>Added Materials</h6>

  {/* Scrollable List */}
  <div
    style={{
      maxHeight: "250px",   // adjust as needed
      overflowY: "auto",
      overflowX: "hidden",
      flexGrow: 1,
    }}
    className="mb-2"
  >
    {tempMaterials.length > 0 ? (
      <ul className="list-group list-group-sm">
        {tempMaterials.map((m, index) => {
          const materialName = m.material_name || m.material || 
            materialsList.find(mat => mat.id === Number(m.material_id))?.name || 'Unknown';
          return (
            <li
              key={m.id || index}
              className="list-group-item d-flex justify-content-between align-items-center py-1 px-2"
              style={{ fontSize: "12px" }}
            >
              <span className="me-2 flex-grow-1">
                {materialName} | {m.weight} Kg | ₹{m.price}
              </span>
              <button
                className="btn btn-sm btn-danger py-0 px-2"
                onClick={() => deleteMaterial(m.id)}
              >
                x
              </button>
            </li>
          );
        })}
      </ul>
    ) : (
      <p className="text-muted" style={{ fontSize: "12px" }}>
        No materials added yet
      </p>
    )}
  </div>

  {/* Footer stays fixed below list */}

</div>

            {/* Right Side - Add New Material */}
            <div className="col-6">
              <h6 style={{ fontSize: "13px" }}>New Material</h6>

              {/* Material select */}
              <div className="mb-2">
                <label className="form-label" style={{ fontSize: "13px" }}>Material</label>
                <select
                  className="form-select form-select-sm"
                  value={materialForm.material_id}
                  onChange={(e) => {
                    const selectedMaterial = materialsList.find(m => m.id === Number(e.target.value));
                    setMaterialForm({
                      ...materialForm,
                      material_id: e.target.value,
                      material_name: selectedMaterial ? selectedMaterial.name : ''
                    });
                    console.log('Selected material:', selectedMaterial); // For debugging
                  }}
                  ref={(el) => (inputRefs.current[2] = el)}
                  onKeyDown={(e) => handleKeyDown(e, 2)}
                >
                  <option value="">Select Material</option>
                  {materialsList && materialsList.length > 0 ? (
                    materialsList.map(material => (
                      <option key={material.id} value={material.id}>
                        {material.name || 'Unnamed Material'}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Loading materials...</option>
                  )}
                </select>
              </div>

              {/* Weight input */}
              <div className="mb-2">
                <label className="form-label" style={{ fontSize: "13px" }}>Weight (Kg)</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={materialForm.weight}
                  onKeyDown={(e) => {
                    isNumberKey(e);
                    handleKeyDown(e, 3);
                  }}
                  onChange={(e) =>
                    setMaterialForm({ ...materialForm, weight: e.target.value })
                  }
                  ref={(el) => (inputRefs.current[3] = el)}
                />
              </div>

              {/* Price input */}
              <div className="mb-2">
                <label className="form-label" style={{ fontSize: "13px" }}>Price (₹)</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={materialForm.price}
                  onKeyDown={(e) => {
                    isNumberKey(e);
                    handleKeyDown(e, 4);
                  }}
                  onChange={(e) =>
                    setMaterialForm({ ...materialForm, price: e.target.value })
                  }
                  ref={(el) => (inputRefs.current[4] = el)}
                />
              </div>

              {/* Add button */}
       <button
  className="btn btn-sm btn-success"
  ref={(el) => (inputRefs.current[5] = el)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTempMaterial();   // ✅ Add material on Enter
    }
  }}
  onClick={addTempMaterial}
>
  Add
</button>

            </div>
            
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
