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
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Enum from '../../dungchung/enum'
import axiosInstance from '../../dungchung/axiosConfig';


const apiRoute = new Enum();

function EditJobPostCompany() {
    const { id } = useParams();
    const [user, setUser] = useState({});

    const [message, setMessage] = useState(null);

    const [isLoading, setIsLoading] = useState(true);

    const [company, setCompany] = useState({});
    const [isLoadingCompany, setIsLoadingCompany] = useState(true);

    const [locationOptions, setLocationOptions] = useState([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(true);

    const [errors, setErrors] = useState({});
    const [isLoadingJobPost, setIsLoadingJobPost] = useState(true);

    const [jobData, setJobData] = useState({
            TieuDe: '',
            MoTa: '',
            YeuCau: '',
            Benefits: '',
            IdLocation: '',
            Salary: '',
            HanNop: '',
            SoLuong: '',
            Thoigian: ''
        });
    const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
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
    }, [navigate,id]);

    useEffect(() => {
        if (user && user.id) {
            GetCompanyById();
            GetJobPostById();
            GetLocationJob();
        }
    }, [user]);

     const GetLocationJob = async () => {
        try {
            setIsLoadingLocations(true);
            const response = await axiosInstance.get(
                apiRoute.getUrl(`api/ChucNangStudent/GetAllViTriTT`)
            );
            console.log('Location response status:', response.status);
            console.log('Location response data:', response.data);
            if (response.status === 200) {
                setLocationOptions(response.data);
            } else {
                setLocationOptions([]);
            }
            setIsLoadingLocations(false);
        } catch (error) {
            console.log('Error fetching locations:', error);
            setMessage({
                type: 'danger',
                message: 'Không thể tải thông tin vị trí. Vui lòng thử lại.'
            });
            setIsLoadingLocations(false);
        }
    }

    const GetJobPostById= async()=>{

        try {
            console.log('id job post:', id);
            setIsLoadingJobPost(true);
            const response = await axiosInstance.get(apiRoute.getUrl(`api/ChucNangDangTinTuyenDungCompany/GetThongTinTuyenDungById/${id}`));
            
            console.log('Job Post Data:', response.data);
            console.log('job post status:', response.status);
            if(response.status === 200) {
                setJobData(
                    {
                        TieuDe: response.data.tieuDe,
                        MoTa: response.data.moTa,
                        YeuCau: response.data.yeuCau,
                        Benefits: response.data.benefits,
                        IdLocation: response.data.idLocation,
                        Salary: response.data.salary,
                        HanNop: response.data.hanNop,
                        SoLuong: response.data.soLuong,
                        Thoigian: response.data.thoigian
                    }
                );
            }else{
                setMessage({
                    type: 'danger',
                    message: 'Không thể tải thông tin bài đăng. Vui lòng thử lại.'
                });
                
            }
            setIsLoadingJobPost(false);
        } catch (error) {
            console.log('Error fetching job post:', error);
            setMessage({
                type: 'danger',
                message: 'Không thể tải thông tin bài đăng. Vui lòng thử lại.'
            });
            setIsLoadingJobPost(false);
        }

    }

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

    const GetThongTinTuyenDungById = async (id) => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(
                apiRoute.getUrl(`api/JobPost/getJobPostById/${id}`)
            );

            if (response.status === 200) {

            }
        } catch (error) {
            console.error('Error fetching job post:', error);
            setMessage({
                type: 'danger',
                message: 'Không thể tải thông tin bài đăng. Vui lòng thử lại.'
            });
        } finally {
            setIsLoading(false);
        }
    };

     const handleChange = (e) => {
        const { name, value } = e.target;
        setJobData(prev => ({
            ...prev,
            [name]: value
        }));

        // Xóa lỗi khi user bắt đầu nhập
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Kiểm tra các field bắt buộc
        if (!jobData.TieuDe?.trim()) {
            newErrors.TieuDe = 'Tiêu đề là bắt buộc';
        } else if (jobData.TieuDe.length < 10) {
            newErrors.TieuDe = 'Tiêu đề phải có ít nhất 10 ký tự';
        }

        if (!jobData.MoTa?.trim()) {
            newErrors.MoTa = 'Mô tả công việc là bắt buộc';
        } else if (jobData.MoTa.length < 50) {
            newErrors.MoTa = 'Mô tả phải có ít nhất 50 ký tự';
        }

        if (!jobData.YeuCau?.trim()) {
            newErrors.YeuCau = 'Yêu cầu công việc là bắt buộc';
        }

        if (!jobData.Benefits?.trim()) {
            newErrors.Benefits = 'Quyền lợi là bắt buộc';
        }

        if (!jobData.IdLocation) {
            newErrors.IdLocation = 'Vị trí làm việc là bắt buộc';
        }

        if (!jobData.Salary) {
            newErrors.Salary = 'Mức lương là bắt buộc';
        } else if (jobData.Salary < 1000000) {
            newErrors.Salary = 'Mức lương phải ít nhất 1,000,000 VND';
        }

        if (!jobData.SoLuong) {
            newErrors.SoLuong = 'Số lượng tuyển là bắt buộc';
        } else if (jobData.SoLuong < 1) {
            newErrors.SoLuong = 'Số lượng phải ít nhất 1';
        }

        if (!jobData.HanNop) {
            newErrors.HanNop = 'Hạn nộp là bắt buộc';
        } else if (new Date(jobData.HanNop) <= new Date()) {
            newErrors.HanNop = 'Hạn nộp phải sau ngày hôm nay';
        }

        if (!jobData.Thoigian) {
            newErrors.Thoigian = 'Thời gian thực tập là bắt buộc';
        } else if (jobData.Thoigian < 1) {
            newErrors.Thoigian = 'Thời gian thực tập phải ít nhất 1 tháng';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = async (e) => {

        e.preventDefault();
        if(!validateForm()) {
            return;
        }

        try {
            setIsLoadingUpdate(true);
            const respone = await axiosInstance.put(apiRoute.getUrl(`api/ChucNangDangTinTuyenDungCompany/UpdateJobPost/${id}`),jobData);

            console.log('Update response status:', respone.status);
            if (respone.status === 200) {
                setMessage({
                    type: 'success',
                    message: 'Cập nhật bài đăng thành công.'
                });
            }
            setIsLoadingUpdate(false);
            window.scroll(0,0);
            setTimeout(() => {
                navigate('/company/job-postings');
            }, 2000);
           
        } catch (error) {
            console.error('Error updating job post:', error);
            setMessage({
                type: 'danger',
                message: 'Không thể cập nhật bài đăng. Vui lòng thử lại.'
            });
            setIsLoadingUpdate(false);
             window.scroll(0,0);
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
        return isLoading || isLoadingCompany || isLoadingJobPost;
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
            <div style={{ marginTop: '76px', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
                            <Container className=" py-4" >
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
                                                    📋 Sửa tin tuyển dụng
                                                </h1>
                                                <p className="lead text-muted mb-0">
                                                    Sửa tin tuyển dụng
                                                </p>
                                            </div>
                                            <div className="text-end">
            
                                                <Button variant="outline-primary" as={Link} to="/company/job-postings">
                                                    ← Quay về Trang quản lý tin tuyển dụng
                                                </Button>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <Card>
                                            <Card.Body>
                                                <Card.Title>Edit Job</Card.Title>
                                               
                                                <Form>
                                                    <Row>
                                                        <Col md={6}>
                                                            <Form.Group className="mb-3">
                                                                <Form.Label className="fw-semibold">
                                                                    📝 Tiêu đề <span className="text-danger">*</span>
                                                                </Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="TieuDe"  // ✅ Thêm name
                                                                    placeholder="Nhập tiêu đề tin tuyển dụng"
                                                                    value={jobData.TieuDe}
                                                                    onChange={handleChange}
                                                                    isInvalid={!!errors.TieuDe}
                                                                />
                                                                <Form.Control.Feedback type="invalid">
                                                                    {errors.TieuDe}
                                                                </Form.Control.Feedback>
                                                            </Form.Group>
                                                        </Col>
            
                                                        <Col md={6}>
                                                            <Form.Group className="mb-3">
                                                                <Form.Label className="fw-semibold">
                                                                    📍 Vị trí làm việc <span className="text-danger">*</span>
                                                                </Form.Label>
                                                                <Form.Select
                                                                    name="IdLocation"  // ✅ Thêm name
                                                                    value={jobData.IdLocation}
                                                                    onChange={handleChange}
                                                                    isInvalid={!!errors.IdLocation}
                                                                >
                                                                   
                                                                    {locationOptions.map((location) => (
                                                                        <option key={location.id} value={location.idLocation}>
                                                                            {location.tenVitri}
                                                                        </option>
                                                                    ))}
                                                                </Form.Select>
                                                                <Form.Control.Feedback type="invalid">
                                                                    {errors.IdLocation}
                                                                </Form.Control.Feedback>
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
            
                                                    <Row>
                                                        <Col md={3}>
                                                            <Form.Group className="mb-3">
                                                                <Form.Label className="fw-semibold">
                                                                    💰 Mức lương (VND) <span className="text-danger">*</span>
                                                                </Form.Label>
                                                                <Form.Control
                                                                    type="number"
                                                                    name="Salary"  // ✅ Thêm name
                                                                    placeholder="Nhập mức lương"
                                                                    value={jobData.Salary}
                                                                    onChange={handleChange}
                                                                    isInvalid={!!errors.Salary}
                                                                />
                                                                <Form.Control.Feedback type="invalid">
                                                                    {errors.Salary}
                                                                </Form.Control.Feedback>
                                                            </Form.Group>
                                                        </Col>
            
                                                        <Col md={3}>
                                                            <Form.Group className="mb-3">
                                                                <Form.Label className="fw-semibold">
                                                                    👥 Số lượng tuyển <span className="text-danger">*</span>
                                                                </Form.Label>
                                                                <Form.Control
                                                                    type="number"
                                                                    name="SoLuong"  // ✅ Thêm name
                                                                    placeholder="Số lượng"
                                                                    value={jobData.SoLuong}
                                                                    onChange={handleChange}
                                                                    isInvalid={!!errors.SoLuong}
                                                                    min="1"
                                                                />
                                                                <Form.Control.Feedback type="invalid">
                                                                    {errors.SoLuong}
                                                                </Form.Control.Feedback>
                                                            </Form.Group>
                                                        </Col>
            
                                                        <Col md={3}>
                                                            <Form.Group className="mb-3">
                                                                <Form.Label className="fw-semibold">
                                                                    📅 Hạn nộp <span className="text-danger">*</span>
                                                                </Form.Label>
                                                                <Form.Control
                                                                    type="date"
                                                                    name="HanNop"  // ✅ Thêm name
                                                                    value={jobData.HanNop}
                                                                    onChange={handleChange}
                                                                    isInvalid={!!errors.HanNop}
                                                                    min={new Date().toISOString().split('T')[0]} // Không cho chọn ngày quá khứ
                                                                />
                                                                <Form.Control.Feedback type="invalid">
                                                                    {errors.HanNop}
                                                                </Form.Control.Feedback>
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md={3}>
                                                            <Form.Group>
                                                                <Form.Label>
                                                                    thời gian thực tập
                                                                </Form.Label>
                                                                <Form.Control
                                                                    type="number"
                                                                    name="Thoigian"
                                                                    value={parseInt(jobData.Thoigian) || ''}
                                                                    onChange={handleChange}
                                                                    isInvalid={!!errors.Thoigian}
                                                                    min="1"
                                                                />
                                                                <Form.Control.Feedback type="invalid">
                                                                    {errors.Thoigian}
                                                                </Form.Control.Feedback>
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
            
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="fw-semibold">
                                                            📄 Mô tả công việc <span className="text-danger">*</span>
                                                        </Form.Label>
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={4}
                                                            name="MoTa"  // ✅ Thêm name
                                                            placeholder="Nhập mô tả chi tiết về công việc, nhiệm vụ..."
                                                            value={jobData.MoTa}
                                                            onChange={handleChange}
                                                            isInvalid={!!errors.MoTa}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.MoTa}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
            
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="fw-semibold">
                                                            ✅ Yêu cầu công việc <span className="text-danger">*</span>
                                                        </Form.Label>
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={4}
                                                            name="YeuCau"  // ✅ Thêm name
                                                            placeholder="Nhập các yêu cầu về kỹ năng, kinh nghiệm..."
                                                            value={jobData.YeuCau}
                                                            onChange={handleChange}
                                                            isInvalid={!!errors.YeuCau}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.YeuCau}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
            
                                                    <Form.Group className="mb-4">
                                                        <Form.Label className="fw-semibold">
                                                            🎁 Quyền lợi <span className="text-danger">*</span>
                                                        </Form.Label>
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={4}
                                                            name="Benefits"  // ✅ Thêm name
                                                            placeholder="Nhập các quyền lợi, phúc lợi cho ứng viên..."
                                                            value={jobData.Benefits}
                                                            onChange={handleChange}
                                                            isInvalid={!!errors.Benefits}
                                                        />
                                                        <Form.Control.Feedback type="invalid">
                                                            {errors.Benefits}
                                                        </Form.Control.Feedback>
                                                    </Form.Group>
            
                                                    <div className="d-flex gap-3 justify-content-end">
                                                        <Button
                                                            variant="outline-secondary"
                                                            as={Link}
                                                            to="/company/job-postings"
                                                        >
                                                            ❌ Hủy bỏ
                                                        </Button>
                                                        <Button
                                                            variant="primary"
                                                            onClick={handleSubmit}
                                                            disabled={isLoadingUpdate}
                                                        >
                                                            {isLoadingUpdate ? (
                                                                <>
                                                                    <Spinner animation="border" size="sm" className="me-2" />
                                                                    Đang cập nhật...
                                                                </>
                                                            ) : (
                                                                '✅ Cập nhật tin tuyển dụng'
                                                            )}
                                                        </Button>
                                                    </div>
                                                </Form>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            </Container>
                        </div>
            

        </>
    );

}
export default EditJobPostCompany;