import { useContext } from "react";
import { MaterialContext } from "../../contexts/MaterialContext";

const MaterialStock = () => {
  const { materials } = useContext(MaterialContext);

  return (
    <div className="container mt-3">
      <div className="card shadow-sm border-0 rounded-3">
        <div className="card-body p-3">
          <h5 className="mb-3 fw-semibold text-primary">📦 Material Stock</h5>

          <div className="table-responsive">
            <table
              id="material-stock-table"
              className="table table-sm table-hover table-bordered align-middle mb-0"
              style={{ fontSize: "12px" }}
            >
              <thead className="table-primary text-center">
                <tr>
                  <th className="py-2 px-2 text-center">Material Code</th>
                  <th className="py-2 px-2 text-center">Material Name</th>
                  {/* <th className="py-2 px-2 text-center">Default Price</th> */}
                  <th className="py-2 px-2 text-center">Material Type</th>
                  <th className="py-2 px-2 text-center">Fresh</th>
                  <th className="py-2 px-2 text-center">Soil</th>
                </tr>
              </thead>
              <tbody>
                {materials.length > 0 ? (
                  materials.map((m) => (
                    <tr key={m.id}>
                      <td className="py-1 px-2 text-center">{m.materialCode}</td>
                      <td className="py-1 px-2 text-center">{m.materialName}</td>
                      {/* <td className="py-1 px-2 text-center">{m.defaultPrice || 0}</td> */}
                      <td className="py-1 px-2 text-center">{m.materialType}</td>
                      <td className="py-1 px-2 text-center">{m.fresh || 0}</td>
                      <td className="py-1 px-2 text-center">{m.soil || 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-2" style={{ fontSize: "12px" }}>
                      No materials found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialStock;