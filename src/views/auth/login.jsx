import React, { useState } from "react";
import { Card, Row, Col, Button, Form, InputGroup } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Login({ setIsLoggedIn }) {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // ✅ Basic validation
    if (!mobile || !password) {
      toast.warning("Please enter both mobile and password");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "https://115.124.111.111/FLS/public/api/auth/login",
        { mobile, password },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Login API Response:", response.data);
      const result = response.data;

      // ✅ Handle different API response structures
      const token =
        result?.token ||
        result?.access_token ||
        result?.data?.token ||
        result?.data?.access_token;
      const user = result?.user || result?.data?.user;

      if (token && user) {
        // Save session info
        sessionStorage.setItem("authToken", token);
        sessionStorage.setItem("Name", user?.name || "");
        const encodedRoleId = btoa(user?.role_id ?? "");
        sessionStorage.setItem("RoleId", encodedRoleId);

        // Update app state and redirect
        setIsLoggedIn(true);
        toast.success("Login successful!");
        
        // Use replace instead of push to avoid navigation stack issues
        navigate("/dashboard", { replace: true });
      } else {
        toast.error("Invalid login credentials");
        console.warn("Login failed: No token or user in response", result);
      }
    } catch (err) {
      console.error("Login Error:", err.response || err.message);
      toast.error(
        err.response?.data?.message || "Network error or server not reachable"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-wrapper d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh", background: "#f7f9fc", padding: "10px" }}
    >
      <Card
        className="borderless shadow-sm p-4"
        style={{
          maxWidth: "400px",
          width: "100%",
          fontSize: "13px",
          borderRadius: "12px",
        }}
      >
        <Row className="align-items-center text-center">
          <Col>
            <Card.Body className="p-0">
              <h4 className="mb-3 fw-bold text-primary">Login</h4>

              <Form onSubmit={handleSubmit}>
                {/* Mobile */}
                <InputGroup className="mb-3" style={{ borderRadius: "10px", overflow: "hidden" }}>
                  <InputGroup.Text
                    style={{
                      padding: "0 10px",
                      height: "36px",
                      background: "#e9ecef",
                      border: "none",
                      borderRadius: "0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FeatherIcon icon="smartphone" size={16} className="text-secondary" />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    style={{
                      height: "36px",
                      fontSize: "13px",
                      borderRadius: "0 10px 10px 0",
                      border: "1px solid #ced4da",
                      outline: "none",
                      boxShadow: "none",
                    }}
                  />
                </InputGroup>

                {/* Password */}
                <InputGroup className="mb-3" style={{ borderRadius: "10px", overflow: "hidden" }}>
                  <InputGroup.Text
                    style={{
                      padding: "0 10px",
                      height: "36px",
                      background: "#e9ecef",
                      border: "none",
                      borderRadius: "0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FeatherIcon icon="lock" size={16} className="text-secondary" />
                  </InputGroup.Text>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      height: "36px",
                      fontSize: "13px",
                      borderRadius: "0 10px 10px 0",
                      border: "1px solid #ced4da",
                      outline: "none",
                      boxShadow: "none",
                    }}
                  />
                </InputGroup>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="btn-block mb-3"
                  style={{
                    fontSize: "14px",
                    height: "38px",
                    borderRadius: "10px",
                    backgroundColor: "#0d6efd",
                    borderColor: "#0d6efd",
                  }}
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </Form>
            </Card.Body>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
