import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const MaterialMaster = () => {
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState({
    materialName: "",
    materialCode: "",
    defaultPrice: "",
    materialType: "Raw", // Default dropdown value
  });

  // ✅ Generate Material Code
  const generateMaterialCode = () => {
    const nextNumber = materials.length + 1;
    return `MAT${String(nextNumber).padStart(3, "0")}`;
  };

  // Open modal for new material
  const handleNewMaterial = () => {
    setEditingMaterial(null);
    setFormData({
      materialName: "",
      materialCode: generateMaterialCode(),
      defaultPrice: "",
      materialType: "Raw",
    });
    setShowModal(true);
  };

  // Open modal for editing material
  const handleEditMaterial = (material) => {
    setEditingMaterial(material);
    setFormData(material);
    setShowModal(true);
  };

  // Save material
  const handleSaveMaterial = () => {
    if (editingMaterial) {
      setMaterials(
        materials.map((m) =>
          m.id === editingMaterial.id ? { ...formData, id: editingMaterial.id } : m
        )
      );
    } else {
      setMaterials([...materials, { ...formData, id: Date.now() }]);
    }
    setShowModal(false);
  };

  // Delete material
  const deleteMaterial = (id) => {
    setMaterials(materials.filter((m) => m.id !== id));
  };

  // Export PDF
  const exportPDF = () => {
    if (!materials.length) return alert("No materials to export.");
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Material Master", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["Material Code", "Material Name", "Default Price", "Material Type"]],
      body: materials.map((m) => [m.materialCode, m.materialName, m.defaultPrice, m.materialType]),
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 123, 255] },
    });

    doc.save("MaterialMaster.pdf");
  };

  // Export Excel
  const exportExcel = () => {
    if (!materials.length) return alert("No materials to export.");
    const data = materials.map((m) => ({
      "Material Code": m.materialCode,
      "Material Name": m.materialName,
      "Default Price": m.defaultPrice,
      "Material Type": m.materialType,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Materials");
    XLSX.writeFile(workbook, "MaterialMaster.xlsx");
  };

  // Print Table
// Print Table
const handlePrint = () => {
  if (!materials.length) return alert("No materials to print.");
  const table = document.getElementById("material-table");
  const cloneTable = table.cloneNode(true);

  // ✅ Remove "Action" column (last column) from header
  const ths = cloneTable.querySelectorAll("thead th");
  if (ths.length) {
    ths[ths.length - 1].remove();
  }

  // ✅ Remove "Action" cells from each row
  const trs = cloneTable.querySelectorAll("tbody tr");
  trs.forEach((tr) => {
    const tds = tr.querySelectorAll("td");
    if (tds.length) {
      tds[tds.length - 1].remove();
    }
  });

  const printWindow = window.open("", "", "width=900,height=600");
  printWindow.document.write(`
    <html>
      <head>
        <title>Material Master</title>
        <style>
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
          th { background-color: #0d6efd; color: white; }
        </style>
      </head>
      <body>
        <h2>Material Master</h2>
        ${cloneTable.outerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
};

  // Filtered materials
  // const filteredMaterials = materials.filter(
  //   (m) =>
  //     m.materialName.toLowerCase().includes(search.toLowerCase()) ||
  //     m.materialCode.toLowerCase().includes(search.toLowerCase())
  // );

  const filteredMaterials = materials.filter((m) =>
  m.materialName.toLowerCase().includes(search.toLowerCase()) ||
  m.materialCode.toLowerCase().includes(search.toLowerCase()) ||
  String(m.defaultPrice).toLowerCase().includes(search.toLowerCase()) || // ✅ handles number as string
  m.materialType.toLowerCase().includes(search.toLowerCase())
);

  return (
    <div className="container">

      {/* Toolbar */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <div className="d-flex flex-wrap gap-1 mb-2">
          <button
            className="btn btn-sm btn-success py-1 px-2 d-flex align-items-center"
            onClick={handleNewMaterial}
          >
            <span className="material-icons-two-tone me-1" style={{ fontSize: "14px" }}>add</span>
            New
          </button>
          <button
            className="btn btn-sm btn-danger py-1 px-2 d-flex align-items-center"
            onClick={exportPDF}
          >
            <span className="material-icons-two-tone me-1" style={{ fontSize: "14px" }}>picture_as_pdf</span>
            PDF
          </button>
          <button
            className="btn btn-sm text-white py-1 px-2 d-flex align-items-center"
            style={{ backgroundColor: "#1D6F42", borderColor: "#1D6F42" }}
            onClick={exportExcel}
          >
            <span className="material-icons-two-tone me-1" style={{ fontSize: "14px" }}>grid_on</span>
            Excel
          </button>
          <button
            className="btn btn-sm btn-primary py-1 px-2 d-flex align-items-center"
            onClick={handlePrint}
          >
            <span className="material-icons-two-tone me-1" style={{ fontSize: "14px" }}>print</span>
            Print
          </button>
        </div>

        <div style={{ width: "250px" }}>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="🔍 Search material..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table id="material-table" className="table table-bordered table-striped align-middle" style={{ fontSize: "12px" }}>
          <thead className="table-primary" style={{ fontSize: "12px" }}>
            <tr className="text-center">
              <th className="py-1 px-1">Material Code</th>
              <th className="py-1 px-1">Material Name</th>
              <th className="py-1 px-1">Default Price</th>
              <th className="py-1 px-1">Material Type</th>
              <th className="py-1 px-1" style={{ minWidth: "140px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterials.map((m) => (
             <tr key={m.id} className="text-center" style={{ fontSize: "12px" }}>
                <td className="py-0 px-1">{m.materialCode}</td>
                <td className="py-0 px-1">{m.materialName}</td>
                <td className="py-0 px-1">{m.defaultPrice}</td>
                <td className="py-0 px-1">{m.materialType}</td>
                <td className="py-0 px-1">
                  <button
                    className="btn btn-sm p-0 me-1"
                    style={{ background: "transparent", border: "none" }}
                    onClick={() => handleEditMaterial(m)}
                    title="Edit"
                  >
                    <span className="material-icons-two-tone text-warning" style={{ fontSize: "16px" }}>edit</span>
                  </button>
                  <button
                    className="btn btn-sm p-0"
                    style={{ background: "transparent", border: "none" }}
                    onClick={() => deleteMaterial(m.id)}
                    title="Delete"
                  >
                    <span className="material-icons-two-tone text-danger" style={{ fontSize: "16px" }}>delete</span>
                  </button>
                </td>
              </tr>
            ))}
            {filteredMaterials.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-muted py-2" style={{ fontSize: "12px" }}>
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
          <div className="modal-dialog modal-sm">
            <div className="modal-content" style={{ fontSize: "13px" }}>
              <div className="modal-header py-2">
                <h6 className="modal-title">{editingMaterial ? "Edit Material" : "Add Material"}</h6>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body p-2">
                <div className="mb-2">
                  <label className="form-label" style={{ fontSize: "12px" }}>Material Code</label>
                  <input type="text" className="form-control form-control-sm" value={formData.materialCode} readOnly />
                </div>
                <div className="mb-2">
                  <label className="form-label" style={{ fontSize: "12px" }}>Material Name</label>
                  <input type="text" className="form-control form-control-sm" value={formData.materialName} onChange={(e) => setFormData({ ...formData, materialName: e.target.value })} />
                </div>
                <div className="mb-2">
                  <label className="form-label" style={{ fontSize: "12px" }}>Default Price</label>
                  <input type="number" className="form-control form-control-sm" value={formData.defaultPrice} onChange={(e) => setFormData({ ...formData, defaultPrice: e.target.value })} />
                </div>
                <div className="mb-2">
                  <label className="form-label" style={{ fontSize: "12px" }}>Material Type</label>
                  <select className="form-select form-select-sm" value={formData.materialType} onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}>
                    <option value="Raw">Raw</option>
                    <option value="Finished">Finished</option>
                    <option value="Consumable">Consumable</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer py-2">
                <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={handleSaveMaterial}>{editingMaterial ? "Update" : "Add"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MaterialMaster;
