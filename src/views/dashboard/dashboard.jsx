import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const DASHBOARD_API =
  "https://115.124.111.111/FLS/public/api/options/dashboard-count";

export default function Dashboard() {
  const [kpiData, setKpiData] = useState({
    customerCount: 0,
    freshCount: 0,
    soilCount: 0,
    avgPrice: 0,
  });
  const [maxValues, setMaxValues] = useState([]);
  const [minValues, setMinValues] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [longStockPending] = useState([
    { customer: "Cust A", material: "Fresh", pending: 5 },
    { customer: "Cust B", material: "Soil", pending: 8 },
    { customer: "Cust C", material: "Fresh", pending: 3 },
    { customer: "Cust D", material: "Soil", pending: 4 },
    { customer: "Cust E", material: "Fresh", pending: 6 },
    { customer: "Cust F", material: "Soil", pending: 2 },
    { customer: "Cust G", material: "Fresh", pending: 7 },
    { customer: "Cust H", material: "Soil", pending: 5 },
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = sessionStorage.getItem("authToken");

      try {
        const response = await axios.get(DASHBOARD_API, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("📊 Dashboard API Response:", response.data);

        const data = response.data || {};

        // ✅ Update KPI Data
        setKpiData({
          customerCount: data.customer_count || 0,
          freshCount: data.fresh_count || 0,
          soilCount: data.soil_count || 0,
          avgPrice: parseFloat(data.Avg_price || 0).toFixed(2),
        });

        // ✅ Update Tables
        setMaxValues(data.max_values || []);
        setMinValues(data.min_values || []);

        // ✅ Combine for chart (for visual)
        const chartArray = [
          ...(data.max_values || []),
          ...(data.min_values || []),
        ].map((item) => ({
          name: item.customer_name || item.material_name,
          value: parseInt(item.total_qty || 0),
        }));
        setChartData(chartArray);
      } catch (error) {
        console.error("Dashboard API error:", error);
      }
    };

    fetchDashboardData();
  }, []);

  // === STYLES ===
  const cardStyle = {
    background: "#fff",
    borderRadius: "12px",
    padding: "12px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  };
  const labelStyle = { fontSize: "12px", color: "#666", marginTop: "3px" };
  const thTdStyle = {
    border: "1px solid #e0e0e0",
    padding: "6px",
    textAlign: "center",
    fontSize: "12px",
  };
  const headerStyle = { background: "#f0f2f5", fontWeight: "bold" };

  return (
    <div
      style={{
        padding: "10px",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      {/* === KPI CARDS === */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          justifyContent: "space-between",
        }}
      >
        <div style={{ ...cardStyle, flex: "1 1 180px" }}>
          <div style={{ fontSize: "20px", fontWeight: "bold" }}>
            {kpiData.customerCount}
          </div>
          <div style={labelStyle}>CUSTOMER COUNT</div>
        </div>

        <div style={{ ...cardStyle, flex: "1 1 180px" }}>
          <div style={{ fontSize: "13px", color: "#555" }}>Material Count</div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              marginTop: "6px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                color: "#007bff",
                fontWeight: "600",
                fontSize: "13px",
              }}
            >
              Fresh {kpiData.freshCount}
            </span>
            <span
              style={{
                color: "#ff4d4f",
                fontWeight: "600",
                fontSize: "13px",
              }}
            >
              Soil {kpiData.soilCount}
            </span>
          </div>
        </div>

        <div style={{ ...cardStyle, flex: "1 1 180px" }}>
          <div style={{ fontSize: "20px", fontWeight: "bold" }}>
            ₹{kpiData.avgPrice}
          </div>
          <div style={labelStyle}>AVERAGE PRICE</div>
        </div>
      </div>

      {/* === CHART + TABLES === */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "15px",
          alignItems: "flex-start",
        }}
      >
        {/* === CHART === */}
        <div style={{ ...cardStyle, flex: "2 1 400px" }}>
          <div
            style={{ fontWeight: "bold", marginBottom: "6px", fontSize: "14px" }}
          >
            Material Movement (Max / Min)
          </div>

          <ResponsiveContainer width="100%" height={335}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* === RIGHT COLUMN TABLES === */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            flex: "1 1 250px",
          }}
        >
          {/* === Top Materials === */}
          <div style={{ ...cardStyle, padding: "8px" }}>
            <div
              style={{
                fontWeight: "bold",
                marginBottom: "4px",
                fontSize: "12px",
                textAlign: "center",
              }}
            >
              Top Performing Materials / Customers
            </div>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "12px",
              }}
            >
              <thead style={headerStyle}>
                <tr>
                  <th style={thTdStyle}>S.No</th>
                  <th style={thTdStyle}>Material</th>
                  <th style={thTdStyle}>Customer</th>
                  <th style={thTdStyle}>Total Qty</th>
                </tr>
              </thead>
              <tbody>
                {maxValues.length > 0 ? (
                  maxValues.map((item, index) => (
                    <tr key={index}>
                      <td style={thTdStyle}>{index + 1}</td>
                      <td style={thTdStyle}>{item.material_name}</td>
                      <td style={thTdStyle}>{item.customer_name}</td>
                      <td style={thTdStyle}>{item.total_qty}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={thTdStyle}>
                      No Data Available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* === Low Materials === */}
          <div style={{ ...cardStyle, padding: "8px" }}>
            <div
              style={{
                fontWeight: "bold",
                marginBottom: "4px",
                fontSize: "12px",
                textAlign: "center",
              }}
            >
              Low Performing Materials / Customers
            </div>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "12px",
              }}
            >
              <thead style={headerStyle}>
                <tr>
                  <th style={thTdStyle}>S.No</th>
                  <th style={thTdStyle}>Material</th>
                  <th style={thTdStyle}>Customer</th>
                  <th style={thTdStyle}>Total Qty</th>
                </tr>
              </thead>
              <tbody>
                {minValues.length > 0 ? (
                  minValues.map((item, index) => (
                    <tr key={index}>
                      <td style={thTdStyle}>{index + 1}</td>
                      <td style={thTdStyle}>{item.material_name}</td>
                      <td style={thTdStyle}>{item.customer_name}</td>
                      <td style={thTdStyle}>{item.total_qty}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={thTdStyle}>
                      No Data Available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* === Long Stock Pending === */}
      <div style={{ ...cardStyle, marginTop: "12px" }}>
        <div
          style={{
            fontWeight: "bold",
            marginBottom: "6px",
            fontSize: "14px",
            textAlign: "center",
          }}
        >
          Long Stock Pending Customers
        </div>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "12px",
          }}
        >
          <thead style={headerStyle}>
            <tr>
              <th style={thTdStyle}>Customer</th>
              <th style={thTdStyle}>Material</th>
              <th style={thTdStyle}>Pending Qty</th>
            </tr>
          </thead>
          <tbody>
            {longStockPending.map((item, index) => (
              <tr key={index}>
                <td style={thTdStyle}>{item.customer}</td>
                <td style={thTdStyle}>{item.material}</td>
                <td style={thTdStyle}>{item.pending}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
