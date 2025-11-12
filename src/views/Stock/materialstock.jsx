import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiService } from "../../services/api";
import Loading from "../../components/Loading";

const MaterialStock = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const data = await apiService.getMaterialStock();
      setMaterials(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

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
                  <th className="py-2 px-2 text-center">Customer Name</th>
                  <th className="py-2 px-2 text-center">Material Name</th>
                  {/* <th className="py-2 px-2 text-center">Default Price</th> */}
                  <th className="py-2 px-2 text-center">Material Type</th>
                  <th className="py-2 px-2 text-center">Fresh</th>
                  <th className="py-2 px-2 text-center">Soil</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6">
                      <Loading message="Loading material stock..." />
                    </td>
                  </tr>
                ) : materials.length > 0 ? (
                  materials.map((m) => (
                    <tr key={m.id}>
                      <td className="py-1 px-2 text-center">{m.material_id || "-"}</td>
                      <td className="py-1 px-2 text-center">{m.customer_name || "-"}</td>
                      <td className="py-1 px-2 text-center">{m.material_name || "-"}</td>
                      {/* <td className="py-1 px-2 text-center">{m.default_price ?? 0}</td> */}
                      <td className="py-1 px-2 text-center">{m.material_type || "-"}</td>
                      <td className="py-1 px-2 text-center">{m.fresh || 0}</td>
                      <td className="py-1 px-2 text-center">{m.qty || 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-2">
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
