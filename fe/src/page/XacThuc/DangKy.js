import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
  Alert,
  Modal,
  Spinner
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Enum from '../../dungchung/enum';
import axiosInstance from '../../dungchung/axiosConfig';

const apiConfig = new Enum();

function DangKy() {
  // State cho form chính
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Student'
  });

  // State cho form chi tiết
  const [detailData, setDetailData] = useState({
    // Student fields
    name: '',
    phone: '',
    address: '',
    ngaySinh: '',
    gioiTinh: '',
    truongHoc: '',
    nganh: '',
    avatar: null,

    // Company fields
    ten: '',
    maSoThue: '',
    nguoiChiuTrachNhiemPhapLy: '',
    website: '',
    diaChi: '',
    moTa: '',
    logo: null
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);

  const navigate = useNavigate();

  

  // Load danh sách tỉnh thành từ API
  useEffect(() => {
    if (formData.role === 'Company') {
      loadProvinces();
    }
  }, [formData.role]);

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

  // Xử lý thay đổi input form chính
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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

  // Xử lý thay đổi input form chi tiết
  const handleDetailChange = (e) => {
    const { name, value, type, files } = e.target;
    setDetailData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));

    // Xóa lỗi khi user bắt đầu nhập
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form chính
  const validateMainForm = () => {
    const newErrors = {};

    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate form chi tiết
  const validateDetailForm = () => {
    const newErrors = {};

    if (formData.role === 'Student') {
      if (!detailData.name) newErrors.name = 'Tên không được để trống';
      if (!detailData.phone) newErrors.phone = 'Số điện thoại không được để trống';
      if (!detailData.ngaySinh) newErrors.ngaySinh = 'Ngày sinh không được để trống';
      if (!detailData.gioiTinh) newErrors.gioiTinh = 'Vui lòng chọn giới tính';
      if (!detailData.truongHoc) newErrors.truongHoc = 'Trường học không được để trống';
      if (!detailData.nganh) newErrors.nganh = 'Vui lòng chọn ngành học';
    } else if (formData.role === 'Company') {
      if (!detailData.ten) newErrors.ten = 'Tên công ty không được để trống';
      if (!detailData.maSoThue) newErrors.maSoThue = 'Mã số thuế không được để trống';
      if (!detailData.nguoiChiuTrachNhiemPhapLy) newErrors.nguoiChiuTrachNhiemPhapLy = 'Người chịu trách nhiệm pháp lý không được để trống';
      if (!detailData.phone) newErrors.phone = 'Số điện thoại không được để trống';
      if (!detailData.diaChi) newErrors.diaChi = 'Vui lòng chọn địa chỉ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý submit form chính (mở popup chi tiết)
  const handleMainSubmit = (e) => {
    e.preventDefault();
    
    if (!validateMainForm()) {
      return;
    }

    setShowDetailModal(true);
  };

  // Xử lý submit cuối cùng (đăng ký tài khoản)
  const handleFinalSubmit = async () => {
    if (!validateDetailForm()) {
      return;
    }

    setIsLoading(true);
    setAlert(null);

    try {
      // Tạo FormData để gửi file
      const submitData = new FormData();
      
      // Thêm thông tin chung
      submitData.append('email', formData.email);
      submitData.append('password', formData.password);
      submitData.append('roleId', formData.role === 'Student' ? 1 : 2);

      // Thêm thông tin chi tiết theo role
      if (formData.role === 'Student') {
        submitData.append('name', detailData.name);
        submitData.append('phone', detailData.phone);
        submitData.append('address', detailData.address);
         const formattedDate = new Date(detailData.ngaySinh).toISOString().split('T')[0];
    submitData.append('ngaySinh', formattedDate);
        submitData.append('gioiTinh', detailData.gioiTinh);
        submitData.append('truongHoc', detailData.truongHoc);
        submitData.append('nganh', detailData.nganh);
        if (detailData.avatar) {
          submitData.append('avatar', detailData.avatar);
        }
      } else {
        submitData.append('ten', detailData.ten);
        submitData.append('maSoThue', detailData.maSoThue);
        submitData.append('nguoiChiuTrachNhiemPhapLy', detailData.nguoiChiuTrachNhiemPhapLy);
        submitData.append('website', detailData.website);
        submitData.append('diaChi', detailData.diaChi);
        submitData.append('phone', detailData.phone);
        submitData.append('moTa', detailData.moTa);
        if (detailData.logo) {
          submitData.append('logo', detailData.logo);
        }
      }

      const endpoint = formData.role === 'Student' 
        ? 'api/DangKy/DangKyStudent' 
        : 'api/DangKy/DangKyCompany';
      console.log(submitData)
      for(let [key,value] of submitData.entries()) {
        console.log(key, value);
      }
      console.log('Endpoint:', apiConfig.getUrl(endpoint));
      const response = await axios.post(apiConfig.getUrl(endpoint), submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200) {
        setAlert({
          type: 'success',
          message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.'
        });
        
        setTimeout(() => {
          navigate('/dang-nhap');
        }, 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
     
  console.error('Error response:', error.response?.data);
  console.error('Error status:', error.response?.status);
      setAlert({
        type: 'danger',
        message: error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid className="d-flex align-items-center justify-content-center min-vh-100" 
             style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary mb-2">Đăng Ký Tài Khoản</h2>
                <p className="text-muted">Tạo tài khoản mới để bắt đầu</p>
              </div>

              {alert && (
                <Alert variant={alert.type} className="mb-4">
                  {alert.message}
                </Alert>
              )}

              <Form onSubmit={handleMainSubmit}>
                {/* Email */}
                <Form.Group className="mb-3">
                  <Form.Label className='text-start fw-bold w-100 mb-2'>Email <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    isInvalid={!!errors.email}
                    placeholder="Nhập email của bạn"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Password */}
                <Form.Group className="mb-3">
                  <Form.Label className='text-start fw-bold w-100 mb-2'>Mật khẩu <span className="text-danger">*</span></Form.Label>
                  <InputGroup hasValidation>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      isInvalid={!!errors.password}
                      placeholder="Nhập mật khẩu"
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </Button>
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                {/* Confirm Password */}
                <Form.Group className="mb-3">
                  <Form.Label className='text-start fw-bold w-100 mb-2'>Xác nhận mật khẩu <span className="text-danger">*</span></Form.Label>
                  <InputGroup hasValidation>
                    <Form.Control
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      isInvalid={!!errors.confirmPassword}
                      placeholder="Nhập lại mật khẩu"
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </Button>
                    <Form.Control.Feedback type="invalid">
                      {errors.confirmPassword}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                {/* Role Selection */}
                <Form.Group className="mb-4">
                  <Form.Label className='text-start fw-bold w-100 mb-2'>Vai trò đăng ký <span className="text-danger">*</span></Form.Label>
                  <div className="d-flex gap-3 mt-2">
                    <Form.Check
                      type="radio"
                      id="student"
                      name="role"
                      value="Student"
                      checked={formData.role === 'Student'}
                      onChange={handleChange}
                      label={
                        <div className="d-flex align-items-center">
                          <span className="me-2">👤</span>
                          Sinh viên
                        </div>
                      }
                    />
                    <Form.Check
                      type="radio"
                      id="company"
                      name="role"
                      value="Company"
                      checked={formData.role === 'Company'}
                      onChange={handleChange}
                      label={
                        <div className="d-flex align-items-center">
                          <span className="me-2">🏢</span>
                          Công ty
                        </div>
                      }
                    />
                  </div>
                </Form.Group>

                {/* Submit Button */}
                <Button
                  variant="primary"
                  type="submit"
                  size="lg"
                  className="w-100 mb-3"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    'Tiếp theo'
                  )}
                </Button>

                <div className="text-center">
                  <span className="text-muted">Đã có tài khoản? </span>
                  <Link to="/dang-nhap" className="text-decoration-none">
                    Đăng nhập ngay
                  </Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal chi tiết */}
      <Modal 
        show={showDetailModal} 
        onHide={() => setShowDetailModal(false)}
        size="lg"
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {formData.role === 'Student' ? 'Thông tin sinh viên' : 'Thông tin công ty'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formData.role === 'Student' ? (
            // Form thông tin sinh viên
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Họ và tên <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={detailData.name}
                    onChange={handleDetailChange}
                    isInvalid={!!errors.name}
                    placeholder="Nhập họ và tên"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={detailData.phone}
                    onChange={handleDetailChange}
                    isInvalid={!!errors.phone}
                    placeholder="Nhập số điện thoại"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.phone}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày sinh <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="ngaySinh"
                    value={detailData.ngaySinh}
                    onChange={handleDetailChange}
                    isInvalid={!!errors.ngaySinh}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.ngaySinh}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giới tính <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="gioiTinh"
                    value={detailData.gioiTinh}
                    onChange={handleDetailChange}
                    isInvalid={!!errors.gioiTinh}
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.gioiTinh}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Trường học <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="truongHoc"
                    value={detailData.truongHoc}
                    onChange={handleDetailChange}
                    isInvalid={!!errors.truongHoc}
                    placeholder="Nhập tên trường học"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.truongHoc}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngành học <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="nganh"
                    value={detailData.nganh}
                    onChange={handleDetailChange}
                    isInvalid={!!errors.nganh}
                    placeholder="Nhập ngành học của bạn"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.nganh}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Địa chỉ</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="address"
                    value={detailData.address}
                    onChange={handleDetailChange}
                    placeholder="Nhập địa chỉ"
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Avatar</Form.Label>
                  <Form.Control
                    type="file"
                    name="avatar"
                    accept="image/*"
                    onChange={handleDetailChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          ) : (
            // Form thông tin công ty
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên công ty <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="ten"
                    value={detailData.ten}
                    onChange={handleDetailChange}
                    isInvalid={!!errors.ten}
                    placeholder="Nhập tên công ty"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.ten}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mã số thuế <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="maSoThue"
                    value={detailData.maSoThue}
                    onChange={handleDetailChange}
                    isInvalid={!!errors.maSoThue}
                    placeholder="Nhập mã số thuế"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.maSoThue}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Người chịu trách nhiệm pháp lý <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="nguoiChiuTrachNhiemPhapLy"
                    value={detailData.nguoiChiuTrachNhiemPhapLy}
                    onChange={handleDetailChange}
                    isInvalid={!!errors.nguoiChiuTrachNhiemPhapLy}
                    placeholder="Nhập tên người chịu trách nhiệm pháp lý"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.nguoiChiuTrachNhiemPhapLy}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={detailData.phone}
                    onChange={handleDetailChange}
                    isInvalid={!!errors.phone}
                    placeholder="Nhập số điện thoại"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.phone}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Website</Form.Label>
                  <Form.Control
                    type="url"
                    name="website"
                    value={detailData.website}
                    onChange={handleDetailChange}
                    placeholder="https://example.com"
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Địa chỉ <span className="text-danger">*</span></Form.Label>
                  {loadingProvinces ? (
                    <div className="text-center">
                      <Spinner animation="border" size="sm" />
                      <span className="ms-2">Đang tải danh sách tỉnh thành...</span>
                    </div>
                  ) : (
                    <Form.Select
                      name="diaChi"
                      value={detailData.diaChi}
                      onChange={handleDetailChange}
                      isInvalid={!!errors.diaChi}
                    >
                      <option value="">Chọn tỉnh/thành phố</option>
                      {provinces.map((province) => (
                        <option key={province.code} value={province.name}>
                          {province.name}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                  <Form.Control.Feedback type="invalid">
                    {errors.diaChi}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Mô tả công ty</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="moTa"
                    value={detailData.moTa}
                    onChange={handleDetailChange}
                    placeholder="Nhập mô tả về công ty"
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Logo công ty</Form.Label>
                  <Form.Control
                    type="file"
                    name="logo"
                    accept="image/*"
                    onChange={handleDetailChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowDetailModal(false)}
            disabled={isLoading}
          >
            Quay lại
          </Button>
          <Button 
            variant="primary" 
            onClick={handleFinalSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang đăng ký...
              </>
            ) : (
              'Hoàn tất đăng ký'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default DangKy;
