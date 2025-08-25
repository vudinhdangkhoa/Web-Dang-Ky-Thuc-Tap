import React, { useState, useEffect, use } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
  Badge,
  Navbar,
  Nav,
  Dropdown,
  Modal,
  Alert,
  Spinner,
  Pagination,
  Image
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Enum from '../../dungchung/enum'
import axiosInstance from '../../dungchung/axiosConfig';
import SignalR_Service from '../../dungchung/SignalR_Service';
const apiRoute = new Enum();

function StudentHome() {
  const [user, setUser] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [InfoStudent, setInfoStudent] = useState(null);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);
  const [isLoadingInfoStudent, setIsLoadingInfoStudent] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [alert, setAlert] = useState(null);
  const [alertGetStudent, setAlertGetStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [companiesPerPage] = useState(6);
  const [noCompaniesMessage, setNoCompaniesMessage] = useState('');

  const [provinces, setProvinces] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);

  const [loadingIndustries, setLoadingIndustries] = useState(false);
  const [industries, setIndustries] = useState([]);

  const [loadingGetCV, setLoadingGetCV] = useState(false);
  const [GetCV, setGetCV] = useState([]);
  const [selectedCV, setSelectedCV] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();

  

  // Mock data cho companies (thay bằng API call thực tế)


  useEffect(() => {
    // Kiểm tra token trong localStorage
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token || userRole !== Enum.student) {
      navigate('/dang-nhap');
      return;
    }

    // Giải mã token để lấy thông tin user
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({
        id: payload.UserId,
        role: payload.Role
      });
      
    } catch (error) {
      console.error('Invalid token:', error);
      navigate('/dang-nhap');
      return () => {
        SignalR_Service.stopConnection();
      };
    }

    // Load companies data
    loadCompanies();
    // Load provinces data
    loadProvinces();
    // Load positions data
    GetAllViTriTT();

  }, []);

  useEffect(() => {

    if (InfoStudent && InfoStudent.id) {
      initializeSignalR(user.id);
    }

  }, [InfoStudent]);



  const initializeSignalR = async (InfoStudentid) => {
    try {
      await SignalR_Service.startConnection(InfoStudentid);

      // ✅ Đăng ký listener cho thông báo
      SignalR_Service.onReceiveMessage((message) => {
        console.log('📢 Received notification:', message);

        // Hiển thị thông báo success
        setAlert({
          type: 'success',
          message: message
        });

        // Thêm vào danh sách notifications
        const newNotification = {
          id: Date.now(),
          message: message,
          timestamp: new Date(),
          isRead: false
        };

        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // ✅ Phát âm thanh thông báo (optional)
        //playNotificationSound();
      });

    } catch (error) {
      console.error('❌ Failed to initialize SignalR:', error);
      setAlert({
        type: 'warning',
        message: 'Không thể kết nối thông báo real-time. Vui lòng refresh trang.'
      });
    }
  };

  // Phát âm thanh thông báo
    // const playNotificationSound = () => {
    //     try {
    //         const audio = new Audio('/notification-sound.mp3'); // Thêm file âm thanh vào public folder
    //         audio.play().catch(e => console.log('Cannot play sound:', e));
    //     } catch (error) {
    //         console.log('Notification sound not available');
    //     }
    // };

  // Đánh dấu đã đọc thông báo
  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, isRead: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const loadCompanies = async () => {
    setIsLoadingCompany(true);
    setNoCompaniesMessage(''); // Reset message
    try {
      const response = await axiosInstance.get(apiRoute.getUrl('api/ChucNangStudent/GetAllThongTinTuyenDung'));

      if (response.status == 200) {
        console.log('API Response:', response.data);

        if (response.data.length === 0) {
          // Không có dữ liệu từ API
          setCompanies([]);
          setFilteredCompanies([]);
          setNoCompaniesMessage('Chưa có đơn tuyển dụng nào');
        } else {
          // Có dữ liệu từ API
          setCompanies(response.data);
          setFilteredCompanies(response.data);
          setNoCompaniesMessage('');
        }
      }

    } catch (error) {
      console.error('Error loading companies:', error);
      // Khi có lỗi API, fallback về mock data
      setCompanies([]);
      setFilteredCompanies([]);
      setNoCompaniesMessage('');
      setAlert({
        type: 'warning',
        message: 'Không thể kết nối server. Hiển thị dữ liệu mẫu.'
      });
    } finally {
      setIsLoadingCompany(false);
    }
  };

  useEffect(() => {
    if (user && user.id) {
      getStudentByID();
      GetAllCV();
      
    }
  }, [user]);

  const getStudentByID = async () => {
    try {
      setIsLoadingInfoStudent(true);
      const response = await axiosInstance.get(apiRoute.getUrl(`api/AccountStudent/GetStudentById/${user.id}`));
      console.log(response.status);
      if (response.status === 200) {
        console.log(response.data);
        setInfoStudent(response.data);
        setIsLoadingInfoStudent(false);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      setIsLoadingInfoStudent(false);
      setAlertGetStudent({
        type: 'danger',
        message: 'Không thể tải thông tin sinh viên. Vui lòng thử lại.'
      });
    }
    return null;
  }

  //lấy danh sách các tỉnh 
  const loadProvinces = async () => {
    setLoadingProvinces(true);
    try {
      const response = await axios.get('https://provinces.open-api.vn/api/p/');
      setProvinces(response.data);
    } catch (error) {
      console.error('Error loading provinces:', error);
      setAlert({
        type: 'warning',
        message: 'Không thể tải danh sách tỉnh thành. Vui lòng nhập thủ công.'
      });
    } finally {
      setLoadingProvinces(false);
    }
  };


  const GetAllViTriTT = async () => {

    try {
      setLoadingIndustries(true);
      const respone = await axiosInstance.get(apiRoute.getUrl('api/ChucNangStudent/GetAllViTriTT'));

      if (respone.status === 200) {
        const positions = respone.data;
        console.log('Positions:', positions);
        if (positions.length > 0) {
          // Giả sử positions là mảng các vị trí
          setLoadingIndustries(false);
          setIndustries(positions);

        } else {
          setAlert({
            type: 'info',
            message: 'Không có vị trí thực tập nào được tìm thấy.'
          });
          setLoadingIndustries(false);
        }
      }



    } catch (error) {
      console.error('Error fetching positions:', error);
      setAlert({
        type: 'warning',
        message: 'Không thể tải danh sách vị trí thực tập. Vui lòng thử lại.'
      });
    }
  }




  const GetAllCV = async () => {

    try {
      setLoadingGetCV(true);
      console.log('student id:', user.id);
      const respone = await axiosInstance.get(apiRoute.getUrl(`api/ChucNangStudent/GetAllCVById/${user.id}`));
      console.log('Response CV:', respone.status);
      if (respone.status === 200) {

        console.log('CVs:', respone.data);
        if (respone.data.length > 0) {
          setGetCV(respone.data);

        } else {

          setGetCV([]);


        }
        setLoadingGetCV(false);

      }



    } catch (error) {
      console.log('Error fetching CVs:', error);
      setAlert({
        type: 'warning',
        message: 'Không thể tải danh sách CV. Vui lòng thử lại.'
      });
    }


  }


  // Filter companies
  useEffect(() => {
    let filtered = companies;

    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.positions.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedIndustry) {
      filtered = filtered.filter(company => company.positions === selectedIndustry);
    }

    if (selectedLocation) {
      filtered = filtered.filter(company => company.location === selectedLocation);
    }

    setFilteredCompanies(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedIndustry, selectedLocation, companies]);

  // Pagination
  const safeFilteredCompanies = Array.isArray(filteredCompanies) ? filteredCompanies : [];
  const indexOfLastCompany = currentPage * companiesPerPage;
  const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;
  const currentCompanies = safeFilteredCompanies.slice(indexOfFirstCompany, indexOfLastCompany);
  const totalPages = Math.ceil(safeFilteredCompanies.length / companiesPerPage);

  const handleLogout = async () => {
    try {

      // dùng SignalR_Service
      await SignalR_Service.stopConnection();

      const token = localStorage.getItem('token');

      await axiosInstance.post(
        apiRoute.getUrl('api/DangNhap/Logout'),
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('role');

      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);

    }
  };

  const handleApplyInternship = async (company) => {
    try {
      const UngTuyen = {
        idCV: selectedCV,
        idTuyenDung: company.id
      }

      const response = await axiosInstance.post(
        apiRoute.getUrl(`api/ChucNangStudent/UngTuyen/${InfoStudent.id}`),
        UngTuyen
      );

      console.log('Apply Response:', response.status);


      if (response.status === 200) {
        setAlert({
          type: 'success',
          message: `Đã gửi đơn đăng ký thực tập tại ${company.name} thành công!`
        });
      }
      setSelectedCV(null);
      setShowModal(false);

    } catch (error) {
      console.log('Error details:', error);


      if (error.response) {
        const statusCode = error.response.status;

        switch (statusCode) {
          case 409:
            setAlert({
              type: 'warning',
              message: `Bạn đã gửi đơn đăng ký thực tập tại ${company.name} trước đó!`
            });
            break;

          case 404:
            setAlert({
              type: 'danger',
              message: 'Không tìm thấy thông tin sinh viên. Vui lòng đăng nhập lại.'
            });
            break;

          case 400:
            setAlert({
              type: 'danger',
              message: 'Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra lại.'
            });
            break;

          default:
            setAlert({
              type: 'danger',
              message: 'Có lỗi xảy ra khi gửi đơn đăng ký. Vui lòng thử lại.'
            });
        }
      } else {

        setAlert({
          type: 'danger',
          message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'
        });
      }

      setSelectedCV(null);
      setShowModal(false);
    }
  };

  const openModal = (company) => {
    setSelectedCompany(company);
    setShowModal(true);
  };

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 2500); // Tự động ẩn sau 2.5 giây

      return () => clearTimeout(timer); // Cleanup timer khi component unmount
    }
  }, [alert]);


  if (isLoadingCompany || isLoadingInfoStudent) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Đang tải...</span>
      </div>
    );
  }

  return (
    <>
      {/* Navigation */}
      <Navbar bg="primary" variant="dark" expand="lg" fixed="top">
        <Container>
          <Navbar.Brand as={Link} to="/student/home">
            <strong>🎓 IT Internship Portal</strong>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/student/home" className="fw-bold">
                Trang chủ
              </Nav.Link>
              <Nav.Link as={Link} to="/student/don-dang-ky">
                Đơn đăng ký
              </Nav.Link>
              <Nav.Link as={Link} to="/student/ho-so">
                Hồ sơ
              </Nav.Link>
            </Nav>
            <Nav>

              {/* ✅ Notification Bell */}
              <Dropdown className="me-3">
                <Dropdown.Toggle variant="outline-light" className="position-relative">
                  🔔
                  {unreadCount > 0 && (
                    <Badge
                      bg="danger"
                      className="position-absolute top-0 start-100 translate-middle rounded-pill"
                      style={{ fontSize: '0.7rem' }}
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </Dropdown.Toggle>
                <Dropdown.Menu style={{ width: '300px', maxHeight: '400px', overflowY: 'auto' }}>
                  <Dropdown.Header>
                    <strong>Thông báo ({notifications.length})</strong>
                  </Dropdown.Header>
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <Dropdown.Item
                        key={notif.id}
                        className={`text-wrap ${!notif.isRead ? 'bg-light' : ''}`}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <div className="d-flex justify-content-between">
                          <small className="text-muted">
                            {notif.timestamp.toLocaleTimeString('vi-VN')}
                          </small>
                          {!notif.isRead && (
                            <Badge bg="primary" className="ms-1">Mới</Badge>
                          )}
                        </div>
                        <div className="mt-1">{notif.message}</div>
                      </Dropdown.Item>
                    ))
                  ) : (
                    <Dropdown.Item disabled>
                      Không có thông báo nào
                    </Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown>

              <Dropdown align="end">
                <Dropdown.Toggle variant="outline-light" id="dropdown-basic">

                  {InfoStudent ? (
                    <>
                      {InfoStudent.avatar ? (
                        <Image
                          src={InfoStudent.avatar}
                          roundedCircle
                          width={30}
                          height={30}
                          className="me-2"
                          onError={(e) => {
                            console.log('❌ Image load failed:', e.target.src);
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="me-2">👤</span>
                      )}
                      {InfoStudent.name}
                    </>
                  ) : (
                    <>
                      <span className="me-2">👤</span>
                      Loading...
                    </>
                  )}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/student/thong-tin-ca-nhan">
                    Thông tin cá nhân
                  </Dropdown.Item>

                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="text-danger">
                    Đăng xuất
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      <div style={{ marginTop: '76px', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <Container className="py-4">
          {/* Alert */}
          {alert && (
            <Alert
              variant={alert.type}
              onClose={() => setAlert(null)}
              dismissible
              className="mb-4"
            >
              {alert.message}
            </Alert>
          )}

          {/* Header */}
          <Row className="mb-4">
            <Col>
              <h1 className="display-6 fw-bold text-primary">
                🚀 Tìm Cơ Hội Thực Tập
              </h1>
              <p className="lead text-muted">
                Khám phá và đăng ký thực tập tại các công ty công nghệ hàng đầu
              </p>
            </Col>
          </Row>

          {/* Search & Filter */}
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <Row>
                <Col md={4} className="mb-3">
                  <Form.Label className="fw-bold">Tìm kiếm</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>🔍</InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Tên công ty, vị trí..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={4} className="mb-3">
                  <Form.Label className="fw-bold">Ngành nghề</Form.Label>
                  <Form.Select
                    value={selectedIndustry}
                    onChange={(e) => {
                      setSelectedIndustry(e.target.value);
                      console.log('Selected Industry:', e.target.value);
                      console.log('company ', companies[0].positions);
                    }}
                  >
                    <option value="">Tất cả ngành nghề</option>
                    {industries.map(industry => (
                      <option key={industry.id} value={industry.tenVitri}>{industry.tenVitri}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={4} className="mb-3">
                  <Form.Label className="fw-bold">Địa điểm</Form.Label>
                  <Form.Select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    <option value="">Tất cả địa điểm</option>
                    {provinces.map(location => (
                      <option key={location.code} value={location.name}>{location.name}</option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Results Stats */}
          <div className="mb-3">
            <span className="text-muted">
              Tìm thấy <strong>{Array.isArray(filteredCompanies) ? filteredCompanies.length : 0}</strong> cơ hội thực tập
            </span>
          </div>

          {/* No Companies Message */}
          {noCompaniesMessage && (
            <div className="text-center py-5">
              <div className="mb-3">
                <span style={{ fontSize: '4rem' }}>📋</span>
              </div>
              <h4 className="text-muted">{noCompaniesMessage}</h4>
              <p className="text-muted">Vui lòng quay lại sau hoặc liên hệ admin để biết thêm thông tin</p>
            </div>
          )}

          {/* Companies Grid */}
          {!noCompaniesMessage && (
            <Row>
              {currentCompanies.map(company => (
                <Col lg={4} md={6} className="mb-4" key={company.id}>
                  <Card className="h-100 shadow-sm border-0 company-card">
                    <Card.Body className="d-flex flex-column">
                      <div className="d-flex align-items-center mb-3">
                        <div

                        >
                          <img src={company.logo} alt={company.name} className="bg-primary text-white rounded-circle me-3 d-flex align-items-center justify-content-center"
                            style={{ width: '50px', height: '50px', fontSize: '1.5rem' }} />
                        </div>
                        <div>
                          <h5 className="mb-1 fw-bold">{company.name}</h5>
                          <small className="text-muted">{company.location}</small>
                        </div>
                      </div>

                      <div className="mb-3 ">
                        <strong className="small">Vị trí:</strong>
                        <div className="mt-1">
                          <Badge key={company.position} bg="outline-primary" className="me-1 mb-1 text-primary ">
                            {company.positions}
                          </Badge>


                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="d-flex justify-content-between small text-muted">
                          <span>⏱️ {company.duration}</span>
                          <span>👥 {company.slots} slots</span>
                        </div>
                      </div>

                      <Button
                        variant="primary"
                        className="w-100"
                        onClick={() => openModal(company)}
                      >
                        Xem chi tiết & Đăng ký
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {/* No Results for Search/Filter */}
          {!noCompaniesMessage && Array.isArray(filteredCompanies) && filteredCompanies.length === 0 && (
            <div className="text-center py-5">
              <h4 className="text-muted">Không tìm thấy công ty nào</h4>
              <p className="text-muted">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}

          {/* Pagination */}
          {!noCompaniesMessage && totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                />
                {[...Array(totalPages)].map((_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === currentPage}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                />
              </Pagination>
            </div>
          )}
        </Container>
      </div>

      {/* Company Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        {selectedCompany && (
          <>
            <Modal.Header closeButton>
              <Modal.Title className="d-flex align-items-center">
                <span className="me-3" style={{ fontSize: '2rem' }}>
                  <img src={selectedCompany.logo} className="bg-primary text-white rounded-circle me-3 d-flex align-items-center justify-content-center"
                    style={{ width: '50px', height: '50px', fontSize: '1.5rem' }} />
                </span>
                {selectedCompany.name}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                <Col md={8}>
                  <h5>Mô tả công ty</h5>
                  <p className="text-muted">{selectedCompany.description}</p>

                  <h5>Vị trí thực tập</h5>
                  <div className="mb-3">

                    <Badge key={selectedCompany.positions} bg="primary" className="me-2 mb-2">
                      {selectedCompany.positions}
                    </Badge>

                  </div>

                  <h5>Yêu cầu</h5>
                  <ul>

                    <li >{selectedCompany.requirements}</li>

                  </ul>



                  <h5>Quyền lợi</h5>
                  <ul>
                    <li >{selectedCompany.benefits}</li>
                  </ul>
                </Col>
                <Col md={4}>
                  <Card className="bg-light">
                    <Card.Body>
                      <h6>Thông tin chi tiết</h6>

                      <div className="mb-2">
                        <strong>Địa điểm:</strong><br />
                        📍 {selectedCompany.location}
                      </div>
                      <div className="mb-2">
                        <strong>Thời gian:</strong><br />
                        ⏱️ {selectedCompany.duration}
                      </div>
                      <div className="mb-2">
                        <strong>Số lượng:</strong><br />
                        👥 {selectedCompany.slots} slots
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer className="flex-column">
              {/* ✅ Phần chọn CV */}
              <div className="w-100 mb-3">
                {(GetCV.length === 0 || GetCV === null) ? (
                  <Alert variant="info" className="mb-0">
                    <div className="text-center">
                      <h6 className="mb-2">📝 Chưa có CV nào</h6>
                      <p className="mb-3">Bạn cần có CV để đăng ký thực tập</p>
                      <Link to="/student/ho-so" className="btn btn-primary btn-sm">
                        ➕ Tạo CV ngay
                      </Link>
                    </div>
                  </Alert>
                ) : (
                  <Card className="border-primary">
                    <Card.Body className="py-3">
                      <Form.Label className="fw-bold text-primary mb-2">
                        📄 Chọn CV để nộp đơn
                      </Form.Label>
                      <Form.Select size="lg" value={selectedCV} onChange={(e) => setSelectedCV(e.target.value)}>
                        <option value="">-- Chọn CV để ứng tuyển --</option>
                        {GetCV.map((cv) => (
                          <option key={cv.idCv || cv.id} value={cv.idCv}>
                            📄 {cv.tenCv}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Text className="text-muted">
                        Chọn CV phù hợp nhất với vị trí này
                      </Form.Text>
                    </Card.Body>
                  </Card>
                )}
              </div>

              {/* ✅ Action Buttons */}
              <div className="d-flex gap-2 w-100">
                <Button
                  variant="outline-secondary"
                  className="flex-fill"
                  onClick={() => { setShowModal(false); setSelectedCV(null); }}
                >
                  ❌ Đóng
                </Button>

                <Button
                  variant="primary"
                  className="flex-fill"
                  onClick={() => handleApplyInternship(selectedCompany)}
                  disabled={!GetCV || GetCV.length === 0 || !selectedCV}
                >
                  🚀 Đăng ký thực tập
                </Button>
              </div>
            </Modal.Footer>
          </>
        )}
      </Modal>

      {/* Custom Styles */}
      <style jsx>{`
        .company-card {
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .company-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
        }

      `}</style>
    </>
  );
}

export default StudentHome;
