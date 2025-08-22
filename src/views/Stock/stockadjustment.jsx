import { useContext, useState } from "react";
import { MaterialContext } from "../../contexts/MaterialContext";

const StockAdjustment = () => {
  const { materials, setMaterials } = useContext(MaterialContext);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({ stock: 0, price: 0 });

  const handleEdit = (m) => {
    setEditingId(m.id);
    setEditValues({
      stock: m.stock || 0,
      price: m.defaultPrice || 0,
    });
  };

  const handleSave = (id) => {
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              stock: Number(editValues.stock),
              defaultPrice: Number(editValues.price),
            }
          : m
      )
    );
    setEditingId(null);
  };

  return (
    <div className="container mt-3">
      <h5 className="mb-3">Stock Adjustment</h5>
      <div className="table-responsive">
        <table
          id="stock-adjustment-table"
          className="table table-bordered table-striped align-middle text-center"
          style={{ fontSize: "12px" }}
        >
          <thead className="table-primary" style={{ fontSize: "12px" }}>
            <tr>
              <th className="py-1 px-1">Material Code</th>
              <th className="py-1 px-1">Material Name</th>
              <th className="py-1 px-1">Default Price</th>
              <th className="py-1 px-1">Current Stock</th>
              <th className="py-1 px-1" style={{ minWidth: "120px" }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {materials.length > 0 ? (
              materials.map((m) => (
                <tr key={m.id}>
                  <td className="py-1 px-1">{m.materialCode}</td>
                  <td className="py-1 px-1">{m.materialName}</td>

                  {/* Default Price column */}
                  <td className="py-1 px-1">
                    {editingId === m.id ? (
                      <input
                        type="number"
                        className="form-control form-control-sm text-center"
                        value={editValues.price}
                        onChange={(e) =>
                          setEditValues({ ...editValues, price: e.target.value })
                        }
                      />
                    ) : (
                      <>₹ {m.defaultPrice || 0}</>
                    )}
                  </td>

                  {/* Stock column */}
                  <td className="py-1 px-1">
                    {editingId === m.id ? (
                      <input
                        type="number"
                        className="form-control form-control-sm text-center"
                        value={editValues.stock}
                        onChange={(e) =>
                          setEditValues({ ...editValues, stock: e.target.value })
                        }
                      />
                    ) : (
                      m.stock || 0
                    )}
                  </td>

                  {/* Action column */}
                <td className="py-1 px-1">
  {editingId === m.id ? (
    <>
      <button
        className="btn btn-success btn-sm me-1"
        onClick={() => handleSave(m.id)}
      >
        <span className="material-icons">save</span> {/* ✅ Save icon */}
      </button>
      <button
        className="btn btn-danger btn-sm"
        onClick={() => setEditingId(null)}
      >
        <span className="material-icons">cancel</span> {/* ✅ Cancel icon */}
      </button>
    </>
  ) : (
    <button
      className="btn btn-warning btn-sm"
      onClick={() => handleEdit(m)}
    >
      <span className="material-icons">  edit </span> {/* ✅ Better edit icon */}
    </button>
  )}
</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
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
    </div>
  );
};

export default StockAdjustment;
