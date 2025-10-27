import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const VehicleInventory = () => {
  const [vehicles, setVehicles] = useState([]);

  // ✅ Simulated API fetch
  useEffect(() => {
    const demoData = [
      {
        id: 1,
        dc_number: "3DC001",
        vehicle_no: "MH12AB1234",
        material: "Copper Cable",
        weight: 1250,
        date: "2025-10-25",
      },
      {
        id: 2,
        dc_number: "3DC002",
        vehicle_no: "MH12AB5678",
        material: "Aluminium Wire",
        weight: 980,
        date: "2025-10-26",
      },
      {
        id: 3,
        dc_number: "3DC003",
        vehicle_no: "MH12AB9999",
        material: "Insulation PVC",
        weight: 720,
        date: "2025-10-27",
      },
      {
        id: 4,
        dc_number: "3DC004",
        vehicle_no: "MH12AB1234",
        material: "Copper Cable",
        weight: 1100,
        date: "2025-10-28",
      },
      {
        id: 5,
        dc_number: "3DC005",
        vehicle_no: "MH12AB1234",
        material: "Steel Rod",
        weight: 960,
        date: "2025-10-29",
      },
      {
        id: 6,
        dc_number: "3DC006",
        vehicle_no: "MH12AB5678",
        material: "Plastic Pipe",
        weight: 650,
        date: "2025-10-29",
      },
    ];
    setVehicles(demoData);
  }, []);

  // ✅ Each 3 DCs = 1 trip
  const totalTrips = Math.ceil(vehicles.length / 3);

  // ✅ Unique vehicle count
  const totalVehicles = new Set(vehicles.map((v) => v.vehicle_no)).size;

  // ✅ Total weight
  const totalWeight = vehicles.reduce((sum, v) => sum + v.weight, 0);

  return (
    <div className="container-fluid mt-3">
      <div
        className="card shadow-sm"
        style={{ borderRadius: "8px", border: "1px solid #dee2e6" }}
      >
        <div
          className="card-header py-2 px-3"
          style={{
            background: "linear-gradient(90deg, #007bff, #00b4d8)",
            color: "#fff",
            fontSize: "13px",
            fontWeight: "600",
          }}
        >
          Vehicle Inventory
        </div>

        <div className="card-body p-2">
          <div
            className="table-responsive"
            style={{
              borderRadius: "8px",
              overflow: "hidden",
              backgroundColor: "#fff",
              boxShadow: "0 1px 5px rgba(0,0,0,0.08)",
            }}
          >
            <table
              className="table align-middle mb-0 text-center"
              style={{
                fontSize: "11px",
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead
                style={{
                  background: "linear-gradient(90deg, #007bff, #00b4d8)",
                  color: "#fff",
                  textTransform: "uppercase",
                  fontSize: "11px",
                }}
              >
                <tr>
                  {[
                    "#",
                    "DC Number",
                    "Vehicle No",
                    "Material",
                    "Weight (kg)",
                    "Date",
                  ].map((header, i) => (
                    <th
                      key={i}
                      style={{
                        padding: "4px 5px",
                        fontWeight: "600",
                        border: "1px solid #dee2e6",
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {vehicles.length > 0 ? (
                  vehicles.map((v, index) => (
                    <tr
                      key={v.id}
                      style={{
                        backgroundColor: index % 2 === 0 ? "#f9fafb" : "#ffffff",
                        transition: "background-color 0.15s ease-in-out",
                        lineHeight: "1.1",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#e8f2ff")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          index % 2 === 0 ? "#f9fafb" : "#ffffff")
                      }
                    >
                      <td style={{ padding: "3px 5px", border: "1px solid #dee2e6" }}>
                        {index + 1}
                      </td>
                      <td style={{ padding: "3px 5px", border: "1px solid #dee2e6" }}>
                        {v.dc_number}
                      </td>
                      <td style={{ padding: "3px 5px", border: "1px solid #dee2e6" }}>
                        {v.vehicle_no}
                      </td>
                      <td style={{ padding: "3px 5px", border: "1px solid #dee2e6" }}>
                        {v.material}
                      </td>
                      <td
                        style={{
                          padding: "3px 5px",
                          border: "1px solid #dee2e6",
                          textAlign: "right",
                        }}
                      >
                        {v.weight.toLocaleString()}
                      </td>
                      <td style={{ padding: "3px 5px", border: "1px solid #dee2e6" }}>
                        {v.date}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        textAlign: "center",
                        color: "#6c757d",
                        fontSize: "10px",
                        padding: "6px",
                        border: "1px solid #dee2e6",
                      }}
                    >
                      No Records Found
                    </td>
                  </tr>
                )}

                {/* ✅ Summary Rows */}
                {vehicles.length > 0 && (
                  <>
                    <tr style={{ backgroundColor: "#e9f5ff", fontWeight: "600" }}>
                      <td
                        colSpan="3"
                        style={{
                          border: "1px solid #dee2e6",
                          textAlign: "right",
                          padding: "5px",
                        }}
                      >
                        Total Weight:
                      </td>
                      <td
                        colSpan="3"
                        style={{
                          border: "1px solid #dee2e6",
                          textAlign: "left",
                          padding: "5px",
                          color: "#007bff",
                        }}
                      >
                        {totalWeight.toLocaleString()} kg
                      </td>
                    </tr>

                    <tr style={{ backgroundColor: "#e9f5ff", fontWeight: "600" }}>
                      <td
                        colSpan="3"
                        style={{
                          border: "1px solid #dee2e6",
                          textAlign: "right",
                          padding: "5px",
                        }}
                      >
                        Total Trips (3 DCs = 1 Trip):
                      </td>
                      <td
                        colSpan="3"
                        style={{
                          border: "1px solid #dee2e6",
                          textAlign: "left",
                          padding: "5px",
                          color: "#007bff",
                        }}
                      >
                        {totalTrips}
                      </td>
                    </tr>

                    <tr style={{ backgroundColor: "#e9f5ff", fontWeight: "600" }}>
                      <td
                        colSpan="3"
                        style={{
                          border: "1px solid #dee2e6",
                          textAlign: "right",
                          padding: "5px",
                        }}
                      >
                        Total Vehicle Entries:
                      </td>
                      <td
                        colSpan="3"
                        style={{
                          border: "1px solid #dee2e6",
                          textAlign: "left",
                          padding: "5px",
                          color: "#007bff",
                        }}
                      >
                        {totalVehicles}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleInventory;
