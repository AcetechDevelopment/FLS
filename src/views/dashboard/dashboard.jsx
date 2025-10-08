import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Sample Data
const kpiData = {
  customers: 120,
  material: { fresh: 30, soil: 15 },
  avgPrice: 750,
};

const customerData = [
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
];

const topCustomers = customerData.slice(0, 5);
const lowCustomers = customerData.slice(5, 10);

// Long Stock Pending Data per Customer
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
  { customer: "Cust K", material: "Fresh", pending: 3 },
  { customer: "Cust L", material: "Soil", pending: 2 },
  { customer: "Cust M", material: "Fresh", pending: 5 },
  { customer: "Cust N", material: "Soil", pending: 4 },
  { customer: "Cust O", material: "Fresh", pending: 6 },
];

export default function Dashboard() {
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
      {/* KPI Cards */}
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
          <div style={{ fontSize: "20px", fontWeight: "bold" }}>
            ₹{kpiData.avgPrice}
          </div>
          <div style={labelStyle}>MATERIAL AVERAGE PRICE</div>
        </div>
      </div>

      {/* Chart + Tables */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", alignItems: "flex-start" }}>
        {/* Chart Column */}
        <div style={{ ...cardStyle, flex: "2 1 400px" }}>
          <div style={{ fontWeight: "bold", marginBottom: "6px", fontSize: "14px" }}>
            Inward and Dispatch
          </div>

          <ResponsiveContainer width="100%" height={335}>
            <LineChart data={customerData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={10} />
              <YAxis fontSize={10} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Right Column: Top/Low Customers */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: "1 1 250px" }}>
          {/* Top Customers */}
{/* Top Customers */}
<div style={{ ...cardStyle, padding: "8px" }}>
  <div style={{ fontWeight: "bold", marginBottom: "4px", fontSize: "12px", textAlign: "center" }}>
    Top 10 Customers
  </div>

  {/* Table Header */}
  <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontSize: "12px" }}>
    <thead style={headerStyle}>
      <tr>
        <th style={{ ...thTdStyle, width: "33.33%", textAlign: "center", padding: "4px" }}>S.No</th>
        <th style={{ ...thTdStyle, width: "33.33%", textAlign: "center", padding: "4px" }}>Customer</th>
        <th style={{ ...thTdStyle, width: "33.33%", textAlign: "center", padding: "4px" }}>Value</th>
      </tr>
    </thead>
  </table>

  {/* Table Body */}
  <div style={{ maxHeight: "120px", overflowY: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontSize: "12px" }}>
      <tbody>
        {topCustomers.map((c, index) => (
          <tr key={index}>
            <td style={{ ...thTdStyle, textAlign: "center", padding: "4px" }}>{index + 1}</td>
            <td style={{ ...thTdStyle, textAlign: "center", padding: "4px" }}>{c.name}</td>
            <td style={{ ...thTdStyle, textAlign: "center", padding: "4px" }}>{c.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

{/* Low Customers */}
<div style={{ ...cardStyle, padding: "8px", marginTop: "8px" }}>
  <div style={{ fontWeight: "bold", marginBottom: "4px", fontSize: "12px", textAlign: "center" }}>
    Low 10 Customers
  </div>

  {/* Table Header */}
  <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontSize: "12px" }}>
    <thead style={headerStyle}>
      <tr>
        <th style={{ ...thTdStyle, width: "33.33%", textAlign: "center", padding: "4px" }}>S.No</th>
        <th style={{ ...thTdStyle, width: "33.33%", textAlign: "center", padding: "4px" }}>Customer</th>
        <th style={{ ...thTdStyle, width: "33.33%", textAlign: "center", padding: "4px" }}>Value</th>
      </tr>
    </thead>
  </table>

  {/* Table Body */}
  <div style={{ maxHeight: "120px", overflowY: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", fontSize: "12px" }}>
      <tbody>
        {lowCustomers.map((c, index) => (
          <tr key={index}>
            <td style={{ ...thTdStyle, textAlign: "center", padding: "4px" }}>{index + 1}</td>
            <td style={{ ...thTdStyle, textAlign: "center", padding: "4px" }}>{c.name}</td>
            <td style={{ ...thTdStyle, textAlign: "center", padding: "4px" }}>{c.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

        </div>
      </div>

      {/* === Separate Card for Long Stock Pending === */}
  <div style={{ ...cardStyle, marginTop: "12px" }}>
  <div style={{ fontWeight: "bold", marginBottom: "6px", fontSize: "14px", textAlign: "center" }}>
    Long Stock Pending Customers 
  </div>

  {/* Table Header */}
  <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
    <thead style={headerStyle}>
      <tr>
        <th style={{ ...thTdStyle, textAlign: "center", width: "33.33%" }}>Customer</th>
        <th style={{ ...thTdStyle, textAlign: "center", width: "33.33%" }}>Material</th>
        <th style={{ ...thTdStyle, textAlign: "center", width: "33.33%" }}>Pending Qty</th>
      </tr>
    </thead>
  </table>

  {/* Table Body */}
  <div style={{ maxHeight: "250px", overflowY: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
      <tbody>
        {longStockPending.map((item, index) => (
          <tr key={index}>
            <td style={{ ...thTdStyle, textAlign: "center", width: "33.33%" }}>{item.customer}</td>
            <td style={{ ...thTdStyle, textAlign: "center", width: "33.33%" }}>{item.material}</td>
            <td style={{ ...thTdStyle, textAlign: "center", width: "33.33%" }}>{item.pending}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

    </div>
  );
}
