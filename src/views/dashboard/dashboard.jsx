import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear stored token
    navigate('/login'); // Redirect back to login
  };

  return (
    <div
      className="dashboard-wrapper d-flex justify-content-center align-items-center"
      style={{ minHeight: '100vh', background: '#f1f3f6', padding: '20px' }}
    >
      <Card
        className="shadow-sm p-4"
        style={{ maxWidth: '800px', width: '100%', borderRadius: '12px' }}
      >
        <h3 className="mb-4 text-primary">Welcome to Dashboard</h3>

        <Row>
          <Col md={6} className="mb-3">
            <Card className="p-3 text-center">
              <h5>Total Users</h5>
              <p>150</p>
            </Card>
          </Col>
          <Col md={6} className="mb-3">
            <Card className="p-3 text-center">
              <h5>Total Sales</h5>
              <p>$12,000</p>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={12} className="text-center mt-4">
            <Button
              variant="danger"
              onClick={handleLogout}
              style={{ borderRadius: '8px', width: '150px' }}
            >
              Logout
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
