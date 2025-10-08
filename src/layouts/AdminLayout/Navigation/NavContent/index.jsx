import PropTypes from 'prop-types';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import strom from "assets/images/strom.svg";
// react-bootstrap
import { Card, ListGroup } from 'react-bootstrap';

// project imports
import NavGroup from './NavGroup';
import { ConfigContext } from 'contexts/ConfigContext';

// third party
import SimpleBar from 'simplebar-react';

// -----------------------|| NAV CONTENT ||-----------------------//

export default function NavContent({ navigation, activeNav, setIsLoggedIn }) {
  const configContext = useContext(ConfigContext);
  const { collapseLayout } = configContext.state;
  const navigate = useNavigate();

  // Handle logout
const handleLogout = () => {
  console.log("Logging out..."); // debug
  sessionStorage.clear();
  if (setIsLoggedIn) setIsLoggedIn(false);
  navigate('/login', { replace: true });
};


  const navItems = navigation.map((item) => {
    let navItem = <></>;
    switch (item.type) {
      case 'group':
        if (activeNav) {
          navItem = (
            <div key={`nav-group-${item.id}`}>
              <NavGroup group={item} />
            </div>
          );
        } else {
          navItem = <NavGroup group={item} key={`nav-group-${item.id}`} />;
        }
        return navItem;
      default:
        return false;
    }
  });

  let navContentNode = (
    <SimpleBar style={{ height: 'calc(100vh - 70px)' }}>
      <ListGroup variant="flush" as="ul" bsPrefix=" " className="pc-navbar">
        {navItems}
      </ListGroup>

    {/* Logout Card */}
<Card
  className="nav-logout-card m-3"
  style={{ background: "transparent", border: "none", boxShadow: "none" }}
>
  <Card.Body style={{ display: "flex", justifyContent: "center" }}>
    <button
      onClick={handleLogout}
      style={{
        background: "#ff4d4f",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        padding: "6px 12px",
        cursor: "pointer",
        fontWeight: "600",
        transition: "0.3s",
      }}
      onMouseEnter={(e) => (e.target.style.background = "#e04345")}
      onMouseLeave={(e) => (e.target.style.background = "#ff4d4f")}
    >
      Logout
    </button>
  </Card.Body>
</Card>

{/* Branding Card */}
<Card
  className="nav-brand-card m-3"
  style={{ background: "transparent", border: "none", boxShadow: "none" }}
>
  <Card.Body style={{ display: "flex", justifyContent: "center" }}>
    <h6
      className="m-0 text-center"
      style={{
        color: "#0d6efd",
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: "3px",
      }}
    >
      Acetech
    </h6>
  </Card.Body>
</Card>
    </SimpleBar>
  );

  if (collapseLayout) {
    navContentNode = (
      <ListGroup variant="flush" as="ul" bsPrefix=" " className="pc-navbar">
        {navItems}
      </ListGroup>
    );
  }

  const mHeader = (
    <div className="m-header">
      {/* Logo */}
      <h1 style={{ margin: 0, padding: "10px" }}>
        <img
          src={strom}
          alt="Logo"
          style={{ height: "30px", width: "auto" }}
        />
      </h1>
    </div>
  );

  const mainContent = (
    <>
      {mHeader}
      <div className="navbar-content next-scroll">{navContentNode}</div>
    </>
  );

  return <>{mainContent}</>;
}

NavContent.propTypes = {
  navigation: PropTypes.any,
  activeNav: PropTypes.any,
  setIsLoggedIn: PropTypes.func,
};