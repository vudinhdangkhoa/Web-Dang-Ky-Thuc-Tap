import React from "react";
import axiosInstance from "../../dungchung/axiosConfig";

import { useState, useEffect } from "react";

import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';
import Enum from '../../dungchung/enum'
import { Button, Form, Modal, ModalTitle, Table, Toast, ToastContainer,Spinner } from "react-bootstrap";
import { type } from "@testing-library/user-event/dist/type";

const apiRoute = new Enum();

function StudentProfile() {

    const [listCv, setListCv] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpLoading, setIsUpLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [student, setStudent] = useState(null);
    const [alert, setAlert] = useState(null);
    const [messageError, setMessageError] = useState(null);
    // modal addCV
    const [showAddCVModal, setShowAddCVModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [cvName, setCvName] = useState("");
    // modal updateCV
    const [showUpdateCVModal, setShowUpdateCVModal] = useState(false);
    const [cvNameUpdate, setCvNameUpdate] = useState("");
    const [cvIdUpdate, setCvIdUpdate] = useState(null);
    const navigate = useNavigate();

    const LayListCV = async (userId) => {

        try {
            setIsLoading(true);
            const response = await axiosInstance.get(apiRoute.getUrl(`api/ChucNangStudent/GetAllCVbyId/${userId}`))
            if (response.status === 200) {
                console.log("Danh sách CV:", response.data);
                if (response.data && response.data.length > 0) {
                    setListCv(response.data);
                   
                } else {
                    setListCv([]);
                    setMessageError("Không có dữ liệu CV.");
                   
                }
            }
            setIsLoading(false);

        } catch (error) {
            console.error("Lỗi khi lấy danh sách CV:", error);
            setAlert({
                type: "danger",
                message: "Không thể tải danh sách CV. Vui lòng thử lại."
            });
            setIsLoading(false);
        }


    }

    const GetStudentByIdDirect = async (userId) => {
        try {

            const response = await axiosInstance.get(apiRoute.getUrl(`api/AccountStudent/GetStudentById/${userId}`));
            if (response.status === 200) {
                console.log("Thông tin sinh viên:", response.data);
                setStudent(response.data);
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin sinh viên:", error);
            setStudent(null);
        } finally {

        }
    }

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
                LayListCV(userId);
                GetStudentByIdDirect(userId);
            }
        } catch (error) {
            console.error('Invalid token:', error);
            navigate('/dang-nhap');
            return;
        }
    }, []);

    useEffect(() => {
        if (alert) {
            const timer = setTimeout(() => {
                setAlert(null);
            }, 2500); // Tự động ẩn sau 2.5 giây

            return () => clearTimeout(timer); // Cleanup timer
        }
    }, [alert]);

    const handleAddCV = async () => {
        if (!selectedFile) {
            setAlert({
                type: "danger",
                message: "Vui lòng chọn file CV."
            })
            return;
        }

        if (!cvName || cvName.trim() === "") {
            setAlert({
                type: "danger",
                message: "Vui lòng nhập tên CV."
            })
            return;
        }

        try {
            setIsUpLoading(true);

            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("cvName", cvName);
            formData.append("studentId", student.id);
            const respone = await axiosInstance.post(apiRoute.getUrl(`api/ChucNangStudent/AddCV/${student.id}`), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            console.log("Thêm CV:", respone.status);
            if (respone.status === 200) {
                setAlert({
                    type: "success",
                    message: "Thêm CV thành công."
                });
                setShowAddCVModal(false);
                setSelectedFile(null);
                setCvName("");
                await LayListCV(user.id); // Cập nhật lại danh sách CV
            }
            setIsUpLoading(false);
        } catch (error) {
            console.error("Lỗi khi thêm CV:", error);
            setAlert({
                type: "danger",
                message: "Không thể thêm CV. Vui lòng thử lại."
            });
            setIsUpLoading(false);
        }
    }

    const handleUpdateCV =async () => {
        if(!cvNameUpdate || cvNameUpdate.trim() === "") {
            setAlert({
                type: "danger",
                message: "Vui lòng nhập tên CV."
            });
            return;
        }

        try {
            setIsUpLoading(true);

           
           const updateData = {
            cvNameUpdate: cvNameUpdate
        };

        const response = await axiosInstance.put(
            apiRoute.getUrl(`api/ChucNangStudent/UpdateCV/${cvIdUpdate}`), 
            updateData, 
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
            console.log(response.status);
            if (response.status === 200) {
                setAlert({
                    type: "success",
                    message: "Cập nhật CV thành công."
                });
                setShowUpdateCVModal(false);
                setCvNameUpdate("");
                await LayListCV(user.id); // Cập nhật lại danh sách CV
            }
            setIsUpLoading(false);
        } catch (error) {
            console.error("Lỗi khi cập nhật CV:", error);
            setAlert({
                type: "danger",
                message: "Không thể cập nhật CV. Vui lòng thử lại."
            });
            setIsUpLoading(false);
        }
    }

    

    const handleDeleteCV = async (idCV) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa CV này?")) {
            try {
                const response = await axiosInstance.put(apiRoute.getUrl(`api/ChucNangStudent/DeleteCV/${idCV}`));
                console.log(response.status);
                if (response.status === 200) {
                    setAlert({
                        type: "success",
                        message: "Xóa CV thành công."
                    });
                    // Cập nhật lại danh sách CV
                    await LayListCV(user.id);
                    setShowUpdateCVModal(false);
                    setCvIdUpdate(null);
                    setCvNameUpdate("");
                }
            }

            catch (error) {
                console.error("Lỗi khi xóa CV:", error);
                setAlert({
                    type: "danger",
                    message: "Không thể xóa CV. Vui lòng thử lại."
                });
            }
        }

    }



    if (isLoading) {
       return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Đang tải...</span>
      </div>
    );
    }



    return (
        <>
            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Hồ sơ của bạn</h2>
                    <Link to="/student/home" className="btn btn-outline-primary">
                        <i className="bi bi-arrow-left me-2"></i>Về trang chủ
                    </Link>
                </div>

                <ToastContainer position="top-end" className="p-3">
                    <Toast show={!!alert} onClose={() => setAlert(null)} bg={alert?.type} delay={3000} autohide>
                        <Toast.Header>
                            <strong className="me-auto">
                                {alert?.type === 'success' ? '✅ Thành công' :
                                 alert?.type === 'danger' ? '❌ Lỗi' :
                                 alert?.type === 'warning' ? '⚠️ Cảnh báo' : 'ℹ️ Thông báo'}
                            </strong>
                        </Toast.Header>
                        <Toast.Body>{alert?.message}</Toast.Body>
                    </Toast>
                </ToastContainer>

                <div className="row">
                    <div className="col-md-4">
                        <div className="card shadow-sm mb-4">
                            <div className="card-body text-center">
                                <img src={student.avatar} className="rounded-circle mb-3" alt="Avatar" 
                                style={{ 
                                            width: '200px', 
                                            height: '200px', 
                                            objectFit: 'cover',
                                            
                                        }}/>
                                <h5 className="card-title">{student?.name}</h5>
                                <p className="text-muted">{student?.email}</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-8">
                        <div className="card shadow-sm">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Danh sách CV</h5>
                                <Button variant="primary" onClick={() => setShowAddCVModal(true)}>
                                    <i className="bi bi-plus-circle me-2"></i>Thêm CV
                                </Button>
                            </div>
                            <div className="card-body">
                                {isLoading ? (
                                    <div className="d-flex justify-content-center">
                                        <div className="spinner-border" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : listCv.length > 0 ? (
                                    <ul className="list-group list-group-flush">
                                        {listCv.map((cv) => (
                                            <li key={cv.idCv} className="list-group-item d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6 className="mb-0">{cv.tenCv}</h6>
                                                    <small className="text-muted">Ngày tạo: {new Date(cv.ngaytao).toLocaleDateString()}</small>
                                                </div>
                                                <div>
                                                    <Button
                                                        variant="outline-info"
                                                        size="sm"
                                                        href={apiRoute.getUrl(cv.cvfilePath)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <i className="bi bi-eye me-1"></i> Xem
                                                    </Button>
                                                    <Button variant="outline-secondary" size="sm" className="ms-2" onClick={() => { setShowUpdateCVModal(true); setCvNameUpdate(cv.tenCv); setCvIdUpdate(cv.idCv); }}>
                                                        <i className="bi bi-pencil-square me-1"></i> Sửa
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" className="ms-2" onClick={() => handleDeleteCV(cv.idCv)}>
                                                        <i className="bi bi-trash me-1"></i> Xóa
                                                    </Button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center text-muted p-4">
                                        <p className="mb-1">Bạn chưa có CV nào trong hồ sơ.</p>
                                        <p>Hãy nhấn "Thêm CV" để bắt đầu tạo hồ sơ của bạn!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal thêm CV */}
            <Modal centered show={showAddCVModal} onHide={() => setShowAddCVModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>📄 Thêm CV mới</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>
                                Tên bản CV <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={cvName}
                                onChange={(e) => setCvName(e.target.value)}
                                placeholder="Ví dụ: CV ứng tuyển Frontend Developer"
                                disabled={isUpLoading}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>
                                Chọn file CV <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="file"
                                accept=".pdf"
                                onChange={(e) => setSelectedFile(e.target.files[0])}
                                disabled={isUpLoading}
                            />
                            <Form.Text className="text-muted">
                                Vui lòng sử dụng định dạng PDF.
                            </Form.Text>
                        </Form.Group>
                        {selectedFile && (
                            <div className="alert alert-info mt-3">
                                <strong>📎 File đã chọn:</strong> {selectedFile.name}
                            </div>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddCVModal(false)} disabled={isUpLoading}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleAddCV}
                        disabled={isUpLoading || !selectedFile || !cvName.trim()}
                    >
                        {isUpLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Đang tải lên...
                            </>
                        ) : (
                            '📤 Thêm mới'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal cập nhật CV */}
            <Modal centered show={showUpdateCVModal} onHide={() => setShowUpdateCVModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>✏️ Cập nhật tên CV</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>
                                Tên CV mới <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                value={cvNameUpdate}
                                onChange={(e) => setCvNameUpdate(e.target.value)}
                                placeholder="Nhập tên CV mới..."
                                disabled={isUpLoading}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowUpdateCVModal(false)} disabled={isUpLoading}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleUpdateCV}
                        disabled={isUpLoading || !cvNameUpdate.trim()}
                    >
                        {isUpLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Đang lưu...
                            </>
                        ) : (
                            '💾 Lưu thay đổi'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );

}
export default StudentProfile;