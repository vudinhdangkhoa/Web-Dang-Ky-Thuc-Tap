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

const apiRoute = new Enum();

function JobPostingCompany() {
    const [user, setUser] = useState({});
    const [company, setCompany] = useState({});
    const [jobPostings, setJobPostings] = useState([]);
    const [jobPostingFilter, setJobPostingFilter] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingCompany, setIsLoadingCompany] = useState(true);
    const [isLoadingJobPostings, setIsLoadingJobPostings] = useState(true);
    const [message, setMessage] = useState(null);

    const [selectedJob, setSelectedJob] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [showModalPause, setShowModalPause] = useState(false);
    const [isLoadingPause, setIsLoadingPause] = useState(false);
    const [selectedJobPause, setSelectedJobPause] = useState(null);

    const [showModalResume, setShowModalResume] = useState(false);
    const [selectedJobResume, setSelectedJobResume] = useState(null);
    const [isLoadingResume, setIsLoadingResume] = useState(false);

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
            GetAllThongTinTuyenDung();
        }
    }, [user]);

    // ✅ Filter by status and search
    useEffect(() => {
        if (jobPostings.length > 0) {
            let filtered = jobPostings;
            
            // Filter by status
            if (statusFilter !== null) {
                filtered = filtered.filter(posting => posting.isActive === statusFilter);
            }
            
            // Filter by search term
            if (searchTerm.trim()) {
                filtered = filtered.filter(posting => 
                    (posting.tenVitri || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (posting.tieuDe || '').toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
            
            setJobPostingFilter(filtered);
            setCurrentPage(1);
        } else {
            setJobPostingFilter([]);
        }
    }, [statusFilter, jobPostings, searchTerm]);

    const GetCompanyById = async () => {
        try {
            setIsLoadingCompany(true);
            const response = await axiosInstance.get(
                apiRoute.getUrl(`api/AccountCompany/getCompanyById/${user.id}`)
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

    const handleFilter = (status) => {
        setStatusFilter(status);
    };

    const GetAllThongTinTuyenDung = async () => {
        try {
            setIsLoadingJobPostings(true);

            const response = await axiosInstance.get(
                apiRoute.getUrl(`api/ChucNangDangTinTuyenDungCompany/GetAllThongTinTuyenDung/${user.id}`)
            );
            
            console.log('get thong tin tuyen dung status: ', response.status);
            console.log('get thong tin tuyen dung data: ', response.data);

            if (response.status === 200) {
                setJobPostings(response.data || []);
                // Set initial filter to show active jobs
                setJobPostingFilter((response.data || []).filter(posting => posting.isActive === true));
            } else {
                setJobPostings([]);
                setJobPostingFilter([]);
            }
        } catch (error) {
            console.error('Error fetching job postings:', error);
            setMessage({
                type: 'danger',
                message: 'Không thể tải thông tin tuyển dụng. Vui lòng thử lại.'
            });
            setJobPostings([]);
            setJobPostingFilter([]);
        } finally {
            setIsLoadingJobPostings(false);
        }
    };

    const handleViewDetails = (job) => {
        setSelectedJob(job);
        setShowModal(true);
    };

    const handlePauseJob = async (idJob) => {
        try {
            setIsLoadingPause(true);
            const response = await axiosInstance.put(apiRoute.getUrl(`api/ChucNangDangTinTuyenDungCompany/PauseJob/${idJob}`));

            if (response.status === 200) {
                setMessage({
                    type: 'success',
                    message: 'Tạm ngừng tuyển dụng thành công.'
                });
                setJobPostings(prevState => prevState.map(item => item.id === idJob ? { ...item, isActive: false } : item));
            }
            setIsLoadingPause(false);
            setShowModalPause(false);
            window.scrollTo(0, 0);
        } catch (error) {
            console.log('failed to pause job posting:', error);
            setMessage({
                type: 'danger',
                message: 'Không thể tạm ngừng tuyển dụng. Vui lòng thử lại.'
            });
            setIsLoadingPause(false);
            setShowModalPause(false);
            window.scrollTo(0, 0);
        }
    }

    const handleResumeJob= async(idJob)=>{
         try {
            setIsLoadingResume(true);
            const response = await axiosInstance.put(apiRoute.getUrl(`api/ChucNangDangTinTuyenDungCompany/ResumeJob/${idJob}`));

            if (response.status === 200) {
                setMessage({
                    type: 'success',
                    message: 'Tiếp tục tuyển dụng thành công.'
                });
                setJobPostings(prevState => prevState.map(item => item.id === idJob ? { ...item, isActive: true } : item));
            }
            setIsLoadingResume(false);
            setShowModalResume(false);
            window.scrollTo(0, 0);
        } catch (error) {
            console.log('failed to resume job posting:', error);
            setMessage({
                type: 'danger',
                message: 'Không thể tiếp tục tuyển dụng. Vui lòng thử lại.'
            });
            setIsLoadingResume(false);
            setShowModalResume(false);
            window.scrollTo(0, 0);
        }
    }

    const handleLogout = async () => {
        await axiosInstance.post(apiRoute.getUrl('api/DangNhap/Logout'));
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        navigate('/dang-nhap');
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = jobPostingFilter.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(jobPostingFilter.length / itemsPerPage);

    const getStatusStats = () => {
        const active = jobPostings.filter(item => item.isActive === true).length;
        const inactive = jobPostings.filter(item => item.isActive === false).length;
        return { active, inactive, total: jobPostings.length };
    };

    const statusStats = getStatusStats();

    const checkIsLoading = () => {
        return isLoading || isLoadingJobPostings || isLoadingCompany;
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
                                style={{ 
                                    transition: 'all 0.3s ease',
                                    backgroundColor: 'rgba(255,255,255,0.2)' // Active state
                                }}
                            >
                                📋 Tin tuyển dụng
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
                                        📋 Quản lý tin tuyển dụng
                                    </h1>
                                    <p className="lead text-muted mb-0">
                                        Đăng tin và quản lý các vị trí tuyển dụng
                                    </p>
                                </div>
                                <div className="text-end">
                                    <Button variant="primary" as={Link} to="/company/create-job" className="me-2">
                                        ➕ Đăng tin mới
                                    </Button>
                                    <Button variant="outline-primary" as={Link} to="/company/home">
                                        ← Quay về Trang chủ
                                    </Button>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    {/* ✅ Statistics Cards */}
                    <Row className="mb-4">
                        <Col lg={4} md={6} className="mb-3">
                            <Card className="bg-info text-white h-100">
                                <Card.Body>
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h6 className="card-title mb-1">Tổng tin</h6>
                                            <h2 className="mb-0">{statusStats.total}</h2>
                                        </div>
                                        <div style={{ fontSize: '2.5rem', opacity: 0.8 }}>
                                            📋
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={4} md={6} className="mb-3">
                            <Card className="bg-success text-white h-100">
                                <Card.Body>
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h6 className="card-title mb-1">Đang tuyển</h6>
                                            <h2 className="mb-0">{statusStats.active}</h2>
                                        </div>
                                        <div style={{ fontSize: '2.5rem', opacity: 0.8 }}>
                                            ✅
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={4} md={6} className="mb-3">
                            <Card className="bg-secondary text-white h-100">
                                <Card.Body>
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <h6 className="card-title mb-1">Ngừng tuyển</h6>
                                            <h2 className="mb-0">{statusStats.inactive}</h2>
                                        </div>
                                        <div style={{ fontSize: '2.5rem', opacity: 0.8 }}>
                                            ⏸️
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
                                    <Form.Label className="fw-bold">🔍 Tìm kiếm tin tuyển dụng</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text>🔍</InputGroup.Text>
                                        <Form.Control
                                            type="text"
                                            placeholder="Tìm theo vị trí hoặc tiêu đề..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>
                                </Col>
                                <Col md={4}>
                                    <Form.Label className="fw-bold">📊 Lọc theo trạng thái</Form.Label>
                                    <div className="d-flex gap-2 flex-wrap">
                                        <Button 
                                            variant={statusFilter === true ? "success" : "outline-success"}
                                            size="sm"
                                            onClick={() => handleFilter(true)}
                                        >
                                            ✅ Đang tuyển ({statusStats.active})
                                        </Button>
                                        <Button 
                                            variant={statusFilter === false ? "secondary" : "outline-secondary"}
                                            size="sm"
                                            onClick={() => handleFilter(false)}
                                        >
                                            ⏸️ Ngừng tuyển ({statusStats.inactive})
                                        </Button>
                                        <Button 
                                            variant={statusFilter === null ? "info" : "outline-info"}
                                            size="sm"
                                            onClick={() => handleFilter(null)}
                                        >
                                            📋 Tất cả ({statusStats.total})
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* ✅ Job Postings Table */}
                    <Card className="shadow-sm">
                        <Card.Header className="bg-white">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">
                                    📋 Danh sách tin tuyển dụng 
                                    <Badge bg="secondary" className="ms-2">
                                        {jobPostingFilter.length} tin
                                    </Badge>
                                </h5>
                                <small className="text-muted">
                                    Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, jobPostingFilter.length)} của {jobPostingFilter.length} tin
                                </small>
                            </div>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className="table-responsive">
                                <Table hover className="mb-0" style={{ fontSize: '0.9rem' }}>
                                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                                        <tr>
                                            <th className="fw-bold text-primary py-3 px-4">STT</th>
                                            <th className="fw-bold text-primary py-3">💼 Vị trí tuyển dụng</th>
                                            <th className="fw-bold text-primary py-3">📊 Trạng thái</th>
                                            <th className="fw-bold text-primary py-3">📅 Ngày đăng</th>
                                            <th className="fw-bold text-primary py-3">👥 Số lượng</th>
                                            <th className="fw-bold text-primary py-3">⏰ Hạn nộp</th>
                                            <th className="fw-bold text-primary py-3">⚡ Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="text-center py-5">
                                                    <div style={{ fontSize: '4rem' }}>📋</div>
                                                    <h5 className="text-muted mt-3">Không có tin tuyển dụng nào</h5>
                                                    <p className="text-muted">
                                                        {jobPostings.length === 0 
                                                            ? "Bắt đầu đăng tin tuyển dụng để tìm kiếm nhân tài"
                                                            : "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                                                        }
                                                    </p>
                                                    {jobPostings.length === 0 && (
                                                        <Button variant="primary" as={Link} to="/company/create-job">
                                                            ➕ Đăng tin tuyển dụng đầu tiên
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ) : (
                                            currentItems.map((posting, index) => (
                                                <tr key={posting.id || index} style={{ borderBottom: '1px solid #e9ecef' }}>
                                                    <td className="py-3 px-4">
                                                        <span className="fw-bold text-primary">
                                                            {indexOfFirstItem + index + 1}
                                                        </span>
                                                    </td>
                                                    <td className="py-3">
                                                        <div>
                                                            <div className="fw-bold text-dark">
                                                                {posting.tenVitri || posting.tieuDe}
                                                            </div>
                                                          
                                                            {posting.salary && (
                                                                <div>
                                                                    <small className="text-success fw-semibold">
                                                                        💰 {posting.salary.toLocaleString('vi-VN')} VND
                                                                    </small>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3">
                                                        <Badge 
                                                            bg={posting.isActive ? 'success' : 'secondary'}
                                                            className="px-3 py-2"
                                                            style={{ fontSize: '0.75rem' }}
                                                        >
                                                            {posting.isActive ? '✅ Đang tuyển' : '⏸️ Ngừng tuyển'}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="text-dark">
                                                            {posting.createdAt ? 
                                                                new Date(posting.createdAt).toLocaleDateString('vi-VN') : 
                                                                'N/A'
                                                            }
                                                        </div>
                                                       
                                                    </td>
                                                    <td className="py-3 text-center">
                                                        <Badge bg="info" className="px-2 py-1">
                                                            {posting.soLuong} vị trí
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="text-dark">
                                                            {posting.hanNop ? 
                                                                new Date(posting.hanNop).toLocaleDateString('vi-VN') : 
                                                                'N/A'
                                                            }
                                                        </div>
                                                        <small className={`text-${new Date(posting.hanNop) < new Date() ? 'danger' : 'success'}`}>
                                                            {new Date(posting.hanNop) < new Date() ? '⚠️ Đã hết hạn' : '✅ Còn hạn'}
                                                        </small>
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="d-flex gap-1">
                                                            <Button 
                                                                variant="info" 
                                                                size="sm"
                                                                onClick={() => handleViewDetails(posting)}
                                                                title="Xem chi tiết"
                                                            >
                                                                👁️ Chi tiết
                                                            </Button>
                                                            <Button 
                                                                variant="outline-primary" 
                                                                size="sm"
                                                                as={Link}
                                                                to={`/company/edit-job/${posting.id}`}
                                                                title="Chỉnh sửa"
                                                            >
                                                                ✏️ Sửa
                                                            </Button>
                                                            <Button 
                                                                variant={posting.isActive ? "outline-secondary" : "outline-success"}
                                                                size="sm"
                                                                title={posting.isActive ? "Tạm ngừng tuyển" : "Kích hoạt lại"}
                                                                onClick={() => {
                                                                   if (posting.isActive) {
                                                                        setShowModalPause(true);
                                                                        setSelectedJobPause(posting);
                                                                   }else{
                                                                        setShowModalResume(true);
                                                                        setSelectedJobResume(posting);
                                                                   }
                                                                }}
                                                            >
                                                                {posting.isActive ? "⏸️" : "▶️"}
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
                {selectedJob && (
                    <>
                        <Modal.Header closeButton>
                            <Modal.Title>
                                📋 Chi tiết tin tuyển dụng
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Row>
                                <Col md={6}>
                                    <h6 className="text-primary">💼 Thông tin vị trí</h6>
                                    <div className="mb-3">
                                        <strong>Vị trí:</strong> {selectedJob.tenVitri || selectedJob.tieuDe}<br/>
                                        <strong>Tiêu đề:</strong> {selectedJob.tieuDe}<br/>
                                        <strong>Số lượng:</strong> {selectedJob.soLuong} vị trí<br/>
                                        <strong>Thời gian:</strong> {selectedJob.thoigian || 'N/A'}
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <h6 className="text-primary">💰 Thông tin khác</h6>
                                    <div className="mb-3">
                                        <strong>Mức lương:</strong> {selectedJob.salary ? selectedJob.salary.toLocaleString('vi-VN') + ' VND' : 'Thỏa thuận'}<br/>
                                        <strong>Ngày đăng:</strong> {
                                            selectedJob.createdAt ? 
                                            new Date(selectedJob.createdAt).toLocaleString('vi-VN') : 
                                            'N/A'
                                        }<br/>
                                        <strong>Hạn nộp:</strong> {
                                            selectedJob.hanNop ? 
                                            new Date(selectedJob.hanNop).toLocaleDateString('vi-VN') : 
                                            'N/A'
                                        }<br/>
                                        <strong>Trạng thái:</strong> 
                                        <Badge 
                                            bg={selectedJob.isActive ? 'success' : 'secondary'}
                                            className="ms-2"
                                        >
                                            {selectedJob.isActive ? '✅ Đang tuyển' : '⏸️ Ngừng tuyển'}
                                        </Badge>
                                    </div>
                                </Col>
                            </Row>
                            
                            {selectedJob.moTa && (
                                <div className="mt-4">
                                    <h6 className="text-primary">📝 Mô tả công việc</h6>
                                    <div className="border rounded p-3 bg-light">
                                        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                                            {selectedJob.moTa}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {selectedJob.yeuCau && (
                                <div className="mt-3">
                                    <h6 className="text-primary">📋 Yêu cầu</h6>
                                    <div className="border rounded p-3 bg-light">
                                        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                                            {selectedJob.yeuCau}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {selectedJob.benefits && (
                                <div className="mt-3">
                                    <h6 className="text-primary">🎁 Quyền lợi</h6>
                                    <div className="border rounded p-3 bg-light">
                                        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                                            {selectedJob.benefits}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowModal(false)}>
                                Đóng
                            </Button>
                            <Button 
                                variant="primary"
                                as={Link}
                                to={`/company/edit-job/${selectedJob.id}`}
                                onClick={() => setShowModal(false)}
                            >
                                ✏️ Chỉnh sửa
                            </Button>
                        </Modal.Footer>
                    </>
                )}
            </Modal>

            {/* Modal tạm dừng tin tuyển dụng */}
            <Modal show={showModalPause} onHide={() => setShowModalPause(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>⏸️ Tạm dừng tin tuyển dụng</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Bạn có chắc chắn muốn tạm dừng tin tuyển dụng này không?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModalPause(false)}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={() => handlePauseJob(selectedJobPause.id)} disabled={isLoadingPause}>
                        Xác nhận
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal resume job */}
            <Modal show={showModalResume} onHide={() => setShowModalResume(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>▶️ Tiếp tục tin tuyển dụng</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Bạn có chắc chắn muốn tiếp tục tin tuyển dụng này không?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModalResume(false)}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={() => handleResumeJob(selectedJobResume.id)} disabled={isLoadingResume}>
                        Xác nhận
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default JobPostingCompany;