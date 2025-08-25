
import React, { useState, useEffect } from 'react';
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
    Image,
    Table,
    ProgressBar
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Enum from '../../dungchung/enum'
import axiosInstance from '../../dungchung/axiosConfig';

const apiRout = new Enum();

function AppliedCompany() {
    const [user, setUser] = useState({});
    const [company, setCompany] = useState({});
    const [donUngTuyen, setDonUngTuyen] = useState([]);
    const [lstDonUngTuyenGoc, setLstDonUngTuyenGoc] = useState([]);
    const [status, setStatus] = useState(Enum.choduyet);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingCompany, setIsLoadingCompany] = useState(true);
    const [isLoadingDonUngTuyen, setIsLoadingDonUngTuyen] = useState(true);
    const [message, setMessage] = useState(null);
    const [isLoadingApprove, setIsLoadingApprove] = useState(false);
    const [isLoadingReject, setIsLoadingReject] = useState(false);

    const [selectedApplication, setSelectedApplication] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const navigate = useNavigate();

    // ✅ Auto-hide alert
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage(null);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('role');
        const userId = localStorage.getItem('userId');

        if (!token || userRole !== Enum.company) {
            navigate('/dang-nhap');
            return;
        }

        try {
            setUser({
                id: userId,
                role: userRole
            });
            setIsLoading(false);
        } catch (error) {
            console.error('Invalid token:', error);
            navigate('/dang-nhap');
            return;
        }
    }, [navigate]);

    // ✅ Load company data when user is set
    useEffect(() => {
        if (user && user.id) {
            GetCompanyById();
            GetAllDonUngTuyen();
        }
    }, [user]);

    // ✅ Filter by status
    useEffect(() => {
        if (lstDonUngTuyenGoc.length > 0) {
            let filtered = lstDonUngTuyenGoc.filter(item => item.status === status);
            
            // Search filter
            if (searchTerm) {
                filtered = filtered.filter(item => 
                    (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (item.tieuDe || '').toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
            
            setDonUngTuyen(filtered);
            setCurrentPage(1);
        }
    }, [status, lstDonUngTuyenGoc, searchTerm]);

    const GetCompanyById = async () => {
        try {
            setIsLoadingCompany(true);
            const response = await axiosInstance.get(
                apiRout.getUrl(`api/AccountCompany/getCompanyById/${user.id}`)
            );

            if (response.status === 200) {
                setCompany(response.data);
            }
        } catch (error) {
            console.error('Error fetching company:', error);
            setMessage({
                type: 'danger',
                message: 'Không thể tải thông tin công ty. Vui lòng thử lại.'
            });
        } finally {
            setIsLoadingCompany(false);
        }
    };

    const GetAllDonUngTuyen = async () => {
        try {
            setIsLoadingDonUngTuyen(true);
            const response = await axiosInstance.get(
                apiRout.getUrl(`api/ChucNangApplyCompany/GetAllDonUngTuyen/${user.id}`)
            );

            console.log('Response:', response.data);
            console.log('Response Status:', response.status);

            if (response.status === 200) {
                setLstDonUngTuyenGoc(response.data || []);
                setStatus(Enum.choduyet);
            } else {
                setLstDonUngTuyenGoc([]);
            }
        } catch (error) {
            console.log('Error fetching applications:', error);
            setMessage({
                type: 'danger',
                message: 'Lỗi khi lấy thông tin đơn ứng tuyển'
            });
            setLstDonUngTuyenGoc([]);
        } finally {
            setIsLoadingDonUngTuyen(false);
        }
    };

    const handleApprove = async (applicationId) => {
        try {
            setIsLoadingApprove(true);
            const response = await axiosInstance.put(
                apiRout.getUrl(`api/ChucNangApplyCompany/DuyetDonUngTuyen/${applicationId}`)
            );

            if (response.status === 200) {
                setMessage({
                    type: 'success',
                    message: 'Phê duyệt đơn ứng tuyển thành công!'
                });
                
                // Update state optimistically
                setLstDonUngTuyenGoc(prevState => 
                    prevState.map(item => 
                        item.id === applicationId 
                            ? { ...item, status: Enum.daDuyet }
                            : item
                    )
                );
            }
        } catch (error) {
            console.error('Error approving application:', error);
            setMessage({
                type: 'danger',
                message: 'Lỗi khi phê duyệt đơn ứng tuyển'
            });
        } finally {
            setIsLoadingApprove(false);
        }
    };

    const handleReject = async (applicationId) => {
        try {
            setIsLoadingReject(true);
            const response = await axiosInstance.put(
                apiRout.getUrl(`api/ChucNangApplyCompany/TuChoiDonUngTuyen/${applicationId}`)
            );

            if (response.status === 200) {
                setMessage({
                    type: 'warning',
                    message: 'Đã từ chối đơn ứng tuyển'
                });
                
                // Update state optimistically
                setLstDonUngTuyenGoc(prevState => 
                    prevState.map(item => 
                        item.id === applicationId 
                            ? { ...item, status: Enum.tuChoi }
                            : item
                    )
                );
            }
        } catch (error) {
            console.error('Error rejecting application:', error);
            setMessage({
                type: 'danger',
                message: 'Lỗi khi từ chối đơn ứng tuyển'
            });
        } finally {
            setIsLoadingReject(false);
        }
    };

    const handleFilterByStatus = (newStatus) => {
        setStatus(newStatus);
        setCurrentPage(1);
    };

    const handleViewDetails = (application) => {
        setSelectedApplication(application);
        setShowModal(true);
    };

    const handleLogout = async () => {
        await axiosInstance.post(apiRout.getUrl('api/DangNhap/Logout'));
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        navigate('/dang-nhap');
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = donUngTuyen.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(donUngTuyen.length / itemsPerPage);

    const getStatusStats = () => {
        const pending = lstDonUngTuyenGoc.filter(item => item.status === Enum.choduyet).length;
        const approved = lstDonUngTuyenGoc.filter(item => item.status === Enum.daDuyet).length;
        const rejected = lstDonUngTuyenGoc.filter(item => item.status === Enum.tuChoi).length;
        return { pending, approved, rejected, total: lstDonUngTuyenGoc.length };
    };

    const statusStats = getStatusStats();

    const checkIsLoading = () => {
        return isLoading || isLoadingDonUngTuyen || isLoadingCompany;
    };

    if (checkIsLoading()) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <Spinner animation="border" variant="primary" />
                <span className="ms-2">Đang tải...</span>
            </div>
        );
    }

    return (
        <>
            {/* ✅ Navigation Bar - Same as homeCompany */}
            <Navbar 
                expand="lg" 
                fixed="top" 
                className="shadow-sm"
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}
            >
                <Container>
                    <Navbar.Brand as={Link} to="/company/home" className="d-flex align-items-center">
                        <div className="d-flex align-items-center">
                            {company?.logo ? (
                                <div 
                                    className="rounded-circle bg-white p-1 me-3"
                                    style={{ 
                                        width: '40px', 
                                        height: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <Image
                                        src={company.logo}
                                        roundedCircle
                                        width={28}
                                        height={28}
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                            ) : (
                                <div 
                                    className="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center me-3"
                                    style={{ 
                                        width: '40px', 
                                        height: '40px',
                                        fontSize: '1.2rem',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    🏢
                                </div>
                            )}
                            <div>
                                <div className="text-white fw-bold" style={{ fontSize: '1.1rem' }}>
                                    Recruitment Portal
                                </div>
                                <small className="text-light opacity-75">
                                    Nhà tuyển dụng
                                </small>
                            </div>
                        </div>
                    </Navbar.Brand>
                    
                    <Navbar.Toggle 
                        aria-controls="basic-navbar-nav"
                        style={{ 
                            borderColor: 'rgba(255,255,255,0.3)',
                            color: 'white'
                        }}
                    />
                    
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto ms-4">
                            <Nav.Link 
                                as={Link} 
                                to="/company/dashboard" 
                                className="text-white fw-semibold px-3 py-2 rounded-pill me-2"
                                style={{ transition: 'all 0.3s ease' }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                                    e.target.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'transparent';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                            >
                                📊 Dashboard
                            </Nav.Link>
                            <Nav.Link 
                                as={Link} 
                                to="/company/job-postings"
                                className="text-white fw-semibold px-3 py-2 rounded-pill me-2"
                                style={{ transition: 'all 0.3s ease' }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                                    e.target.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'transparent';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                            >
                                📋 Tin tuyển dụng
                            </Nav.Link>
                            <Nav.Link 
                                as={Link} 
                                to="/company/applied"
                                className="text-white fw-semibold px-3 py-2 rounded-pill me-2"
                                style={{ 
                                    transition: 'all 0.3s ease',
                                    backgroundColor: 'rgba(255,255,255,0.2)' // Active state
                                }}
                            >
                                📄 Đơn ứng tuyển
                            </Nav.Link>
                            <Nav.Link 
                                as={Link} 
                                to="/company/profile"
                                className="text-white fw-semibold px-3 py-2 rounded-pill"
                                style={{ transition: 'all 0.3s ease' }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                                    e.target.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'transparent';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                            >
                                🏢 Hồ sơ công ty
                            </Nav.Link>
                        </Nav>
                        
                        <Nav className="ms-auto">
                            <Dropdown align="end">
                                <Dropdown.Toggle 
                                    variant="outline-light" 
                                    id="dropdown-basic"
                                    className="border-0 rounded-pill px-3"
                                    style={{
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <div className="d-flex align-items-center">
                                        <div className="text-start">
                                            <div className="text-white fw-bold" style={{ fontSize: '0.9rem' }}>
                                                {company?.ten || 'Loading...'}
                                            </div>
                                        </div>
                                    </div>
                                </Dropdown.Toggle>
                                <Dropdown.Menu 
                                    className="border-0 shadow-lg"
                                    style={{
                                        backgroundColor: 'rgba(255,255,255,0.95)',
                                        backdropFilter: 'blur(20px)',
                                        borderRadius: '12px',
                                        padding: '8px',
                                        marginTop: '8px'
                                    }}
                                >
                                    <Dropdown.Item 
                                        as={Link} 
                                        to="/company/profile"
                                        className="rounded-lg py-2 px-3 mb-1"
                                    >
                                        <div className="d-flex align-items-center">
                                            <span className="me-2">👤</span>
                                            Thông tin công ty
                                        </div>
                                    </Dropdown.Item>
                                    <Dropdown.Item 
                                        as={Link} 
                                        to="/company/settings"
                                        className="rounded-lg py-2 px-3 mb-1"
                                    >
                                        <div className="d-flex align-items-center">
                                            <span className="me-2">⚙️</span>
                                            Cài đặt
                                        </div>
                                    </Dropdown.Item>
                                    <Dropdown.Divider style={{ margin: '8px 0', opacity: 0.3 }} />
                                    <Dropdown.Item 
                                        onClick={handleLogout} 
                                        className="text-danger rounded-lg py-2 px-3"
                                    >
                                        <div className="d-flex align-items-center">
                                            <span className="me-2">🚪</span>
                                            Đăng xuất
                                        </div>
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* ✅ Main Content */}
            <div style={{ marginTop: '76px', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
                <Container className="py-4">

                    {/* ✅ Alert */}
                    {message && (
                        <Alert
                            variant={message.type}
                            onClose={() => setMessage(null)}
                            dismissible
                            className="mb-4"
                        >
                            {message.message}
                        </Alert>
                    )}

                    {/* ✅ Header Section */}
                    <Row className="mb-4">
                        <Col>
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <h1 className="display-6 fw-bold text-primary mb-1">
                                        📄 Quản lý đơn ứng tuyển
                                    </h1>
                                    <p className="lead text-muted mb-0">
                                        Xem và quản lý các đơn ứng tuyển từ ứng viên
                                    </p>
                                </div>
                                <div className="text-end">
                                    <Button variant="outline-primary" as={Link} to="/company/home">
                                        ← Quay về home
                                    </Button>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    {/* ✅ Statistics Cards */}
                    <Row className="mb-4">
                        <Col lg={3} md={6} className="mb-3">
                            <Card className="bg-info text-white h-100">
                                <Card.Body>
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h6 className="card-title mb-1">Tổng đơn</h6>
                                            <h2 className="mb-0">{statusStats.total}</h2>
                                        </div>
                                        <div style={{ fontSize: '2.5rem', opacity: 0.8 }}>
                                            📄
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={3} md={6} className="mb-3">
                            <Card className="bg-warning text-white h-100">
                                <Card.Body>
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h6 className="card-title mb-1">Chờ duyệt</h6>
                                            <h2 className="mb-0">{statusStats.pending}</h2>
                                        </div>
                                        <div style={{ fontSize: '2.5rem', opacity: 0.8 }}>
                                            ⏳
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={3} md={6} className="mb-3">
                            <Card className="bg-success text-white h-100">
                                <Card.Body>
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h6 className="card-title mb-1">Đã duyệt</h6>
                                            <h2 className="mb-0">{statusStats.approved}</h2>
                                        </div>
                                        <div style={{ fontSize: '2.5rem', opacity: 0.8 }}>
                                            ✅
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={3} md={6} className="mb-3">
                            <Card className="bg-danger text-white h-100">
                                <Card.Body>
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h6 className="card-title mb-1">Đã từ chối</h6>
                                            <h2 className="mb-0">{statusStats.rejected}</h2>
                                        </div>
                                        <div style={{ fontSize: '2.5rem', opacity: 0.8 }}>
                                            ❌
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* ✅ Filter and Search Section */}
                    <Card className="mb-4 shadow-sm">
                        <Card.Body>
                            <Row>
                                <Col md={8}>
                                    <Form.Label className="fw-bold">🔍 Tìm kiếm đơn ứng tuyển</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text>🔍</InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Tìm theo tên ứng viên hoặc vị trí..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>
                                </Col>
                                <Col md={4}>
                                    <Form.Label className="fw-bold">📊 Lọc theo trạng thái</Form.Label>
                                    <div className="d-flex gap-2 flex-wrap">
                                        <Button 
                                            variant={status === Enum.choduyet ? "warning" : "outline-warning"}
                                            size="sm"
                                            onClick={() => handleFilterByStatus(Enum.choduyet)}
                                        >
                                            ⏳ Chờ duyệt ({statusStats.pending})
                                        </Button>
                                        <Button 
                                            variant={status === Enum.daDuyet ? "success" : "outline-success"}
                                            size="sm"
                                            onClick={() => handleFilterByStatus(Enum.daDuyet)}
                                        >
                                            ✅ Đã duyệt ({statusStats.approved})
                                        </Button>
                                        <Button 
                                            variant={status === Enum.tuChoi ? "danger" : "outline-danger"}
                                            size="sm"
                                            onClick={() => handleFilterByStatus(Enum.tuChoi)}
                                        >
                                            ❌ Từ chối ({statusStats.rejected})
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* ✅ Applications Table */}
                    <Card className="shadow-sm">
                        <Card.Header className="bg-white">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">
                                    📋 Danh sách đơn ứng tuyển 
                                    <Badge bg="secondary" className="ms-2">
                                        {donUngTuyen.length} đơn
                                    </Badge>
                                </h5>
                                <small className="text-muted">
                                    Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, donUngTuyen.length)} của {donUngTuyen.length} đơn
                                </small>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="table-responsive">
                                <Table hover className="mb-0" style={{ fontSize: '0.9rem' }}>
                                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                                        <tr>
                                            <th className="fw-bold text-primary py-3 px-4">STT</th>
                                            <th className="fw-bold text-primary py-3">👤 Ứng viên</th>
                                            <th className="fw-bold text-primary py-3">💼 Vị trí</th>
                                            <th className="fw-bold text-primary py-3">📅 Ngày nộp</th>
                                            <th className="fw-bold text-primary py-3">📄 CV</th>
                                            <th className="fw-bold text-primary py-3">📊 Trạng thái</th>
                                            <th className="fw-bold text-primary py-3">⚡ Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="text-center py-5">
                                                    <div style={{ fontSize: '4rem' }}>📄</div>
                                                    <h5 className="text-muted mt-3">Không có đơn ứng tuyển nào</h5>
                                                    <p className="text-muted">
                                                        {lstDonUngTuyenGoc.length === 0 
                                                            ? "Đăng tin tuyển dụng để nhận đơn ứng tuyển từ ứng viên"
                                                            : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                                                        }
                                                    </p>
                                                </td>
                                            </tr>
                                        ) : (
                                            currentItems.map((application, index) => (
                                                <tr key={application.id || index} style={{ borderBottom: '1px solid #e9ecef' }}>
                                                    <td className="py-3 px-4">
                                                        <span className="fw-bold text-primary">
                                                            {indexOfFirstItem + index + 1}
                                                        </span>
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="d-flex align-items-center">
                                                           
                                                            <div>
                                                                <div className="fw-bold text-dark">
                                                                    {application.name || 'Ứng viên'}
                                                                </div>
                                                              
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="fw-semibold text-dark">
                                                            {application.tieuDe || 'N/A'}
                                                        </div>
                                                        <small className="text-muted">
                                                            Vị trí thực tập
                                                        </small>
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="text-dark">
                                                            {application.appliedAt ? 
                                                                new Date(application.appliedAt).toLocaleDateString('vi-VN') : 
                                                                'N/A'
                                                            }
                                                        </div>
                                                        <small className="text-muted">
                                                            {application.appliedAt ? 
                                                                new Date(application.appliedAt).toLocaleTimeString('vi-VN', { 
                                                                    hour: '2-digit', 
                                                                    minute: '2-digit' 
                                                                }) : 
                                                                ''
                                                            }
                                                        </small>
                                                    </td>
                                                    <td className="py-3">
                                                        {application.cvfilePath ? (
                                                            <a 
                                                                href={application.cvfilePath} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="btn btn-outline-primary btn-sm"
                                                            >
                                                                📄 Xem CV
                                                            </a>
                                                        ) : (
                                                            <span className="text-muted">Chưa có CV</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3">
                                                        <Badge 
                                                            bg={
                                                                application.status === Enum.choduyet ? 'warning' :
                                                                application.status === Enum.daDuyet ? 'success' : 
                                                                application.status === Enum.tuChoi ? 'danger' : 'secondary'
                                                            }
                                                            className="px-3 py-2"
                                                            style={{ fontSize: '0.75rem' }}
                                                        >
                                                            {application.status === Enum.choduyet ? '⏳ Chờ duyệt' :
                                                             application.status === Enum.daDuyet ? '✅ Đã duyệt' : 
                                                             application.status === Enum.tuChoi ? '❌ Từ chối' : '📝 Đang xử lý'}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="d-flex gap-1">
                                                            {application.status === Enum.choduyet && (
                                                                <>
                                                                    <Button 
                                                                        variant="success" 
                                                                        size="sm"
                                                                        onClick={() => handleApprove(application.id)}
                                                                        disabled={isLoadingApprove}
                                                                        title="Phê duyệt đơn ứng tuyển"
                                                                    >
                                                                        {isLoadingApprove ? (
                                                                            <Spinner animation="border" size="sm" />
                                                                        ) : (
                                                                            <>✅ Duyệt</>
                                                                        )}
                                                                    </Button>
                                                                    <Button 
                                                                        variant="danger" 
                                                                        size="sm"
                                                                        onClick={() => handleReject(application.id)}
                                                                        disabled={isLoadingReject}
                                                                        title="Từ chối đơn ứng tuyển"
                                                                    >
                                                                        {isLoadingReject ? (
                                                                            <Spinner animation="border" size="sm" />
                                                                        ) : (
                                                                            <>❌ Từ chối</>
                                                                        )}
                                                                    </Button>
                                                                </>
                                                            )}
                                                            <Button 
                                                                variant="info" 
                                                                size="sm"
                                                                onClick={() => handleViewDetails(application)}
                                                                title="Xem chi tiết"
                                                            >
                                                                👁️ Chi tiết
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* ✅ Pagination */}
                    {totalPages > 1 && (
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

            {/* ✅ Detail Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                {selectedApplication && (
                    <>
                        <Modal.Header closeButton>
                            <Modal.Title>
                                📄 Chi tiết đơn ứng tuyển
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Row>
                                <Col md={6}>
                                    <h6 className="text-primary">👤 Thông tin ứng viên</h6>
                                    <div className="mb-3">
                                        <strong>Tên:</strong> {selectedApplication.name || 'N/A'}<br/>
                                        <strong>ID:</strong> {selectedApplication.studentId || 'N/A'}<br/>
                                        <strong>Email:</strong> {selectedApplication.email || 'N/A'}<br/>
                                        <strong>Điện thoại:</strong> {selectedApplication.phone || 'N/A'}
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <h6 className="text-primary">💼 Thông tin ứng tuyển</h6>
                                    <div className="mb-3">
                                        <strong>Vị trí:</strong> {selectedApplication.tieuDe || 'N/A'}<br/>
                                        <strong>Ngày nộp:</strong> {
                                            selectedApplication.appliedAt ? 
                                            new Date(selectedApplication.appliedAt).toLocaleString('vi-VN') : 
                                            'N/A'
                                        }<br/>
                                        <strong>Trạng thái:</strong> 
                                        <Badge 
                                            bg={
                                                selectedApplication.status === Enum.choduyet ? 'warning' :
                                                selectedApplication.status === Enum.daDuyet ? 'success' : 
                                                selectedApplication.status === Enum.tuChoi ? 'danger' : 'secondary'
                                            }
                                            className="ms-2"
                                        >
                                            {selectedApplication.status === Enum.choduyet ? '⏳ Chờ duyệt' :
                                             selectedApplication.status === Enum.daDuyet ? '✅ Đã duyệt' : 
                                             selectedApplication.status === Enum.tuChoi ? '❌ Từ chối' : '📝 Đang xử lý'}
                                        </Badge>
                                    </div>
                                </Col>
                            </Row>
                            
                            {selectedApplication.cvfilePath && (
                                <div className="mt-4">
                                    <h6 className="text-primary">📄 CV đính kèm</h6>
                                    <div className="border rounded p-3 bg-light">
                                        <a 
                                            href={selectedApplication.cvfilePath} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="btn btn-outline-primary"
                                        >
                                            📄 Xem CV trong tab mới
                                        </a>
                                    </div>
                                </div>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowModal(false)}>
                                Đóng
                            </Button>
                            {selectedApplication.status === Enum.choduyet && (
                                <>
                                    <Button 
                                        variant="success"
                                        onClick={() => {
                                            handleApprove(selectedApplication.id);
                                            setShowModal(false);
                                        }}
                                        disabled={isLoadingApprove}
                                    >
                                        ✅ Phê duyệt
                                    </Button>
                                    <Button 
                                        variant="danger"
                                        onClick={() => {
                                            handleReject(selectedApplication.id);
                                            setShowModal(false);
                                        }}
                                        disabled={isLoadingReject}
                                    >
                                        ❌ Từ chối
                                    </Button>
                                </>
                            )}
                        </Modal.Footer>
                    </>
                )}
            </Modal>
        </>
    );
}

export default AppliedCompany;