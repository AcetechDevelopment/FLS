import { useContext } from "react";
import { MaterialContext } from "../../contexts/MaterialContext";

const MaterialStock = () => {
  const { materials } = useContext(MaterialContext);

  return (
    <div className="container mt-3">
      <h5 className="mb-3">Material Stock</h5>
      <div className="table-responsive">
        <table
          id="material-stock-table"
          className="table table-bordered table-striped align-middle"
          style={{ fontSize: "12px" }}
        >
          <thead className="table-primary" style={{ fontSize: "12px" }}>
            <tr className="text-center">
              <th className="py-1 px-1">Material Code</th>
              <th className="py-1 px-1">Material Name</th>
              <th className="py-1 px-1">Default Price</th>
              <th className="py-1 px-1">Material Type</th>
            </tr>
          </thead>
          <tbody>
            {materials.length > 0 ? (
              materials.map((m) => (
                <tr key={m.id} className="text-center">
                  <td className="py-1 px-1">{m.materialCode}</td>
                  <td className="py-1 px-1">{m.materialName}</td>
                  <td className="py-1 px-1">₹ {m.defaultPrice || 0}</td>
                  <td className="py-1 px-1">{m.materialType}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
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

export default MaterialStock;
