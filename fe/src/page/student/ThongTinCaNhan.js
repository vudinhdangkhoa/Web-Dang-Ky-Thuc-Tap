import React from "react";
import { Card, Col, Row, Form, Button, Modal,Toast,ToastContainer   } from "react-bootstrap" // Function riêng để gọi API trực tiếp với userId
   
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';
import Enum from '../../dungchung/enum'
import axiosInstance from '../../dungchung/axiosConfig';
const apiRoute = new Enum();


function ThongTinCaNhan() {
    const [user, setUser] = useState(null);
    const [studentInfo, setStudentInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');


    const navigate = useNavigate();


    useEffect(() => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('role');
        const userId = localStorage.getItem('userId');

        if (!token || userRole !== Enum.student) {
            navigate('/dang-nhap');
            return;
        }

        try {
            setUser({
                id: userId,
                role: userRole
            });
            
            // Gọi API sau khi đã set user
            if (userId) {
                GetStudentByIdDirect(userId);
            }
        } catch (error) {
            console.error('Invalid token:', error);
            navigate('/dang-nhap');
            return;
        }
    }, [navigate]);
    

    

    // Xử lý chỉnh sửa thông tin
    const handleEdit = () => {
        setFormData({
            name: studentInfo.name || '',
            phone: studentInfo.phone || '',
            address: studentInfo.address || '',
            ngaySinh: studentInfo.ngaySinh ? studentInfo.ngaySinh.split('T')[0] : '',
            gioiTinh: studentInfo.gioiTinh || '',
            nganh: studentInfo.nganh || '',
            truongHoc: studentInfo.truongHoc || ''
        });
        setIsEditing(true);
    };

    // Xử lý hủy chỉnh sửa
    const handleCancel = () => {
        setIsEditing(false);
        setFormData({});
    };

    // Xử lý thay đổi input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    // Hiển thị thông báo
    const showNotification = (message, type = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
        
        // Tự động ẩn sau 5 giây
        setTimeout(() => {
            setShowToast(false);
        }, 5000);
    };


    // Xử lý submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            console.log("Submitting form data:", formData);
            const response = await axiosInstance.put(
                apiRoute.getUrl(`api/AccountStudent/UpdateStudent/${user.id}`), 
                formData
            );
            
            if (response.status === 200) {
                console.log("Cập nhật thành công");
                setStudentInfo({...studentInfo, ...formData});
                setIsEditing(false);
                showNotification("Cập nhật thông tin thành công! ✅", "success");
            }
            
        } catch (error) {
            console.error("Lỗi khi cập nhật thông tin:", error);
            setLoading(false);
            showNotification("Có lỗi xảy ra khi cập nhật thông tin! ❌", "danger");
              
        } finally {
           setLoading(false);
        }
    };

    // Xử lý upload avatar
    const handleAvatarUpload = async () => {
        if (!selectedFile) return;

        try {
            setUploading(true);
            const formDataUpload = new FormData();
            formDataUpload.append('avatar', selectedFile);

            const response = await axiosInstance.put(
                apiRoute.getUrl(`api/AccountStudent/UpdateAvatar/${user.id}`),
                formDataUpload,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.status === 200) {
                console.log("Upload avatar thành công");
                setStudentInfo({...studentInfo, avatar: response.data.avatar});
                setShowAvatarModal(false);
                setSelectedFile(null);
                GetStudentById();
               showNotification("Cập nhật avatar thành công! 📸", "success");
            }
        } catch (error) {
            console.error("Lỗi khi upload avatar:", error);
            showNotification("Có lỗi xảy ra khi upload avatar! ❌", "danger");
        } finally {
            setUploading(false);
        }
    };


    const GetStudentById = async () => {
        if (!user || !user.id) {
            console.log('User ID không tồn tại');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            // Sửa endpoint spelling: AccountStudent thay vì AcountStudent
            const response = await axiosInstance.get(apiRoute.getUrl(`api/AccountStudent/GetStudentById/${user.id}`));
            if (response.status === 200) {
                console.log("Thông tin sinh viên:", response.data);
                setStudentInfo(response.data);
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin sinh viên:", error);
            setStudentInfo(null);
        } finally {
            setLoading(false);
        }
    }

    // Function riêng để gọi API trực tiếp với userId
    const GetStudentByIdDirect = async (userId) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(apiRoute.getUrl(`api/AccountStudent/GetStudentById/${userId}`));
            if (response.status === 200) {
                console.log("Thông tin sinh viên:", response.data);
                setStudentInfo(response.data);
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin sinh viên:", error);
            setStudentInfo(null);
        } finally {
            setLoading(false);
        }
    }


    return (
        <>
        <div className="container mt-5">
            <h2 className="mb-4 text-primary">Thông Tin Cá Nhân</h2>
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-2">Đang tải thông tin...</p>
                </div>
            ) : studentInfo ? (
                <Card className="shadow-sm">
                    <Card.Body>
                        <Row>
                            <Col md={4} className="text-center">
                                {/* Kiểm tra avatar có null không */}
                                {studentInfo.avatar ? (
                                    <img 
                                        src={studentInfo.avatar.startsWith('http') ? studentInfo.avatar : apiRoute.getUrl(studentInfo.avatar)}
                                        alt="Avatar" 
                                        className="img-fluid rounded-circle mb-3"
                                        style={{ 
                                            width: '200px', 
                                            height: '200px', 
                                            objectFit: 'cover',
                                            border: '4px solid #0d6efd'
                                        }}
                                        onError={(e) => {
                                            // Fallback khi ảnh load lỗi
                                            e.target.src = 'https://via.placeholder.com/200x200/0d6efd/ffffff?text=👤';
                                            e.target.onerror = null;
                                        }}
                                    />
                                ) : (
                                    // Ảnh mặc định khi avatar null
                                    <div 
                                        className="d-flex align-items-center justify-content-center bg-light rounded-circle mb-3 mx-auto"
                                        style={{ 
                                            width: '200px', 
                                            height: '200px', 
                                            fontSize: '4rem',
                                            border: '4px solid #0d6efd',
                                            color: '#0d6efd'
                                        }}
                                    >
                                        👤
                                    </div>
                                )}
                                <h4 className="text-primary">{studentInfo.name}</h4>
                                <p className="text-muted">{studentInfo.nganh}</p>
                            </Col>
                            <Col md={8}>
                                <h5 className="mb-3 text-secondary">
                                    {isEditing ? "Chỉnh sửa thông tin" : "Thông tin chi tiết"}
                                </h5>
                                
                                {isEditing ? (
                                    // Form chỉnh sửa
                                    <Form onSubmit={handleSubmit}>
                                        <Row className="mb-3">
                                            <Col sm={4}><Form.Label><strong>📝 Họ và tên:</strong></Form.Label></Col>
                                            <Col sm={8}>
                                                <Form.Control
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </Col>
                                        </Row>
                                        
                                        <Row className="mb-3">
                                            <Col sm={4}><Form.Label><strong>📱 Số điện thoại:</strong></Form.Label></Col>
                                            <Col sm={8}>
                                                <Form.Control
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                />
                                            </Col>
                                        </Row>
                                        
                                        <Row className="mb-3">
                                            <Col sm={4}><Form.Label><strong>🏠 Địa chỉ:</strong></Form.Label></Col>
                                            <Col sm={8}>
                                                <Form.Control
                                                    as="textarea"
                                                    rows={2}
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                />
                                            </Col>
                                        </Row>
                                        
                                        <Row className="mb-3">
                                            <Col sm={4}><Form.Label><strong>🎂 Ngày sinh:</strong></Form.Label></Col>
                                            <Col sm={8}>
                                                <Form.Control
                                                    type="date"
                                                    name="ngaySinh"
                                                    value={formData.ngaySinh}
                                                    onChange={handleInputChange}
                                                />
                                            </Col>
                                        </Row>
                                        
                                        <Row className="mb-3">
                                            <Col sm={4}><Form.Label><strong>👤 Giới tính:</strong></Form.Label></Col>
                                            <Col sm={8}>
                                                <Form.Select
                                                    name="gioiTinh"
                                                    value={formData.gioiTinh}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="">Chọn giới tính</option>
                                                    <option value="Nam">Nam</option>
                                                    <option value="Nữ">Nữ</option>
                                                </Form.Select>
                                            </Col>
                                        </Row>
                                        
                                        <Row className="mb-3">
                                            <Col sm={4}><Form.Label><strong>📚 Ngành học:</strong></Form.Label></Col>
                                            <Col sm={8}>
                                                <Form.Control
                                                    type="text"
                                                    name="nganh"
                                                    value={formData.nganh}
                                                    onChange={handleInputChange}
                                                />
                                            </Col>
                                        </Row>
                                        
                                        <Row className="mb-3">
                                            <Col sm={4}><Form.Label><strong>🏫 Trường học:</strong></Form.Label></Col>
                                            <Col sm={8}>
                                                <Form.Control
                                                    type="text"
                                                    name="truongHoc"
                                                    value={formData.truongHoc}
                                                    onChange={handleInputChange}
                                                />
                                            </Col>
                                        </Row>
                                        
                                        <div className="mt-4">
                                            <Button type="submit" variant="success" className="me-2" disabled={loading}>
                                                {loading ? "Đang lưu..." : "💾 Lưu thay đổi"}
                                            </Button>
                                            <Button variant="secondary" onClick={handleCancel}>
                                                ❌ Hủy
                                            </Button>
                                        </div>
                                    </Form>
                                ) : (
                                    // Hiển thị thông tin
                                    <>
                                        <Row className="mb-3">
                                            <Col sm={4}><strong>📧 Email:</strong></Col>
                                            <Col sm={8}>{studentInfo.email || 'Chưa cập nhật'}</Col>
                                        </Row>
                                        
                                        <Row className="mb-3">
                                            <Col sm={4}><strong>📱 Số điện thoại:</strong></Col>
                                            <Col sm={8}>{studentInfo.phone || 'Chưa cập nhật'}</Col>
                                        </Row>
                                        
                                        <Row className="mb-3">
                                            <Col sm={4}><strong>🏠 Địa chỉ:</strong></Col>
                                            <Col sm={8}>{studentInfo.address || 'Chưa cập nhật'}</Col>
                                        </Row>
                                        
                                        <Row className="mb-3">
                                            <Col sm={4}><strong>🎂 Ngày sinh:</strong></Col>
                                            <Col sm={8}>
                                                {studentInfo.ngaySinh ? 
                                                    new Date(studentInfo.ngaySinh).toLocaleDateString('vi-VN') : 
                                                    'Chưa cập nhật'
                                                }
                                            </Col>
                                        </Row>
                                        
                                        <Row className="mb-3">
                                            <Col sm={4}><strong>👤 Giới tính:</strong></Col>
                                            <Col sm={8}>{studentInfo.gioiTinh || 'Chưa cập nhật'}</Col>
                                        </Row>
                                        
                                        <Row className="mb-3">
                                            <Col sm={4}><strong>📚 Ngành học:</strong></Col>
                                            <Col sm={8}>{studentInfo.nganh || 'Chưa cập nhật'}</Col>
                                        </Row>
                                        
                                        <Row className="mb-3">
                                            <Col sm={4}><strong>🏫 Trường học:</strong></Col>
                                            <Col sm={8}>{studentInfo.truongHoc || 'Chưa cập nhật'}</Col>
                                        </Row>
                                        
                                        <div className="mt-4">
                                            <Button variant="primary" className="me-2" onClick={handleEdit}>
                                                ✏️ Chỉnh sửa thông tin
                                            </Button>
                                            <Button variant="outline-secondary" onClick={() => setShowAvatarModal(true)}>
                                                🔄 Cập nhật avatar
                                            </Button>
                                            <Button variant="outline-secondary" onClick={() => navigate('/student/home')}>
                                                trở về trang chủ
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            ) : (
                <div className="text-center py-5">
                    <div className="mb-3">
                        <span style={{ fontSize: '4rem' }}>😔</span>
                    </div>
                    <h4 className="text-muted">Không tìm thấy thông tin sinh viên</h4>
                    <p className="text-muted">Vui lòng thử lại sau hoặc liên hệ admin</p>
                    <button 
                        className="btn btn-primary"
                        onClick={() => GetStudentByIdDirect(localStorage.getItem('userId'))}
                    >
                        🔄 Thử lại
                    </button>
                </div>
            )}
        </div>

        {/* Modal cập nhật avatar */}
        <Modal show={showAvatarModal} onHide={() => setShowAvatarModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>🔄 Cập nhật Avatar</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Chọn ảnh mới:</Form.Label>
                        <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                        />
                    </Form.Group>
                    
                    {selectedFile && (
                        <div className="text-center">
                            <img
                                src={URL.createObjectURL(selectedFile)}
                                alt="Preview"
                                className="img-fluid rounded-circle"
                                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                            />
                            <p className="mt-2 text-muted">Preview ảnh mới</p>
                        </div>
                    )}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowAvatarModal(false)}>
                    Hủy
                </Button>
                <Button 
                    variant="primary" 
                    onClick={handleAvatarUpload}
                    disabled={!selectedFile || uploading}
                >
                    {uploading ? "Đang tải lên..." : "📤 Tải lên"}
                </Button>
            </Modal.Footer>
        </Modal>
         {/* ✅ Toast Container cho notifications */}
        <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
            <Toast
                show={showToast}
                onClose={() => setShowToast(false)}
                bg={toastType}
                delay={5000}
                autohide
            >
                <Toast.Header>
                    <strong className="me-auto">
                        {toastType === 'success' ? '✅ Thành công' : 
                         toastType === 'danger' ? '❌ Lỗi' :
                         toastType === 'warning' ? '⚠️ Cảnh báo' : 'ℹ️ Thông báo'}
                    </strong>
                    <small>just now</small>
                </Toast.Header>
                <Toast.Body className={toastType === 'success' || toastType === 'danger' ? 'text-white' : ''}>
                    {toastMessage}
                </Toast.Body>
            </Toast>
        </ToastContainer>
        </>
    );


}
export default ThongTinCaNhan;