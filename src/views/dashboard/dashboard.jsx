import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  ResponsiveContainer
} from "recharts";

const kpiData = {
  customers: 120,
  material: { fresh: 30, soil: 15 },
  avgPrice: 750,
};

const monthlySalesData = [
  { month: "Jan", sales: 23, avg: 30 },
  { month: "Feb", sales: 11, avg: 25 },
  { month: "Mar", sales: 22, avg: 28 },
  { month: "Apr", sales: 27, avg: 35 },
  { month: "May", sales: 13, avg: 20 },
  { month: "Jun", sales: 22, avg: 30 },
  { month: "Jul", sales: 37, avg: 40 },
  { month: "Aug", sales: 21, avg: 25 },
  { month: "Sep", sales: 44, avg: 50 },
  { month: "Oct", sales: 22, avg: 30 },
  { month: "Nov", sales: 29, avg: 35 },
  { month: "Dec", sales: 40, avg: 45 },
];

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
  { name: "Cust K", value: 20 },
  { name: "Cust L", value: 25 },
  { name: "Cust M", value: 30 },
  { name: "Cust N", value: 35 },
  { name: "Cust O", value: 40 },
  { name: "Cust P", value: 45 },
  { name: "Cust Q", value: 50 },
  { name: "Cust R", value: 55 },
  { name: "Cust S", value: 60 },
  { name: "Cust T", value: 65 }
];

const topCustomers = customerData.slice(0, 10);
const lowCustomers = customerData.slice(10);

export default function Dashboard() {
  const cardStyle = {
    background: "#fff",
    borderRadius: "16px",
    padding: "20px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  };

  const labelStyle = { fontSize: "12px", color: "#888", marginTop: "5px" };
  const thTdStyle = { border: "1px solid #e0e0e0", padding: "8px", textAlign: "left" };
  const headerStyle = { background: "#f0f2f5", fontWeight: "bold" };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif", background: "#f5f6fa", minHeight: "100vh" }}>
      
      {/* Top KPI Cards */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "20px" }}>
        <div style={{ ...cardStyle, flex: 1, minWidth: "180px" }}>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>{kpiData.customers}</div>
          <div style={labelStyle}>CUSTOMER COUNT</div>
        </div>
        <div style={{ ...cardStyle, flex: 1, minWidth: "180px" }}>
          <div style={{ fontSize: "14px", color: "#555" }}>Material Count</div>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "10px" }}>
            <span style={{ color: "#007bff", fontWeight: "600" }}>Fresh {kpiData.material.fresh}</span>
            <span style={{ color: "#ff4d4f", fontWeight: "600" }}>Soil {kpiData.material.soil}</span>
          </div>
        </div>
        <div style={{ ...cardStyle, flex: 1, minWidth: "180px" }}>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>₹{kpiData.avgPrice}</div>
          <div style={labelStyle}>AVERAGE PRICE</div>
        </div>
      </div>

      {/* Top/Low Customers + Chart */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "20px",
          alignItems: "flex-start",
        }}
      >
        {/* Line Chart */}
      <div style={{ ...cardStyle, flex: 2, minWidth: "300px" }}>
  <div style={{ fontWeight: "bold", marginBottom: "10px" }}>Customer Value Trend</div>
  <ResponsiveContainer width="100%" height={350}>
    <LineChart data={customerData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>

  {/* Stock Long Pending Card below the chart */}
  <div
    style={{
      ...cardStyle,
      marginTop: "20px",
      background: "#fff3cd",
      borderColor: "#ffeeba",
      textAlign: "center",
      padding: "15px",
    }}
  >
    <div style={{ fontSize: "22px", fontWeight: "700", color: "#856404" }}>
      45 {/* Replace with dynamic value */}
    </div>
    <div style={{ fontSize: "14px", color: "#856404", fontWeight: "500", marginTop: "5px" }}>
      STOCK LONG PENDING
    </div>
  </div>
</div>
        {/* Tables */}
        <div style={{ flex: 1, minWidth: "250px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Top 10 */}
          <div style={{ ...cardStyle }}>
            <div style={{ fontWeight: "bold", marginBottom: "10px" }}>Top 10 Customers</div>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={headerStyle}>
                  <tr>
                    <th style={thTdStyle}>#</th>
                    <th style={thTdStyle}>Customer</th>
                    <th style={thTdStyle}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map((c, index) => (
                    <tr key={index}>
                      <td style={thTdStyle}>{index + 1}</td>
                      <td style={thTdStyle}>{c.name}</td>
                      <td style={thTdStyle}>{c.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Low 10 */}
          <div style={{ ...cardStyle }}>
            <div style={{ fontWeight: "bold", marginBottom: "10px" }}>Low 10 Customers</div>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={headerStyle}>
                  <tr>
                    <th style={thTdStyle}>#</th>
                    <th style={thTdStyle}>Customer</th>
                    <th style={thTdStyle}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {lowCustomers.map((c, index) => (
                    <tr key={index}>
                      <td style={thTdStyle}>{index + 1}</td>
                      <td style={thTdStyle}>{c.name}</td>
                      <td style={thTdStyle}>{c.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Sales */}
      {/* <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <div style={{ ...cardStyle, flex: 2, minWidth: "500px" }}>
          <div style={{ fontWeight: "bold", marginBottom: "10px" }}>Department wise monthly sales report</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <div>
              <strong>${monthlySalesData.reduce((sum, d) => sum + d.sales, 0).toLocaleString()}</strong>
              <br />Total Sales
            </div>
            <div>
              <strong>${(monthlySalesData.reduce((sum, d) => sum + d.avg, 0) / monthlySalesData.length).toFixed(2)}</strong>
              <br />Average
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlySalesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#8884d8" />
              <Line type="monotone" dataKey="avg" stroke="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div> */}
    </div>
  );
}
