import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "https://115.124.111.111/FLS/public/api/material/stock-management";

const MaterialStock = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("authToken");
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Material Stock API response:", response.data);

      const data = response.data?.data || [];

      // ✅ Automatically assign material_type if missing
      const processed = data.map((item) => {
        let materialType = "General";

        if (item.material_id?.startsWith("MID-01") || item.material_id?.startsWith("MID-02") || item.material_id?.startsWith("MID-03")) {
          materialType = "Cable";
        } else if (item.material_id?.startsWith("MID-04") || item.material_id?.startsWith("MID-05") || item.material_id?.startsWith("MID-06")) {
          materialType = "Accessories";
        }

        return { ...item, material_type: item.material_type || materialType };
      });

      setMaterials(processed);
    } catch (error) {
      console.error("Error fetching material stock:", error);
      toast.error("Error fetching material stock data");
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
                    <td colSpan="6" className="text-center py-2">
                      Loading...
                    </td>
                  </tr>
                ) : materials.length > 0 ? (
                  materials.map((m) => (
                    <tr key={m.id}>
                      <td className="py-1 px-2 text-center">{m.material_id || "-"}</td>
                      <td className="py-1 px-2 text-center">{m.customer_name || "-"}</td>
                      <td className="py-1 px-2 text-center">{m.material_name || "-"}</td>
                      {/* <td className="py-1 px-2 text-center">{m.default_price ?? 0}</td> */}
                      <td className="py-1 px-2 text-center">{m.material_type || "N/A"}</td>
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
