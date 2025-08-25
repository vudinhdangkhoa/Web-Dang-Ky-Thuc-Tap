import React from "react";
import axiosInstance from "../../dungchung/axiosConfig";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Enum from '../../dungchung/enum'
import { Button, Form, Modal, Table, Toast, ToastContainer, Badge,Spinner } from "react-bootstrap"; // ✅ Bỏ ModalTitle

const apiRoute = new Enum();

function DonDangKy() {
    const [user, setUser] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [messageError, setMessageError] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [lstDonDangKy, setLstDonDangKy] = useState([]);

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
                GetAllDonUngTuyen(userId);
            }
        } catch (error) {
            console.error('Invalid token:', error);
            navigate('/dang-nhap');
            return;
        }
    }, [navigate]);

    const GetAllDonUngTuyen = async (userId) => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(
                apiRoute.getUrl(`api/ChucNangStudent/GetAllDonUngTuyen/${userId}`)
            );

            if (response.status === 200) {
                setLstDonDangKy([]);

                if (response.data.length > 0) {
                    setLstDonDangKy(response.data);
                    console.log('📋 Applications data:', response.data);
                } else {
                    console.log('⚠️ No applications found');
                }
            }
        } catch (error) {
            console.error('❌ Error fetching applications:', error);
            setMessageError('Không thể tải danh sách đơn đăng ký');
            setToastMessage('Có lỗi xảy ra khi tải dữ liệu');
            setShowToast(true);
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Helper function để format ngày
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('vi-VN');
        } catch {
            return dateString;
        }
    };

    // ✅ Helper function để format trạng thái
    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
            case 'chờ duyệt':
                return <Badge bg="warning">⏳ Chờ duyệt</Badge>;
            case 'approved':
            case 'đã duyệt':
                return <Badge bg="success">✅ Đã duyệt</Badge>;
            case 'rejected':
            case 'từ chối':
                return <Badge bg="danger">❌ Từ chối</Badge>;
            default:
                return <Badge bg="secondary">{status || 'N/A'}</Badge>;
        }
    };

    if (isLoading) {
         return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Đang tải...</span>
      </div>);
    }

    return (
        <>
            <div className="container mt-5">
                <h1>📝 Đơn Đăng Ký Thực Tập</h1>

                {/* ✅ Error message */}
                {messageError && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        {messageError}
                        <button 
                            type="button" 
                            className="btn-close" 
                            onClick={() => setMessageError("")}
                        ></button>
                    </div>
                )}

                {/* ✅ Sửa Table với cú pháp đúng */}
                <Table striped bordered hover responsive>
                    <thead className="table-dark">
                        <tr>
                            <th>STT</th>
                            <th>Công ty</th>
                            <th>Tiêu đề</th>
                            <th>CV ứng tuyển</th>
                            <th>Ngày nộp</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lstDonDangKy.length > 0 ? (
                            lstDonDangKy.map((item, index) => (
                                <tr key={item.id || index}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <strong>{item.tenCongTy || 'N/A'}</strong>
                                    </td>
                                    <td>{item.tieuDe || 'N/A'}</td>
                                    <td>
                                        <span className="text-primary">📄 {item.tenCv || 'N/A'}</span>
                                    </td>
                                    <td>{formatDate(item.appliedAt)}</td>
                                    <td>{getStatusBadge(item.status)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center text-muted py-4">
                                    <div>
                                        <h5>📂 Chưa có đơn đăng ký nào</h5>
                                        <p className="mb-0">Hãy tìm kiếm và ứng tuyển các vị trí thực tập phù hợp!</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
                <Button onClick={() => navigate('/student/home')} className="w-3 mb-3 float-start">
                    Về trang chủ
                </Button>
            </div>

            {/* ✅ Toast notifications */}
            <ToastContainer position="top-end" className="p-3">
                <Toast 
                    show={showToast} 
                    onClose={() => setShowToast(false)}
                    bg="danger"
                    delay={4000}
                    autohide
                >
                    <Toast.Header>
                        <strong className="me-auto">❌ Lỗi</strong>
                        <small>just now</small>
                    </Toast.Header>
                    <Toast.Body className="text-white">
                        {toastMessage}
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
}

export default DonDangKy;