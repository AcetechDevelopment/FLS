import PropTypes from 'prop-types';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import strom from "assets/images/strom.svg";
// react-bootstrap
import { Card, ListGroup } from 'react-bootstrap';

// project imports
import NavGroup from './NavGroup';
import { ConfigContext } from 'contexts/ConfigContext';

// third party
import SimpleBar from 'simplebar-react';


// -----------------------|| NAV CONTENT ||-----------------------//

export default function NavContent({ navigation, activeNav }) {
  const configContext = useContext(ConfigContext);
  const { collapseLayout } = configContext.state;

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

      <Card
        className="nav-action-card m-3"
        style={{ background: "transparent", border: "none", boxShadow: "none" }}
      >
        <Card.Body>
          <h6
            className="m-0 text-center"
            style={{
              color: "#0d6efd",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "3px"
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
  activeNav: PropTypes.any
};
