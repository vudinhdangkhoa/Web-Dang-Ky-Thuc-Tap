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
import { type } from '@testing-library/user-event/dist/type';

const apiRoute = new Enum();

function HomeCompany() {
    const [user, setUser] = useState({});
    const [alert, setAlert] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [company, setCompany] = useState({});
    const [isLoadingCompany, setIsLoadingCompany] = useState(true);

    const [lstAppliedJobs, setLstAppliedJobs] = useState([]);
    const [isloadinglstAppliedJobs, setIsLoadinglstAppliedJobs] = useState(true);

    const [lstThongTinTuyenDung, setLstThongTinTuyenDung] = useState([]);
    const [isLoadingThongTinTuyenDung, setIsLoadingThongTinTuyenDung] = useState(true);

    const [dashboardStats, setDashboardStats] = useState({
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
        pendingApplications: 0
    });
    const [isloadingDashboardStats, setIsLoadingDashboardStats] = useState(true);

    const navigate = useNavigate();

    // ✅ Auto-hide alert
    useEffect(() => {
        if (alert) {
            const timer = setTimeout(() => {
                setAlert(null);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [alert]);

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

        }
    }, [user]);

    useEffect(() => {
        if (company && company.id) {
            GetJobPostings();
            GetApplications();
            GetDataDashboard();
        }
    }, [company]);

    const GetCompanyById = async () => {
        try {
            setIsLoadingCompany(true);
            const response = await axiosInstance.get(
                apiRoute.getUrl(`api/AccountCompany/getCompanyById/${user.id}`)
            );

            console.log('Company data:', response.data);
            if (response.status === 200) {
                setCompany(response.data);
            }
        } catch (error) {
            console.error('Error fetching company:', error);
            setAlert({
                type: 'danger',
                message: 'Không thể tải thông tin công ty. Vui lòng thử lại.'
            });
        } finally {
            setIsLoadingCompany(false);
        }
    };

    const GetJobPostings = async () => {


        try {
            setIsLoadingThongTinTuyenDung(true);

            const respone = await axiosInstance.get(apiRoute.getUrl(`api/ChucNangHomeCompany/GetAllThongTinTuyenDung/${company.id}`));
            console.log('get TT tuyen dung status:', respone.status);
            console.log('get TT tuyen dung data:', respone.data);

            if (respone.status === 200) {
                setLstThongTinTuyenDung(respone.data);
                console.log('get list tuyen dung data:', lstThongTinTuyenDung);
            } else {
                setLstThongTinTuyenDung([]);
            }

            setIsLoadingThongTinTuyenDung(false);
        } catch (error) {
            console.log('Error fetching job postings:', error);
            setAlert({
                type: 'danger',
                message: 'Không thể tải thông tin tuyển dụng. Vui lòng thử lại.'
            });
            setIsLoadingThongTinTuyenDung(false);
        }
    };



    const GetApplications = async () => {

        try {

            setIsLoadinglstAppliedJobs(true);

            const respone = await axiosInstance.get(apiRoute.getUrl(`api/ChucNangHomeCompany/GetAllDonUngTuyen/${company.id}`));
            console.log('company id:', company.id);
            console.log('Applications status:', respone.status);
            console.log('Applications data:', respone.data);

            if (respone.status === 200) {
                setLstAppliedJobs(respone.data);
            } else {
                setLstAppliedJobs([]);
            }
            setIsLoadinglstAppliedJobs(false);

        } catch (error) {
            console.error('Error fetching applications:', error);
            setAlert({
                type: 'danger',
                message: 'Không thể tải thông tin đơn ứng tuyển. Vui lòng thử lại.'
            });
            setIsLoadinglstAppliedJobs(false);
        }
    };


    const GetDataDashboard = async () => {

        try {
            setIsLoadingDashboardStats(true);
            const respone = await axiosInstance.get(apiRoute.getUrl(`api/ChucNangHomeCompany/GetDataDashboard/${company.id}`));

            console.log('Dashboard status:', respone.status);
            console.log('Dashboard data:', respone.data);
            if (respone.status === 200) {
                setDashboardStats({
                    totalJobs: respone.data.tongThongTinTuyenDung || 0,
                    activeJobs: respone.data.tongThongTinTuyenDungHoatDong || 0,
                    totalApplications: respone.data.tongDonUngTuyen || 0,
                    pendingApplications: respone.data.tongDonUngTuyenChoDuyet || 0
                });
            }
            setIsLoadingDashboardStats(false);
        } catch (error) {
            console.log('Error fetching dashboard data:', error);
            setAlert({
                type: 'danger',
                message: 'Không thể tải thông tin bảng điều khiển. Vui lòng thử lại.'
            });
            setIsLoadingDashboardStats(false);
        }


    }


    const handleLogout = async () => {

        await axiosInstance.post(apiRoute.getUrl('api/DangNhap/Logout'));
        
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        navigate('/dang-nhap');
    };

    const checkIsLoading = () => {

        return isLoadingCompany || isLoadingThongTinTuyenDung || isLoading || isloadingDashboardStats || isloadinglstAppliedJobs;
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
            {/* ✅ Modern Navigation Bar */}
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
                                style={{
                                    transition: 'all 0.3s ease',
                                    ':hover': {
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        transform: 'translateY(-1px)'
                                    }
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                                    e.target.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'transparent';
                                    e.target.style.transform = 'translateY(0)';
                                }}
                            >
                                Dashboard
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
                                Tin tuyển dụng
                            </Nav.Link>
                            <Nav.Link
                                as={Link}
                                to="/company/applied"
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
                                Đơn ứng tuyển
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
                                Hồ sơ công ty
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
                                        style={{
                                            transition: 'all 0.2s ease',
                                            border: 'none'
                                        }}
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
                                        style={{
                                            transition: 'all 0.2s ease',
                                            border: 'none'
                                        }}
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
                                        style={{
                                            transition: 'all 0.2s ease',
                                            border: 'none'
                                        }}
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

                    {/* ✅ Welcome Section */}
                    <Row className="mb-4">
                        <Col>
                            <div className="d-flex align-items-center">
                                {company?.logo && (
                                    <Image
                                        src={company.logo}
                                        roundedCircle
                                        width={80}
                                        height={80}
                                        className="me-3"
                                        style={
                                            {
                                                backgroundColor: 'white',
                                                objectFit: 'cover',
                                                border: '1px solid #e0e0e0'
                                            }
                                        }
                                    />
                                )}
                                <div>
                                    <h1 className="display-6 fw-bold text-primary mb-1">
                                        Chào mừng, {company?.ten}! 🏢
                                    </h1>
                                    <p className="lead text-muted mb-0">
                                        Quản lý tuyển dụng và tìm kiếm nhân tài
                                    </p>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    {/* ✅ Dashboard Stats */}
                    <Row className="mb-4">
                        <Col lg={3} md={6} className="mb-3">
                            <Card className="bg-primary text-white h-100">
                                <Card.Body>
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h6 className="card-title mb-1">Tổng tin tuyển dụng</h6>
                                            <h2 className="mb-0">{dashboardStats.totalJobs}</h2>
                                        </div>
                                        <div style={{ fontSize: '2.5rem', opacity: 0.8 }}>
                                            📋
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
                                            <h6 className="card-title mb-1">Tin đang hoạt động</h6>
                                            <h2 className="mb-0">{dashboardStats.activeJobs}</h2>
                                        </div>
                                        <div style={{ fontSize: '2.5rem', opacity: 0.8 }}>
                                            ✅
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={3} md={6} className="mb-3">
                            <Card className="bg-info text-white h-100">
                                <Card.Body>
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h6 className="card-title mb-1">Tổng đơn ứng tuyển</h6>
                                            <h2 className="mb-0">{dashboardStats.totalApplications}</h2>
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
                                            <h6 className="card-title mb-1">Đơn chờ duyệt</h6>
                                            <h2 className="mb-0">{dashboardStats.pendingApplications}</h2>
                                        </div>
                                        <div style={{ fontSize: '2.5rem', opacity: 0.8 }}>
                                            ⏳
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* ✅ Quick Actions */}
                    <Row className="mb-4">
                        <Col>
                            <Card>
                                <Card.Header>
                                    <h5 className="mb-0">🚀 Thao tác nhanh</h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col md={3} className="mb-3">
                                            <div className="d-grid">
                                                <Button
                                                    variant="primary"
                                                    size="lg"
                                                    as={Link}
                                                    to="/company/create-job"
                                                >
                                                    ➕ Đăng tin tuyển dụng
                                                </Button>
                                            </div>
                                        </Col>
                                        <Col md={3} className="mb-3">
                                            <div className="d-grid">
                                                <Button
                                                    variant="outline-primary"
                                                    size="lg"
                                                    as={Link}
                                                    to="/company/applied"
                                                >
                                                    📄 Xem đơn ứng tuyển
                                                </Button>
                                            </div>
                                        </Col>
                                        <Col md={3} className="mb-3">
                                            <div className="d-grid">
                                                <Button
                                                    variant="outline-success"
                                                    size="lg"
                                                    as={Link}
                                                    to="/company/job-postings"
                                                >
                                                    📋 Quản lý tin tuyển dụng
                                                </Button>
                                            </div>
                                        </Col>
                                        <Col md={3} className="mb-3">
                                            <div className="d-grid">
                                                <Button
                                                    variant="outline-info"
                                                    size="lg"
                                                    as={Link}
                                                    to="/company/profile"
                                                >
                                                    🏢 Cập nhật hồ sơ
                                                </Button>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Row>
                        {/* ✅ Recent Job Postings */}
                        <Col lg={6} className="mb-4">
                            <Card className="h-100">
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">📋 Tin tuyển dụng gần đây</h5>
                                    <Button variant="outline-primary" size="sm" as={Link} to="/company/job-postings">
                                        Xem tất cả
                                    </Button>
                                </Card.Header>
                                <Card.Body>
                                    {lstThongTinTuyenDung.length > 0 ? (
                                        <div className="list-group list-group-flush">
                                            <Table hover className="mb-0" style={{ fontSize: '0.9rem' }}>
                                                <thead style={{ backgroundColor: '#f8f9fa' }}>
                                                    <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                                                        <th className="fw-bold text-primary border-0 py-3">
                                                            📋 Vị trí tuyển dụng
                                                        </th>
                                                        <th className="fw-bold text-primary border-0 py-3 text-center">
                                                            👥 Số lượng
                                                        </th>
                                                        <th className="fw-bold text-primary border-0 py-3">
                                                            📅 Ngày đăng
                                                        </th>
                                                        <th className="fw-bold text-primary border-0 py-3">
                                                            🏷️ Trạng thái
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {lstThongTinTuyenDung.slice(0, 5).map((item, index) => (
                                                        <tr
                                                            key={item.id || index}
                                                            className="border-bottom"
                                                            style={{
                                                                borderBottom: '1px solid #e9ecef',
                                                                transition: 'background-color 0.15s ease-in-out'
                                                            }}
                                                        >
                                                            <td className="py-3 border-0">
                                                                <div className="fw-semibold text-dark">
                                                                    {item.tenVitri || item.tieuDe}
                                                                </div>
                                                               
                                                            </td>
                                                            <td className="py-3 border-0 text-center">
                                                                <Badge bg="info" className="px-2 py-1">
                                                                    {item.soLuong} vị trí
                                                                </Badge>
                                                            </td>
                                                            <td className="py-3 border-0">
                                                                <div className="text-dark">
                                                                    {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                                                                </div>
                                                                <small className="text-muted">
                                                                    {new Date(item.createdAt).toLocaleTimeString('vi-VN', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </small>
                                                            </td>
                                                            <td className="py-3 border-0">
                                                                <Badge
                                                                    bg={item.isActive ? 'success' : 'secondary'}
                                                                    className="px-3 py-2"
                                                                    style={{ fontSize: '0.75rem' }}
                                                                >
                                                                    {item.isActive ? '✅ Đang hoạt động' : '⏸️ Ngừng hoạt động'}
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>


                                            </Table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <div style={{ fontSize: '3rem' }}>📋</div>
                                            <h6 className="text-muted">Chưa có tin tuyển dụng nào</h6>
                                            <Button variant="primary" size="sm" as={Link} to="/company/create-job">
                                                Đăng tin đầu tiên
                                            </Button>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* ✅ Recent Applications */}
                        <Col lg={6} className="mb-4">
                            <Card className="h-100">
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">📄 Đơn ứng tuyển mới</h5>
                                    <Button variant="outline-primary" size="sm" as={Link} to="/company/applied">
                                        Xem tất cả
                                    </Button>
                                </Card.Header>
                                <Card.Body>
                                    {lstAppliedJobs.length > 0 ? (
                                        <div className="table-responsive">
                                            <Table hover bordered className="mb-0" style={{ fontSize: '0.9rem' }}>
                                                <thead style={{ backgroundColor: '#f8f9fa' }}>
                                                    <tr>
                                                        <th className="fw-bold text-primary border-0 py-3">
                                                            Tên ứng viên
                                                        </th>
                                                        <th className="fw-bold text-primary border-0 py-3">
                                                            Đơn tuyển
                                                        </th>
                                                        <th className="fw-bold text-primary border-0 py-3">
                                                            Ngày nộp
                                                        </th>
                                                        <th className="fw-bold text-primary border-0 py-3">
                                                            Trạng thái
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {lstAppliedJobs.slice(0, 5).map((application, index) => (
                                                        <tr key={application.id || index} className="border-bottom">
                                                            <td className="py-3 border-0">
                                                                <div className="d-flex align-items-center">

                                                                    <div>
                                                                        <div className="fw-bold text-dark">
                                                                            {application.name || 'Ứng viên'}
                                                                        </div>

                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 border-0">
                                                                <div className="fw-semibold text-dark">
                                                                    {application.tieuDe || application.position || 'N/A'}
                                                                </div>

                                                            </td>
                                                            <td className="py-3 border-0">
                                                                <div className="text-dark">
                                                                    {application.appliedAt ?
                                                                        new Date(application.appliedAt).toLocaleDateString('vi-VN') :
                                                                        'N/A'
                                                                    }
                                                                </div>

                                                            </td>
                                                            <td className="py-3 border-0">
                                                                <Badge
                                                                    bg={
                                                                        application.status === Enum.choduyet || !application.status ? 'warning' :
                                                                            application.status === Enum.daDuyet ? 'success' :
                                                                                application.status === Enum.tuChoi ? 'danger' : 'secondary'
                                                                    }
                                                                    className="px-3 py-2"
                                                                    style={{ fontSize: '0.75rem' }}
                                                                >
                                                                    {application.status === Enum.choduyet || !application.status ? '⏳ Chờ duyệt' :
                                                                        application.status === Enum.daDuyet ? '✅ Đã duyệt' :
                                                                            application.status === Enum.tuChoi ? '❌ Từ chối' : '📝 Đang xử lý'}
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>

                                    ) : (
                                        <div className="text-center py-4">
                                            <div style={{ fontSize: '3rem' }}>📄</div>
                                            <h6 className="text-muted">Chưa có đơn ứng tuyển nào</h6>
                                            <p className="small text-muted">
                                                Đăng tin tuyển dụng để nhận đơn ứng tuyển
                                            </p>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* ✅ Company Profile Summary */}
                    <Row>
                        <Col>
                            <Card>
                                <Card.Header>
                                    <h5 className="mb-0">🏢 Thông tin công ty</h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col md={4} className="text-center mb-3">
                                            <div>
                                                {company?.logo ? (
                                                    <Image
                                                        src={company.logo}
                                                        roundedCircle
                                                        width={120}
                                                        height={120}
                                                        className=" mb-3"
                                                    />
                                                ) : (
                                                    <div
                                                        className="bg-light rounded d-flex align-items-center justify-content-center mb-3"
                                                        style={{ width: '120px', height: '120px', fontSize: '3rem', margin: '0 auto' }}
                                                    >
                                                        🏢
                                                    </div>
                                                )}
                                                <div>
                                                    <Button variant="outline-primary" size="sm" as={Link} to="/company/profile">
                                                        Chỉnh sửa hồ sơ
                                                    </Button>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col md={8}>
                                            <h4 className="text-primary">{company?.ten || 'Tên công ty'}</h4>
                                            <div className="mb-2">
                                                <strong>📍 Địa chỉ:</strong> {company?.diaChi || 'Chưa cập nhật'}
                                            </div>
                                            <div className="mb-2">
                                                <strong>📞 Điện thoại:</strong> {company?.phone || 'Chưa cập nhật'}
                                            </div>
                                            <div className="mb-2">
                                                <strong>📧 Email:</strong> {company?.email || 'Chưa cập nhật'}
                                            </div>
                                            <div className="mb-3">
                                                <strong>📄 Mô tả:</strong>
                                                <p className="mb-0 text-muted">
                                                    {company?.moTa || 'Chưa có mô tả công ty'}
                                                </p>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                </Container>
            </div>
        </>
    );
}

export default HomeCompany;