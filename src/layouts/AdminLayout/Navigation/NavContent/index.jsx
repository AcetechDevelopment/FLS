import PropTypes from 'prop-types';
import { useContext } from 'react';
import { Link } from 'react-router-dom';

// react-bootstrap
import { Card, ListGroup } from 'react-bootstrap';

// project imports
import NavGroup from './NavGroup';
import { ConfigContext } from 'contexts/ConfigContext';

// third party
import SimpleBar from 'simplebar-react';

// assets
import logo from 'assets/images/logo.svg';

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


{/* <div 
  className="sidebar-footer text-center p-2" 
  style={{ 
    position: "absolute", 
    bottom: "10px", 
    width: "100%", 
    textAlign: "center" 
  }}
>
  <h6 className="m-0" style={{ color: "#0d6efd" }}>
    Acetech
  </h6>
</div> */}


<Card 
  className="nav-action-card m-3"
  style={{ background: "transparent", border: "none", boxShadow: "none" }}
>
  <Card.Body>
    {/* <h6 
  className="m-0" 
  style={{ 
    color: "transparent", 
    WebkitTextStroke: "1px #0d6efd", 
    fontWeight: "bold" 
  }}
>
  Acetech
</h6> */}

{/* <h6 
  className="m-0 text-center" 
  style={{ 
    background: "linear-gradient(90deg, #0d6efd, #6610f2)", 
    WebkitBackgroundClip: "text", 
    WebkitTextFillColor: "transparent", 
    fontWeight: "bold", 
    letterSpacing: "1px"
  }}
>
  Acetech
</h6> */}

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
      {/* <Link to="/dashboard/sales" className="b-brand">
        <img src={logo} alt="" className="logo logo-lg" />
      </Link> */}

       <h1 style={{ margin: 0, padding: "10px", fontSize: "20px", color: "#fff" }}>
    FLS
  </h1>
    </div>
  );

  let mainContent;

  mainContent = (
    <>
      {mHeader}

      <div className="navbar-content next-scroll">{navContentNode}</div>
    </>
  );

  return <>{mainContent}</>;
}

NavContent.propTypes = { navigation: PropTypes.any, activeNav: PropTypes.any };
