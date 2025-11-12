import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button, Form, InputGroup } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { login } from "../../store/slices/authSlice";
import logo from "assets/images/strom.svg";

export default function Login() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useAppDispatch();
  const { loading, isAuthenticated } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Basic validation
    if (!mobile || !password) {
      toast.warning("Please enter both mobile and password");
      return;
    }

    await dispatch(login({ mobile, password }));
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
       <div className="text-center mb-3">
  <img src={logo} alt="Logo" style={{ maxWidth: "150px" }} />
</div>
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
