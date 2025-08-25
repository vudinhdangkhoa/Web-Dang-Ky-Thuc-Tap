import React, { useState,useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert,
  InputGroup
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import  Enum from '../../dungchung/enum';
import axios from 'axios';
const apiConfig = new Enum();

function DangNhap() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  
  const navigate = useNavigate();

  // Xử lý thay đổi input
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

  // Validate form
  const validateForm = () => {
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
    } 

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setAlert(null);

    try {
        console.log(apiConfig.getUrl('api/DangNhap/DangNhap'))
        console.log(formData);
      const response = await axios.post(apiConfig.getUrl('api/DangNhap/DangNhap'), formData);

      console.log('response login data:', response.data);

      if (response.status==200) {
       
        setAlert({
          type: 'success',
          message: response.data.message || 'Đăng nhập thành công! Đang chuyển hướng...'
        });
        // Lưu thông tin đăng nhập vào localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('role', response.data.role);
        
        
        setTimeout(() => {
          // Chuyển hướng dựa trên role
          if (response.data.role === Enum.student) {
            navigate('/student/home');
          } else if (response.data.role === Enum.company) {
            navigate('/company/home');
          } else if (response.data.role === Enum.admin) {
            navigate('/admin/home');
          } else {
            navigate('/');
          }
        }, 1500);
      } else {
        setAlert({
          type: 'danger',
          message: 'Email hoặc mật khẩu không chính xác'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      setAlert({
        type: 'danger',
        message: error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
      });
    } finally {
      // setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            <div className="text-center mb-4">
              <Link to="/" className="text-decoration-none">
                <h2 className="text-primary fw-bold">IT Internship Portal</h2>
              </Link>
              <p className="text-muted">Đăng nhập vào tài khoản của bạn</p>
            </div>

            <Card className="shadow-sm border-0">
              <Card.Body className="p-4">
                <h3 className="text-center mb-4">Đăng Nhập</h3>

                {alert && (
                  <Alert variant={alert.type} className="mb-3">
                    {alert.message}
                  </Alert>
                )}
                
                <Form onSubmit={handleSubmit}>
                  {/* Email Input */}
                  <Form.Group className="mb-3">
                    <Form.Label className="text-start fw-bold w-100 mb-2">Email <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Nhập địa chỉ email"
                      isInvalid={!!errors.email}
                      disabled={isLoading}
                      className="from-control-lg rounded"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Password Input */}
                  <Form.Group className="mb-3">
                    <Form.Label className="text-start fw-bold w-100 mb-2">Mật khẩu <span className="text-danger">*</span></Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Nhập mật khẩu"
                        isInvalid={!!errors.password}
                        disabled={isLoading}
                        className="from-control-lg rounded"
                      />
                      <Button
                        variant="outline-secondary"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? '👁️' : '🙈'}
                      </Button>
                    </InputGroup>
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Remember & Forgot Password */}
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <Form.Check 
                      type="checkbox" 
                      label="Ghi nhớ đăng nhập"
                      disabled={isLoading}
                    />
                    <Link 
                      to="/quen-mat-khau" 
                      className="text-decoration-none small"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <div className="d-grid">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Đang đăng nhập...
                        </>
                      ) : (
                        'Đăng Nhập'
                      )}
                    </Button>
                  </div>
                </Form>

                {/* Sign Up Link */}
                <div className="text-center mt-4">
                  <p className="mb-0">
                    Chưa có tài khoản?{' '}
                    <Link to="/dang-ky" className="text-decoration-none fw-bold">
                      Đăng ký ngay
                    </Link>
                  </p>
                </div>

                {/* Demo Credentials
                <div className="mt-4 p-3 bg-light rounded">
                  <small className="text-muted">
                    <strong>Demo:</strong><br />
                    Email: admin@example.com<br />
                    Mật khẩu: 123456
                  </small>
                </div> */}
              </Card.Body>
            </Card>

            {/* Back to Home */}
            <div className="text-center mt-3">
              <Link to="/" className="text-decoration-none">
                ← Quay về trang chủ
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default DangNhap;
