import { useState, useContext } from "react";
import { MaterialContext } from "../../contexts/MaterialContext";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const MaterialMaster = () => {
  const { materials, setMaterials } = useContext(MaterialContext);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formData, setFormData] = useState({
    materialName: "",
    materialCode: "",
    defaultPrice: "",
    materialType: "Raw",
  });

  const generateMaterialCode = () => {
    const nextNumber = materials.length + 1;
    return `MAT${String(nextNumber).padStart(3, "0")}`;
  };

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

  const handleEditMaterial = (material) => {
    setEditingMaterial(material);
    setFormData(material);
    setShowModal(true);
  };

  const handleSaveMaterial = () => {
    if (editingMaterial) {
      setMaterials(
        materials.map((m) =>
          m.id === editingMaterial.id
            ? { ...formData, id: editingMaterial.id }
            : m
        )
      );
    } else {
      setMaterials([...materials, { ...formData, id: Date.now() }]);
    }
    setShowModal(false);
  };

  const deleteMaterial = (id) => {
    setMaterials(materials.filter((m) => m.id !== id));
  };

  const exportPDF = () => {
    if (!materials.length) return alert("No materials to export.");
    const doc = new jsPDF();
    doc.text("Material Master", 14, 15);
    autoTable(doc, {
      head: [["Code", "Name", "Price", "Type"]],
      body: materials.map((m) => [
        m.materialCode,
        m.materialName,
        m.defaultPrice,
        m.materialType,
      ]),
    });
    doc.save("MaterialMaster.pdf");
  };

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

  const handlePrint = () => {
    if (!materials.length) return alert("No materials to print.");
    window.print();
  };

  const filteredMaterials = materials.filter(
    (m) =>
      m.materialName.toLowerCase().includes(search.toLowerCase()) ||
      m.materialCode.toLowerCase().includes(search.toLowerCase()) ||
      String(m.defaultPrice).toLowerCase().includes(search.toLowerCase()) ||
      m.materialType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mt-3">
      {/* Toolbar */}
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
  <table
    id="material-table"
    className="table table-bordered table-striped align-middle"
    style={{ fontSize: "12px" }}
  >
    <thead className="table-primary" style={{ fontSize: "12px" }}>
      <tr className="text-center">
        <th className="py-1 px-1">Material Code</th>
        <th className="py-1 px-1">Material Name</th>
        <th className="py-1 px-1">  Default Price     </th>
        <th className="py-1 px-1">Image</th>
        <th className="py-1 px-1" style={{ minWidth: "140px" }}>Action</th>
      </tr>
    </thead>

    <tbody>
      {materials
        .filter((material) => {
          const query = search.toLowerCase();
          return (
            material.name?.toLowerCase().includes(query) ||
            material.code?.toLowerCase().includes(query) ||
            material.unit?.toLowerCase().includes(query) ||
            material.hsn?.toLowerCase().includes(query)
          );
        })
        .map((material) => (
          <tr
            key={material.id}
            className="text-center"
            style={{ fontSize: "12px" }}
          >
            <td className="py-0 px-1">{material.code}</td>
            <td className="py-0 px-1">{material.name}</td>
            <td className="py-0 px-1">{material.unit}</td>
            <td className="py-0 px-1">{material.hsn}</td>
            <td className="py-0 px-1 text-center">
              {material.image ? (
                <img
                  src={material.image}
                  alt="Material"
                  width="25"
                  height="25"
                  style={{
                    cursor: "pointer",
                    borderRadius: "4px",
                    objectFit: "cover",
                  }}
                  onClick={() => {
                    setPreviewImage(material.image);
                    setShowImageModal(true);
                  }}
                />
              ) : (
                <span className="text-muted" style={{ fontSize: "11px" }}>
                  No Image
                </span>
              )}
            </td>
            <td className="py-0 px-1">
              {/* Edit */}
              <button
                className="btn btn-sm p-0 me-1"
                style={{ background: "transparent", border: "none" }}
                onClick={() => handleEditMaterial(material)}
                title="Edit"
              >
                <span
                  className="material-icons-two-tone text-warning"
                  style={{ fontSize: "16px" }}
                >
                  edit
                </span>
              </button>

              {/* Stock */}
              <button
                className="btn btn-sm p-0 me-1"
                style={{ background: "transparent", border: "none" }}
                onClick={() => alert("Open Stock for " + material.name)}
                title="Stock"
              >
                <span
                  className="material-icons-two-tone text-info"
                  style={{ fontSize: "16px" }}
                >
                  inventory_2
                </span>
              </button>

              {/* Delete */}
              <button
                className="btn btn-sm p-0"
                style={{ background: "transparent", border: "none" }}
                onClick={() => deleteRow(material.id)}
                title="Delete"
              >
                <span
                  className="material-icons-two-tone text-danger"
                  style={{ fontSize: "16px" }}
                >
                  delete
                </span>
              </button>
            </td>
          </tr>
        ))}

      {materials.filter((material) => {
        const query = search.toLowerCase();
        return (
          material.name?.toLowerCase().includes(query) ||
          material.code?.toLowerCase().includes(query) ||
          material.unit?.toLowerCase().includes(query) ||
          material.hsn?.toLowerCase().includes(query)
        );
      }).length === 0 && (
        <tr>
          <td
            colSpan="6"
            className="text-center text-muted py-2"
            style={{ fontSize: "12px" }}
          >
            No materials found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

      {/* Modal */}
      {showModal && (
        <div className="modal d-block" tabIndex="-1" style={{ background: "#00000099" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingMaterial ? "Edit Material" : "New Material"}
                </h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Material Name"
                  value={formData.materialName}
                  onChange={(e) =>
                    setFormData({ ...formData, materialName: e.target.value })
                  }
                />
                <input
                  type="number"
                  className="form-control mb-2"
                  placeholder="Default Price"
                  value={formData.defaultPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultPrice: e.target.value })
                  }
                />
                <select
                  className="form-select"
                  value={formData.materialType}
                  onChange={(e) =>
                    setFormData({ ...formData, materialType: e.target.value })
                  }
                >
                  <option value="Raw">Raw</option>
                  <option value="Finished">Finished</option>
                </select>
              </div>


              <div className="modal-footer">
  <button
    className="btn btn-secondary"
    onClick={() => setShowModal(false)}
  >
    Cancel
  </button>
  <button
    className="btn btn-primary"
    onClick={handleSaveMaterial}
  >
    {editingMaterial ? "Update" : "Add"}
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
