// react-bootstrap
import { Row, Col, Card } from 'react-bootstrap';

// third party
import Chart from 'react-apexcharts';

// project imports
import FlatCard from 'components/Widgets/Statistic/FlatCard';
import ProductCard from 'components/Widgets/Statistic/ProductCard';
import FeedTable from 'components/Widgets/FeedTable';
import ProductTable from 'components/Widgets/ProductTable';
import { SalesCustomerSatisfactionChartData } from './chart/sales-customer-satisfication-chart';
import { SalesAccountChartData } from './chart/sales-account-chart';
import { SalesSupportChartData } from './chart/sales-support-chart';
import { SalesSupportChartData1 } from './chart/sales-support-chart1';
import feedData from 'data/feedData';
import productData from 'data/productTableData';

// -----------------------|| DASHBOARD SALES ||-----------------------//
export default function DashSales() {
  return (
    <Row>
      <Col md={12} xl={6}>
     <Card
  className="flat-card"
  style={{
    background: "#ffffff",
    border: "none",
    borderRadius: "16px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    padding: "16px",
    marginBottom: "20px",
    transition: "all 0.3s ease-in-out",
  }}
>
  <div
    className="row-table"
    style={{
      display: "flex",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "12px",
    }}
  >
    {/* Customer Count */}
    <Card.Body
      className="col-sm-4"
      style={{
        background: "linear-gradient(135deg, #f9f9f9 0%, #fdfdfd 100%)",
        borderRadius: "12px",
        padding: "20px",
        textAlign: "center",
        flex: 1,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.05)";
      }}
    >
      <FlatCard
        params={{
          title: "Customer Count",
          iconClass: "text-primary mb-1",
          icon: "group",
          value: "120", // Replace with dynamic value
        }}
      />
    </Card.Body>

    {/* Material Count - Split into Fresh and Soil */}
    <Card.Body
      className="col-sm-4"
      style={{
        background: "linear-gradient(135deg, #f9f9f9 0%, #fdfdfd 100%)",
        borderRadius: "12px",
        padding: "20px",
        textAlign: "center",
        flex: 1,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.05)";
      }}
    >
      <div style={{ marginBottom: "8px", fontWeight: "500", fontSize: "14px" }}>Material Count</div>
      <div style={{ display: "flex", justifyContent: "space-around", gap: "10px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "12px", color: "#6c757d" }}>Fresh</div>
          <div style={{ fontSize: "16px", fontWeight: "600", color: "#0d6efd" }}>30</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "12px", color: "#6c757d" }}>Soil</div>
          <div style={{ fontSize: "16px", fontWeight: "600", color: "#dc3545" }}>15</div>
        </div>
      </div>
    </Card.Body>

    {/* Average Price */}
    <Card.Body
      className="col-sm-4"
      style={{
        background: "linear-gradient(135deg, #f9f9f9 0%, #fdfdfd 100%)",
        borderRadius: "12px",
        padding: "20px",
        textAlign: "center",
        flex: 1,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.05)";
      }}
    >
      <FlatCard
        params={{
          title: "Average Price",
          iconClass: "text-primary mb-1",
          icon: "attach_money",
          value: "₹750", // Replace with dynamic average
        }}
      />
    </Card.Body>
  </div>
</Card>
        
        <Row>
          <Col md={6}>
            <Card className="support-bar overflow-hidden">
              <Card.Body className="pb-0">
                <h2 className="m-0">53.94%</h2>
                <span className="text-primary">Conversion Rate</span>
                <p className="mb-3 mt-3">Number of conversions divided by the total visitors. </p>
              </Card.Body>
              <Chart {...SalesSupportChartData()} />
              <Card.Footer className="border-0 bg-primary text-white background-pattern-white">
                <Row className="text-center">
                  <Col>
                    <h4 className="m-0 text-white">10</h4>
                    <span>2018</span>
                  </Col>
                  <Col>
                    <h4 className="m-0 text-white">15</h4>
                    <span>2017</span>
                  </Col>
                  <Col>
                    <h4 className="m-0 text-white">13</h4>
                    <span>2016</span>
                  </Col>
                </Row>
              </Card.Footer>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="support-bar overflow-hidden">
              <Card.Body className="pb-0">
                <h2 className="m-0">1432</h2>
                <span className="text-primary">Order Delivered</span>
                <p className="mb-3 mt-3">Number of conversions divided by the total visitors. </p>
              </Card.Body>
              <Card.Footer className="border-0">
                <Row className="text-center">
                  <Col>
                    <h4 className="m-0">130</h4>
                    <span>May</span>
                  </Col>
                  <Col>
                    <h4 className="m-0">251</h4>
                    <span>June</span>
                  </Col>
                  <Col>
                    <h4 className="m-0 ">235</h4>
                    <span>July</span>
                  </Col>
                </Row>
              </Card.Footer>
              <Chart type="bar" {...SalesSupportChartData1()} />
            </Card>
          </Col>
        </Row>
      </Col>
      <Col md={12} xl={6}>
        <Card>
          <Card.Header>
            <h5>Department wise monthly sales report</h5>
          </Card.Header>
          <Card.Body>
            <Row className="pb-2">
              <div className="col-auto m-b-10">
                <h3 className="mb-1">$21,356.46</h3>
                <span>Total Sales</span>
              </div>
              <div className="col-auto m-b-10">
                <h3 className="mb-1">$1935.6</h3>
                <span>Average</span>
              </div>
            </Row>
            <Chart {...SalesAccountChartData()} />
          </Card.Body>
        </Card>
      </Col>
      <Col md={12} xl={6}>
        <Card>
          <Card.Body>
            <h6>Customer Satisfaction</h6>
            <span>It takes continuous effort to maintain high customer satisfaction levels Internal and external.</span>
            <Row className="d-flex justify-content-center align-items-center">
              <Col>
                <Chart type="pie" {...SalesCustomerSatisfactionChartData()} />
              </Col>
            </Row>
          </Card.Body>
        </Card>
        {/* Product Table */}
        <ProductTable {...productData} />
      </Col>
      <Col md={12} xl={6}>
        <Row>
          <Col sm={6}>
            <ProductCard params={{ title: 'Total Profit', primaryText: '$1,783', icon: 'card_giftcard' }} />
          </Col>
          <Col sm={6}>
            <ProductCard params={{ variant: 'primary', title: 'Total Orders', primaryText: '15,830', icon: 'local_mall' }} />
          </Col>
          <Col sm={6}>
            <ProductCard params={{ variant: 'primary', title: 'Average Price', primaryText: '$6,780', icon: 'monetization_on' }} />
          </Col>
          <Col sm={6}>
            <ProductCard params={{ title: 'Product Sold', primaryText: '6,784', icon: 'local_offer' }} />
          </Col>
        </Row>
        {/* Feed Table */}
        <FeedTable {...feedData} />
      </Col>
    </Row>
  );
}
