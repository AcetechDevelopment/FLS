import React, { useState, useEffect } from "react";   // ✅ added useEffect
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const SupplierGroup = () => {
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false); // group modal
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({
    groupName: "",
    description: "",
    groupMembers: []   // ✅ added so Group Members checkboxes work
    
  });

    // ➕ Add material to temp list
  const addTempMaterial = () => {
    if (!materialForm.material || !materialForm.weight || !materialForm.price) {
      alert("Please fill all fields");
      return;
    }
    setTempMaterials([...tempMaterials, materialForm]);
    setMaterialForm({ material: "", weight: "", price: "" }); // reset form
  };

  // ❌ Remove material by index
  const removeTempMaterial = (index) => {
    setTempMaterials(tempMaterials.filter((_, i) => i !== index));
  };

  // ====== NEW: material modal state and form ======
const [showMaterialModal, setShowMaterialModal] = useState(false);
const [selectedGroupId, setSelectedGroupId] = useState(null); // which row you’re editing
const [tempMaterials, setTempMaterials] = useState([]); // temp materials before saving
const [materialForm, setMaterialForm] = useState({
  material: "",
  weight: "",
  price: "",
});

  // ✅ Load data from localStorage when component mounts
  useEffect(() => {
    const stored = localStorage.getItem("supplierGroupData");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // ensure groups have materials array
        const safe = parsed.map(g => ({ ...g, materials: g.materials || [] }));
        setGroups(safe);
      } catch (err) {
        setGroups(parsed);
      }
    }
  }, []);

  // ✅ Save to localStorage whenever groups change
  useEffect(() => {
    localStorage.setItem("supplierGroupData", JSON.stringify(groups));
  }, [groups]);

  const isNumberKey = (e) => {
    const char = e.key;
    const allowedChars = "0123456789";
    const controlKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];

    if (controlKeys.includes(char)) return;
    if (!allowedChars.includes(char)) {
      e.preventDefault();
    }
  };

  const isIntegerKey = (e) => {
    const char = e.key;
    const allowedChars = "0123456789";
    const controlKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
    if (controlKeys.includes(char)) return;
    if (!allowedChars.includes(char)) {
      e.preventDefault();
    }
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

  // Open modal for new group
  const handleNewGroup = () => {
    setEditingGroup(null);
    setFormData({ groupName: "", description: "", groupMembers: [] });
    setShowModal(true);
  };

  // Open modal for editing group
  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setFormData(group);
    setShowModal(true);
  };

  // Save group (add or update)
  const handleSaveGroup = () => {
    if (editingGroup) {
      setGroups(
        groups.map((g) =>
          g.id === editingGroup.id ? { ...formData, id: editingGroup.id, materials: g.materials || [] } : g
        )
      );
    } else {
      setGroups([...groups, { ...formData, id: Date.now(), materials: [] }]);
    }
    setShowModal(false);
  };

  // Delete group
  const deleteRow = (id) => {
    setGroups(groups.filter((group) => group.id !== id));
  };

  // ====== NEW: open material modal for a group ======
  const openMaterialModal = (groupId) => {
    setSelectedGroupId(groupId);
    setMaterialForm({ supplier: "", material: "", pieces: "" });
    setShowMaterialModal(true);
  };
  // alias for older code that used openModal
  const openModal = openMaterialModal;

  // ====== NEW: save material into selected group ======
  const handleSaveMaterial = () => {
    if (!selectedGroupId) return alert("No group selected.");
    if (!materialForm.material) return alert("Enter material name.");
    setGroups(prev =>
      prev.map(g =>
        g.id === selectedGroupId
          ? { ...g, materials: [...(g.materials || []), { ...materialForm, id: Date.now() }] }
          : g
      )
    );
    setShowMaterialModal(false);
    setMaterialForm({ supplier: "", material: "", pieces: "" });
  };

  // ✅ Export PDF
  // const exportPDF = () => {
  //   if (groups.length === 0) {
  //     alert("No supplier groups available to export.");
  //     return;
  //   }

  //   const doc = new jsPDF();
  //   doc.setFontSize(16);
  //   doc.text("Supplier Groups", 14, 15);

  //   autoTable(doc, {
  //     startY: 25,
  //     head: [["Group Name", "Description"]],
  //     body: groups.map((g) => [g.groupName, g.description]),
  //     theme: "grid",
  //     styles: { fontSize: 10 },
  //     headStyles: { fillColor: [0, 123, 255] },
  //   });

  //   doc.save("SupplierGroups.pdf");
  // };

  // ✅ Export Excel
  // const exportExcel = () => {
  //   if (groups.length === 0) {
  //     alert("No supplier groups available to export.");
  //     return;
  //   }

  //   const data = groups.map((g) => ({
  //     "Group Name": g.groupName,
  //     Description: g.description,
  //   }));

  //   const worksheet = XLSX.utils.json_to_sheet(data);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "SupplierGroups");
  //   XLSX.writeFile(workbook, "SupplierGroups.xlsx");
  // };

  // ✅ Print Table
  // const handlePrint = () => {
  //   if (groups.length === 0) {
  //     alert("No supplier groups available to print.");
  //     return;
  //   }

  //   const tableHTML = `
  //     <table>
  //       <thead>
  //         <tr>
  //           <th>Group Name</th>
  //           <th>Description</th>
  //         </tr>
  //       </thead>
  //       <tbody>
  //         ${groups
  //           .map(
  //             (g) => `
  //           <tr>
  //             <td>${g.groupName}</td>
  //             <td>${g.description}</td>
  //           </tr>
  //         `
  //           )
  //           .join("")}
  //       </tbody>
  //     </table>
  //   `;

  //   const printWindow = window.open("", "", "width=900,height=600");
  //   printWindow.document.write(`
  //     <html>
  //       <head>
  //         <title>Supplier Groups</title>
  //         <style>
  //           table { width: 100%; border-collapse: collapse; }
  //           th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  //           th { background-color: #0d6efd; color: white; }
  //         </style>
  //       </head>
  //       <body>
  //         <h2>Supplier Groups</h2>
  //         ${tableHTML}
  //       </body>
  //     </html>
  //   `);
  //   printWindow.document.close();
  //   printWindow.print();
  // };

  // ✅ Filtered groups
  const filteredGroups = groups.filter(
    (g) =>
      g.groupName.toLowerCase().includes(search.toLowerCase()) ||
      (g.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      {/* Toolbar */}
      <div className="d-flex justify-content-between align-items-center mb-1">
        {/* ✅ Action Buttons */}
        <div className="d-flex flex-wrap gap-1 mb-3">
          {/* New Group */}
          <button
            className="btn btn-sm btn-success py-1 px-2 d-flex align-items-center"
            style={{ borderRadius: "8px", fontSize: "13px" }}
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
          {/* <button
            className="btn btn-sm btn-danger py-1 px-2 d-flex align-items-center"
            style={{ borderRadius: "8px", fontSize: "13px" }}
            onClick={exportPDF}
          >
            <span
              className="material-icons-two-tone me-1"
              style={{ fontSize: "14px" }}
            >
              picture_as_pdf
            </span>
            PDF
          </button> */}

          {/* Excel */}
          {/* <button
            className="btn btn-sm text-white py-1 px-2 d-flex align-items-center"
            style={{
              backgroundColor: "#1D6F42",
              borderColor: "#1D6F42",
              borderRadius: "8px",
              fontSize: "13px",
            }}
            onClick={exportExcel}
          >
            <span
              className="material-icons-two-tone me-1"
              style={{ fontSize: "14px" }}
            >
              grid_on
            </span>
            Excel
          </button> */}

          {/* Print */}
          {/* <button
            className="btn btn-sm btn-primary py-1 px-2 d-flex align-items-center"
            style={{ borderRadius: "8px", fontSize: "13px" }}
            onClick={handlePrint}
          >
            <span
              className="material-icons-two-tone me-1"
              style={{ fontSize: "14px" }}
            >
              print
            </span>
            Print
          </button> */}
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
    <tr className="text-center">
  <th>Group Name</th>
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
          <td className="py-1 px-1">{group.groupName}</td>

          {/* Supplier Dropdown */}
          {/* <td className="py-1 px-1">
            <select className="form-select form-select-sm">
              <option value="">Select Supplier</option>
              <option value="supplier">Supplier</option>
              <option value="supplierGroup">Supplier Group</option>
            </select>
          </td> */}

          {/* Material Dropdown */}
          {/* <td className="py-1 px-1">
            <select className="form-select form-select-sm">
              <option value="">Select Material</option>
              <option value="material1">Material 1</option>
              <option value="material2">Material 2</option>
            </select>
          </td> */}

          {/* Materials list + + button */}
<td>
  {(group.materials || []).length > 0 && (
    <ul className="mb-0">
      {(group.materials || []).map((m) => (
        <li key={m.id}>
          {m.supplier} | {m.material} | {m.pieces}
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
          {/* <td className="py-1 px-1">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Pieces"
              min="0"
              defaultValue={1}
              onKeyDown={isIntegerKey}
            />
          </td> */}

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
                    value={formData.groupName || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, groupName: e.target.value })
                    }
                    placeholder="Enter Group Name"
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
                            checked={formData.groupMembers?.includes(supplier) || false}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...(formData.groupMembers || []), supplier]
                                : (formData.groupMembers || []).filter((s) => s !== supplier);
                              setFormData({ ...formData, groupMembers: updated });
                            }}
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
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setShowMaterialModal(false)}
          ></button>
        </div>

     <div
  className="modal-body p-2"
  style={{
    fontSize: "13px",
    maxHeight: "400px",
    overflowY: "auto",   // vertical scroll
    overflowX: "hidden", // no horizontal scroll
  }}
>
          <div className="row">
            {/* ✅ Left Side - Materials List */}
          <div className="col-6 border-end">
  <h6 style={{ fontSize: "13px" }}>Added Materials</h6>
  {tempMaterials.length > 0 ? (
    <ul className="list-group list-group-sm">
      {tempMaterials.map((m, index) => (
        <li
          key={index}
          className="list-group-item d-flex justify-content-between align-items-center py-1 px-2"
          style={{ fontSize: "12px" }}
        >
          <span className="me-2 flex-grow-1">
            {m.material} | {m.weight} Kg | ₹{m.price}
          </span>
          <button
            className="btn btn-sm btn-danger py-0 px-2"
            onClick={() => removeTempMaterial(index)}
          >
            x
          </button>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-muted" style={{ fontSize: "12px" }}>
      No materials added yet
    </p>
  )}

  <div className="modal-footer py-2 px-3">
    <button
      className="btn btn-sm btn-primary"
      onClick={handleSaveMaterial}
    >
      Save
    </button>
    <button
      className="btn btn-sm btn-secondary"
      onClick={() => setShowMaterialModal(false)}
    >
      Close
    </button>
  </div>
</div>

            {/* ✅ Right Side - Add New Material */}
            <div className="col-6">
              <h6 style={{ fontSize: "13px" }}>New Material</h6>

<div className="mb-2">
  <label className="form-label" style={{ fontSize: "13px" }}>Material</label>
  <select
    className="form-select form-select-sm"
    value={materialForm.material}
    onChange={(e) =>
      setMaterialForm({ ...materialForm, material: e.target.value })
    }
  >
    <option value="">Select Material</option>
    <option value="Bedsheet">Bedsheet</option>
    <option value="Towel">Towel</option>
  </select>
</div>

           <div className="mb-2">
  <label className="form-label" style={{ fontSize: "13px" }}>Weight (Kg)</label>
  <input
    type="text"   // ✅ use text so filtering works
    className="form-control form-control-sm"
    value={materialForm.weight}
    onKeyDown={isNumberKey}  // ✅ restrict keys
    onChange={(e) =>
      setMaterialForm({ ...materialForm, weight: e.target.value })
    }
  />
</div>

<div className="mb-2">
  <label className="form-label" style={{ fontSize: "13px" }}>Price (₹)</label>
  <input
    type="text"   // ✅ use text so filtering works
    className="form-control form-control-sm"
    value={materialForm.price}
    onKeyDown={isNumberKey}  // ✅ restrict keys
    onChange={(e) =>
      setMaterialForm({ ...materialForm, price: e.target.value })
    }
  />
</div>
              <button
                className="btn btn-sm btn-success"
                onClick={addTempMaterial}
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer py-2 px-3">
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => setShowMaterialModal(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default SupplierGroup;
