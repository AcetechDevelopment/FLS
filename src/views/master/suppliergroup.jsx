import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const SupplierGroup = () => {
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({
    groupName: "",
    description: "",
  });

  // Open modal for new group
  const handleNewGroup = () => {
    setEditingGroup(null);
    setFormData({ groupName: "", description: "" });
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
          g.id === editingGroup.id ? { ...formData, id: editingGroup.id } : g
        )
      );
    } else {
      setGroups([...groups, { ...formData, id: Date.now() }]);
    }
    setShowModal(false);
  };

  // Delete group
  const deleteRow = (id) => {
    setGroups(groups.filter((group) => group.id !== id));
  };

  // ✅ Export PDF
  const exportPDF = () => {
    if (groups.length === 0) {
      alert("No supplier groups available to export.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Supplier Groups", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["Group Name", "Description"]],
      body: groups.map((g) => [g.groupName, g.description]),
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 123, 255] },
    });

    doc.save("SupplierGroups.pdf");
  };

  // ✅ Export Excel
  const exportExcel = () => {
    if (groups.length === 0) {
      alert("No supplier groups available to export.");
      return;
    }

    const data = groups.map((g) => ({
      "Group Name": g.groupName,
      Description: g.description,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SupplierGroups");
    XLSX.writeFile(workbook, "SupplierGroups.xlsx");
  };

  // ✅ Print Table
  const handlePrint = () => {
    if (groups.length === 0) {
      alert("No supplier groups available to print.");
      return;
    }

    const tableHTML = `
      <table>
        <thead>
          <tr>
            <th>Group Name</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          ${groups
            .map(
              (g) => `
            <tr>
              <td>${g.groupName}</td>
              <td>${g.description}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;

    const printWindow = window.open("", "", "width=900,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Supplier Groups</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #0d6efd; color: white; }
          </style>
        </head>
        <body>
          <h2>Supplier Groups</h2>
          ${tableHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // ✅ Filtered groups
  const filteredGroups = groups.filter(
    (g) =>
      g.groupName.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase())
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
    <button
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
    </button>

    {/* Excel */}
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
      <span
        className="material-icons-two-tone me-1"
        style={{ fontSize: "14px" }}
      >
        grid_on
      </span>
      Excel
    </button>

    {/* Print */}
    <button
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
    </button>
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
  <table
    className="table table-bordered table-striped align-middle"
    style={{ fontSize: "12px" }}
  >
    <thead className="table-primary" style={{ fontSize: "12px" }}>
      <tr className="text-center">
        <th className="py-1 px-1">Group Name</th>
        <th className="py-1 px-1">Supplier</th>
        <th className="py-1 px-1">Material</th>
        <th className="py-1 px-1">Prize</th>
        <th className="py-1 px-1" style={{ minWidth: "100px" }}>
          Action
        </th>
      </tr>
    </thead>

    <tbody>
      {filteredGroups.map((group) => (
        <tr className="text-center" key={group.id}>
          {/* Group Name */}
          <td className="py-1 px-1">{group.groupName}</td>

          {/* Supplier Dropdown */}
          <td className="py-1 px-1">
            <select className="form-select form-select-sm">
              <option value="">Select Supplier</option>
              <option value="supplier">Supplier</option>
              <option value="supplierGroup">Supplier Group</option>
            </select>
          </td>

          {/* Material Dropdown */}
          <td className="py-1 px-1">
            <select className="form-select form-select-sm">
              <option value="">Select Material</option>
              <option value="material1">Material 1</option>
              <option value="material2">Material 2</option>
            </select>
          </td>

          {/* Prize Manual Entry */}
          <td className="py-1 px-1">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Enter Prize"
            />
          </td>

          {/* Action */}
         <td className="py-1 px-1">
  {/* Edit */}
  <button
    className="btn btn-sm p-0 me-1"
    style={{ background: "transparent", border: "none", cursor: "pointer" }}
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
    style={{ background: "transparent", border: "none", cursor: "pointer" }}
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
          <td
            colSpan="5"
            className="text-center text-muted py-1"
            style={{ fontSize: "12px" }}
          >
            No supplier groups found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

      {/* ✅ Modal */}
{showModal && (
  <div className="modal fade show d-block" tabIndex="-1">
    <div className="modal-dialog modal-sm">
      <div className="modal-content">
        <div className="modal-header py-2 px-3">
          <h5 className="modal-title" style={{ fontSize: "14px" }}>
            {editingGroup ? "Edit Entry" : "Add Entry"}
          </h5>
          <button
            type="button"
            className="btn-close btn-sm"
            onClick={() => setShowModal(false)}
          ></button>
        </div>

        <div className="modal-body p-2" style={{ fontSize: "13px" }}>
          {/* Type */}
          <div className="mb-2">
            <label className="form-label" style={{ fontSize: "13px" }}>
              Type
            </label>
            <select
              className="form-select form-select-sm"
              value={formData.type || ""}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            >
              <option value="">Select Type</option>
              <option value="supplier">Supplier</option>
              <option value="supplierGroup">Supplier Group</option>
            </select>
          </div>

          {/* Supplier */}
          {formData.type === "supplier" && (
            <>
              <div className="mb-2">
                <label className="form-label" style={{ fontSize: "13px" }}>
                  Supplier Name
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={formData.supplierName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, supplierName: e.target.value })
                  }
                />
              </div>
              <div className="mb-2">
                <label className="form-label" style={{ fontSize: "13px" }}>
                  Supplier Code
                </label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={formData.supplierCode || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, supplierCode: e.target.value })
                  }
                />
              </div>
            </>
          )}

          {/* Supplier Group */}
          {formData.type === "supplierGroup" && (
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
              />
            </div>
          )}

          {/* Material Dropdown */}
          <div className="mb-2">
            <label className="form-label" style={{ fontSize: "13px" }}>
              Material
            </label>
            <select
              className="form-select form-select-sm"
              value={formData.material || ""}
              onChange={(e) =>
                setFormData({ ...formData, material: e.target.value })
              }
            >
              <option value="">Select Material</option>
              <option value="material1">Material 1</option>
              <option value="material2">Material 2</option>
              <option value="material3">Material 3</option>
            </select>
          </div>

          {/* Prize Entry */}
          <div className="mb-2">
            <label className="form-label" style={{ fontSize: "13px" }}>
              Prize
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={formData.prize || ""}
              onChange={(e) =>
                setFormData({ ...formData, prize: e.target.value })
              }
            />
          </div>
        </div>

        <div className="modal-footer py-2 px-3">
        
          <button
            className="btn btn-sm btn-primary"
            onClick={handleSaveGroup}
          >
            {editingGroup ? "Update" : "Add"}
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

    </div>
  );
};

export default SupplierGroup;
