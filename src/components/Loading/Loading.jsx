import React from "react";

/**
 * Common Loading Component
 * Usage: <Loading message="Loading data..." />
 */
const Loading = ({ 
  message = "Loading...", 
  size = "md",
  variant = "primary",
  fullScreen = false,
  inline = false 
}) => {
  const sizeClasses = {
    sm: { spinner: "spinner-border-sm", text: "small" },
    md: { spinner: "", text: "" },
    lg: { spinner: "spinner-border-lg", text: "h5" }
  };

  const spinnerClass = `spinner-border text-${variant} ${sizeClasses[size].spinner}`;
  const textClass = sizeClasses[size].text;

  if (fullScreen) {
    return (
      <div
        style={{
          height: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
          color: "#555",
        }}
      >
        <div className={spinnerClass} role="status" style={{ marginBottom: "10px" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className={textClass}>{message}</div>
      </div>
    );
  }

  if (inline) {
    return (
      <div className="d-inline-flex align-items-center gap-2">
        <div className={spinnerClass} role="status" style={{ width: "1rem", height: "1rem" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className={textClass}>{message}</span>
      </div>
    );
  }

  // Default: centered in container
  return (
    <div className="text-center py-3">
      <div className={spinnerClass} role="status" style={{ marginBottom: "8px" }}>
        <span className="visually-hidden">Loading...</span>
      </div>
      <div className={textClass}>{message}</div>
    </div>
  );
};

export default Loading;

