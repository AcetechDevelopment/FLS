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

// ✅ Sample KPI Data (kept static)
const kpiData = {
  customers: 120,
  material: { fresh: 30, soil: 15 },
  avgPrice: 750,
};

// ✅ Static fallback data for long stock pending
const longStockPending = [
  { customer: "Cust A", material: "Fresh", pending: 5 },
  { customer: "Cust B", material: "Soil", pending: 8 },
  { customer: "Cust C", material: "Fresh", pending: 3 },
  { customer: "Cust D", material: "Soil", pending: 4 },
  { customer: "Cust E", material: "Fresh", pending: 6 },
  { customer: "Cust F", material: "Soil", pending: 2 },
  { customer: "Cust G", material: "Fresh", pending: 7 },
  { customer: "Cust H", material: "Soil", pending: 5 },
  { customer: "Cust I", material: "Fresh", pending: 4 },
  { customer: "Cust J", material: "Soil", pending: 6 },
];

// ✅ API URLs
const TOP_CUSTOMERS_API = "https://115.124.111.111/FLS/public/api/dashboard/top-customers";
const LOW_CUSTOMERS_API = "https://115.124.111.111/FLS/public/api/dashboard/low-customers";

export default function Dashboard() {
  const [topCustomers, setTopCustomers] = useState([]);
  const [lowCustomers, setLowCustomers] = useState([]);
  const [chartData, setChartData] = useState([]);

  // ✅ Fetch API Data
  useEffect(() => {
    const token = sessionStorage.getItem("authToken");

    const fetchCustomers = async () => {
      try {
        const [topRes, lowRes] = await Promise.all([
          axios.get(TOP_CUSTOMERS_API, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(LOW_CUSTOMERS_API, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // ✅ Assign API data or fallback to static
        setTopCustomers(
          topRes.data?.data?.length
            ? topRes.data.data
            : [
                { name: "Cust A", value: 120 },
                { name: "Cust B", value: 110 },
                { name: "Cust C", value: 105 },
                { name: "Cust D", value: 100 },
                { name: "Cust E", value: 95 },
              ]
        );

        setLowCustomers(
          lowRes.data?.data?.length
            ? lowRes.data.data
            : [
                { name: "Cust F", value: 90 },
                { name: "Cust G", value: 85 },
                { name: "Cust H", value: 80 },
                { name: "Cust I", value: 75 },
                { name: "Cust J", value: 70 },
              ]
        );

        // ✅ Combine for chart
        const combinedData = [
          ...(topRes.data?.data || []),
          ...(lowRes.data?.data || []),
        ];
        setChartData(
          combinedData.length
            ? combinedData
            : [
                { name: "Cust A", value: 120 },
                { name: "Cust B", value: 110 },
                { name: "Cust C", value: 105 },
                { name: "Cust D", value: 100 },
                { name: "Cust E", value: 95 },
                { name: "Cust F", value: 90 },
                { name: "Cust G", value: 85 },
                { name: "Cust H", value: 80 },
                { name: "Cust I", value: 75 },
                { name: "Cust J", value: 70 },
              ]
        );
      } catch (error) {
        console.error("API error:", error);
        // Fallback to static data
        setTopCustomers([
          { name: "Cust A", value: 120 },
          { name: "Cust B", value: 110 },
          { name: "Cust C", value: 105 },
          { name: "Cust D", value: 100 },
          { name: "Cust E", value: 95 },
        ]);
        setLowCustomers([
          { name: "Cust F", value: 90 },
          { name: "Cust G", value: 85 },
          { name: "Cust H", value: 80 },
          { name: "Cust I", value: 75 },
          { name: "Cust J", value: 70 },
        ]);
        setChartData([
          { name: "Cust A", value: 120 },
          { name: "Cust B", value: 110 },
          { name: "Cust C", value: 105 },
          { name: "Cust D", value: 100 },
          { name: "Cust E", value: 95 },
          { name: "Cust F", value: 90 },
          { name: "Cust G", value: 85 },
          { name: "Cust H", value: 80 },
          { name: "Cust I", value: 75 },
          { name: "Cust J", value: 70 },
        ]);
      }
    };

    fetchCustomers();
  }, []);

  // ✅ Styling (same as your original)
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
    textAlign: "left",
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
            {kpiData.customers}
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
            <span style={{ color: "#007bff", fontWeight: "600", fontSize: "13px" }}>
              Fresh {kpiData.material.fresh}
            </span>
            <span style={{ color: "#ff4d4f", fontWeight: "600", fontSize: "13px" }}>
              Soil {kpiData.material.soil}
            </span>
          </div>
        </div>

        <div style={{ ...cardStyle, flex: "1 1 180px" }}>
          <div style={{ fontSize: "20px", fontWeight: "bold" }}>₹{kpiData.avgPrice}</div>
          <div style={labelStyle}>MATERIAL AVERAGE PRICE</div>
        </div>
      </div>

      {/* === CHART + TABLES === */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", alignItems: "flex-start" }}>
        {/* Chart Column */}
        <div style={{ ...cardStyle, flex: "2 1 400px" }}>
          <div style={{ fontWeight: "bold", marginBottom: "6px", fontSize: "14px" }}>
            Inward and Dispatch
          </div>

          <ResponsiveContainer width="100%" height={335}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* === RIGHT COLUMN === */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: "1 1 250px" }}>
          {/* Top Customers */}
          <div style={{ ...cardStyle, padding: "8px" }}>
            <div
              style={{
                fontWeight: "bold",
                marginBottom: "4px",
                fontSize: "12px",
                textAlign: "center",
              }}
            >
              Top 10 Customers
            </div>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                tableLayout: "fixed",
                fontSize: "12px",
              }}
            >
              <thead style={headerStyle}>
                <tr>
                  <th style={{ ...thTdStyle, textAlign: "center" }}>S.No</th>
                  <th style={{ ...thTdStyle, textAlign: "center" }}>Customer</th>
                  <th style={{ ...thTdStyle, textAlign: "center" }}>Value</th>
                </tr>
              </thead>
            </table>
            <div style={{ maxHeight: "120px", overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontSize: "12px" }}>
                <tbody>
                  {topCustomers.map((c, index) => (
                    <tr key={index}>
                      <td style={{ ...thTdStyle, textAlign: "center" }}>{index + 1}</td>
                      <td style={{ ...thTdStyle, textAlign: "center" }}>{c.name}</td>
                      <td style={{ ...thTdStyle, textAlign: "center" }}>{c.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low Customers */}
          <div style={{ ...cardStyle, padding: "8px" }}>
            <div
              style={{
                fontWeight: "bold",
                marginBottom: "4px",
                fontSize: "12px",
                textAlign: "center",
              }}
            >
              Low 10 Customers
            </div>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                tableLayout: "fixed",
                fontSize: "12px",
              }}
            >
              <thead style={headerStyle}>
                <tr>
                  <th style={{ ...thTdStyle, textAlign: "center" }}>S.No</th>
                  <th style={{ ...thTdStyle, textAlign: "center" }}>Customer</th>
                  <th style={{ ...thTdStyle, textAlign: "center" }}>Value</th>
                </tr>
              </thead>
            </table>
            <div style={{ maxHeight: "120px", overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontSize: "12px" }}>
                <tbody>
                  {lowCustomers.map((c, index) => (
                    <tr key={index}>
                      <td style={{ ...thTdStyle, textAlign: "center" }}>{index + 1}</td>
                      <td style={{ ...thTdStyle, textAlign: "center" }}>{c.name}</td>
                      <td style={{ ...thTdStyle, textAlign: "center" }}>{c.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <thead style={headerStyle}>
            <tr>
              <th style={{ ...thTdStyle, textAlign: "center" }}>Customer</th>
              <th style={{ ...thTdStyle, textAlign: "center" }}>Material</th>
              <th style={{ ...thTdStyle, textAlign: "center" }}>Pending Qty</th>
            </tr>
          </thead>
        </table>
        <div style={{ maxHeight: "250px", overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <tbody>
              {longStockPending.map((item, index) => (
                <tr key={index}>
                  <td style={{ ...thTdStyle, textAlign: "center" }}>{item.customer}</td>
                  <td style={{ ...thTdStyle, textAlign: "center" }}>{item.material}</td>
                  <td style={{ ...thTdStyle, textAlign: "center" }}>{item.pending}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
