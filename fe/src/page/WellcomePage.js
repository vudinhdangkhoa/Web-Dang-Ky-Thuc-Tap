import React from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Button, 
  Card, 
  Navbar, 
  Nav,
  Jumbotron,
  Badge
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function WellcomePage() {
  return (
    <>
      {/* Navigation Bar */}
      <Navbar bg="primary" variant="dark" expand="lg" fixed="top">
        <Container>
          <Navbar.Brand as={Link} to="/">
            <strong>IT Internship Portal</strong>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#about">Giới thiệu</Nav.Link>
              <Nav.Link href="#programs">Chương trình</Nav.Link>
              <Nav.Link as={Link} to="/dang-ky">Đăng ký</Nav.Link>
              <Nav.Link as={Link} to="/dang-nhap">Đăng nhập</Nav.Link>
              <Nav.Link href="#contact">Liên hệ</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <div className="bg-light py-5" style={{ marginTop: '76px' }}>
        <Container>
          <Row className="align-items-center min-vh-75">
            <Col lg={6}>
              <h1 className="display-4 fw-bold text-primary mb-4">
                Cơ Hội Thực Tập 
                <br />
                <span className="text-warning">Công Nghệ Thông Tin</span>
              </h1>
              <p className="lead mb-4 text-muted">
                Tham gia chương trình thực tập chuyên nghiệp tại các công ty hàng đầu. 
                Phát triển kỹ năng, tích lũy kinh nghiệm và xây dựng sự nghiệp trong lĩnh vực IT.
              </p>
              <div className="d-grid gap-2 d-md-flex">
                <Button as={Link} to="/dang-ky" variant="primary" size="lg" className="me-md-2">
                  Đăng Ký Ngay
                </Button>
                <Button variant="outline-primary" size="lg">
                  Tìm Hiểu Thêm
                </Button>
              </div>
            </Col>
            <Col lg={6} className="text-center">
              <div className="bg-primary rounded-3 p-5 text-white">
                <h2 className="mb-4">🚀 Khởi Đầu Sự Nghiệp IT</h2>
                <Row>
                  <Col md={6}>
                    <h4 className="text-warning">500+</h4>
                    <p>Sinh viên đã tham gia</p>
                  </Col>
                  <Col md={6}>
                    <h4 className="text-warning">50+</h4>
                    <p>Công ty đối tác</p>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Programs Section */}
      <Container className="py-5" id="programs">
        <Row>
          <Col lg={12} className="text-center mb-5">
            <h2 className="display-5 fw-bold">Chương Trình Thực Tập</h2>
            <p className="lead text-muted">Chọn lĩnh vực phù hợp với năng lực và sở thích của bạn</p>
          </Col>
        </Row>
        <Row>
          <Col md={4} className="mb-4">
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center p-4">
                <div className="bg-primary text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" 
                     style={{width: '80px', height: '80px', fontSize: '2rem'}}>
                  💻
                </div>
                <Card.Title className="h4">Web Development</Card.Title>
                <Card.Text className="text-muted">
                  Học và phát triển website với React, Node.js, PHP, và các công nghệ web hiện đại.
                </Card.Text>
                <Badge bg="primary" className="me-2">React</Badge>
                <Badge bg="primary" className="me-2">Node.js</Badge>
                <Badge bg="primary">PHP</Badge>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center p-4">
                <div className="bg-success text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" 
                     style={{width: '80px', height: '80px', fontSize: '2rem'}}>
                  📱
                </div>
                <Card.Title className="h4">Mobile Development</Card.Title>
                <Card.Text className="text-muted">
                  Phát triển ứng dụng mobile với React Native, Flutter, iOS và Android native.
                </Card.Text>
                <Badge bg="success" className="me-2">React Native</Badge>
                <Badge bg="success" className="me-2">Flutter</Badge>
                <Badge bg="success">Swift</Badge>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center p-4">
                <div className="bg-warning text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" 
                     style={{width: '80px', height: '80px', fontSize: '2rem'}}>
                  🔍
                </div>
                <Card.Title className="h4">Data Science</Card.Title>
                <Card.Text className="text-muted">
                  Khám phá dữ liệu và machine learning với Python, R, TensorFlow và các công cụ AI.
                </Card.Text>
                <Badge bg="warning" className="me-2">Python</Badge>
                <Badge bg="warning" className="me-2">ML</Badge>
                <Badge bg="warning">AI</Badge>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Benefits Section */}
      <div className="bg-light py-5">
        <Container>
          <Row>
            <Col lg={12} className="text-center mb-5">
              <h2 className="display-5 fw-bold">Tại Sao Chọn Chúng Tôi?</h2>
            </Col>
          </Row>
          <Row>
            <Col md={6} lg={3} className="mb-4">
              <div className="text-center">
                <div className="bg-primary text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" 
                     style={{width: '60px', height: '60px'}}>
                  🎯
                </div>
                <h5>Định Hướng Rõ Ràng</h5>
                <p className="text-muted small">Mentor kinh nghiệm hướng dẫn từng bước</p>
              </div>
            </Col>
            <Col md={6} lg={3} className="mb-4">
              <div className="text-center">
                <div className="bg-success text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" 
                     style={{width: '60px', height: '60px'}}>
                  💼
                </div>
                <h5>Dự Án Thực Tế</h5>
                <p className="text-muted small">Làm việc với dự án thực tế của doanh nghiệp</p>
              </div>
            </Col>
            <Col md={6} lg={3} className="mb-4">
              <div className="text-center">
                <div className="bg-warning text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" 
                     style={{width: '60px', height: '60px'}}>
                  📜
                </div>
                <h5>Chứng Chỉ</h5>
                <p className="text-muted small">Nhận chứng chỉ hoàn thành có giá trị</p>
              </div>
            </Col>
            <Col md={6} lg={3} className="mb-4">
              <div className="text-center">
                <div className="bg-info text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" 
                     style={{width: '60px', height: '60px'}}>
                  🚀
                </div>
                <h5>Cơ Hội Việc Làm</h5>
                <p className="text-muted small">Kết nối với nhà tuyển dụng hàng đầu</p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* CTA Section */}
      <Container className="py-5 text-center" id="register">
        <Row>
          <Col lg={8} className="mx-auto">
            <h2 className="display-5 fw-bold mb-4">Sẵn Sàng Bắt Đầu?</h2>
            <p className="lead mb-4 text-muted">
              Đăng ký ngay hôm nay để không bỏ lỡ cơ hội thực tập tại các công ty công nghệ hàng đầu
            </p>
            <Button as={Link} to="/dang-ky" variant="primary" size="lg" className="px-5 py-3">
              Đăng Ký Thực Tập Ngay
            </Button>
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <footer className="bg-dark text-white py-4">
        <Container>
          <Row>
            <Col md={6}>
              <h5>IT Internship Portal</h5>
              <p className="mb-0">Kết nối sinh viên với cơ hội thực tập chất lượng</p>
            </Col>
            <Col md={6} className="text-md-end">
              <p className="mb-0">© 2025 IT Internship Portal. All rights reserved.</p>
            </Col>
          </Row>
        </Container>
      </footer>
    </>
  );
}

export default WellcomePage;
