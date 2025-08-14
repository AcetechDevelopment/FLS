import React from "react";

export default function TransitionPage() {
  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      { label: "Customer Satisfaction", data: [85, 90, 78, 88, 200] }
    ]
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Transition Dashboard (Test)</h2>

      <div style={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "10px",
        marginTop: "20px",
        backgroundColor: "#fafafa"
      }}>
        <h3>Customer Satisfaction</h3>
        <pre>{JSON.stringify(chartData, null, 2)}</pre>
      </div>
    </div>
  );
}
