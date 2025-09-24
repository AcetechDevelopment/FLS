import { NavLink } from 'react-router-dom';
import { Card, Row, Col, Button, InputGroup, Form } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';

export default function Register() {
  return (
    <div
      className="auth-wrapper d-flex justify-content-center align-items-center"
      style={{
        minHeight: '100vh',
        background: '#f7f9fc',  // subtle light background
        padding: '10px',
      }}
    >
      <Card
        className="borderless shadow-sm p-4"
        style={{
          maxWidth: '400px',
          width: '100%',
          fontSize: '13px',
          borderRadius: '12px',
        }}
      >
        <Row className="align-items-center text-center">
          <Col>
            <Card.Body className="p-0">
              <h4 className="mb-3 fw-bold text-primary">Register</h4>

              {/* Input Group Styles */}
              {['Name', 'Email address', 'Mobile', 'Password', 'Confirm Password'].map(
                (label, idx) => (
                  <InputGroup className="mb-3" key={idx} style={{ borderRadius: '10px', overflow: 'hidden' }}>
                    <InputGroup.Text
                      style={{
                        padding: '0 10px',
                        height: '36px',
                        background: '#e9ecef',
                        border: 'none',
                        borderRadius: '0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FeatherIcon
                        icon={
                          label.includes('Name')
                            ? 'user'
                            : label.includes('Email')
                            ? 'mail'
                            : label.includes('Mobile')
                            ? 'smartphone'
                            : 'lock'
                        }
                        size={16}
                        className="text-secondary"
                      />
                    </InputGroup.Text>
                    <Form.Control
                      type={label.toLowerCase().includes('password') ? 'password' : 'text'}
                      placeholder={label}
                      style={{
                        height: '36px',
                        fontSize: '13px',
                        borderRadius: '0 10px 10px 0',
                        border: '1px solid #ced4da',
                        outline: 'none',
                        boxShadow: 'none',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#0d6efd')}
                      onBlur={(e) => (e.target.style.borderColor = '#ced4da')}
                    />
                  </InputGroup>
                )
              )}

              <Button
                className="btn-block mb-2"
                style={{
                  fontSize: '14px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#0d6efd',
                  borderColor: '#0d6efd',
                }}
              >
                Register
              </Button>

              <p className="mb-0" style={{ fontSize: '12px' }}>
                Already have an account?{' '}
                <NavLink to="/login" className="text-primary fw-bold">
                  Sign in
                </NavLink>
              </p>
            </Card.Body>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
