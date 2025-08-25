import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WellcomePage from './page/WellcomePage';
//Xac Thuc
import DangNhap from './page/XacThuc/DangNhap';
import DangKy from './page/XacThuc/DangKy';
import QuenMK from './page/XacThuc/QuenMK';
//student
import StudentProfile from './page/student/HoSo';
import StudentHome from './page/student/homeStudent';
import ThongTinCaNhan from './page/student/ThongTinCaNhan';
import DonDangKy from './page/student/DonDangKy';

//company
import HomeCompany from './page/company/homeCompany';
import AppliedCompany from './page/company/AppliedCompany';
import JobPostingCompany from './page/company/JobPostingCompany';
import CreateJobCompany from './page/company/CreateJobCompany';
import EditJobPostCompany from './page/company/EditJobPostCompany';
// Admin
import HomeAdmin from './page/admin/homeAdmin';
function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Trang chủ */}
        <Route path="/" element={<WellcomePage />} />
        
        {/* Xác thực */}
        <Route path="/dang-nhap" element={<DangNhap />} />
        <Route path="/dang-ky" element={<DangKy />} />
        <Route path="/quen-mat-khau" element={<QuenMK />} />
        
        {/* Student Routes */}
        <Route path="/student/home" element={<StudentHome />} />
        <Route path="/student/thong-tin-ca-nhan" element={<ThongTinCaNhan />} />
        <Route path="/student/ho-so" element={<StudentProfile />} />
        <Route path="/student/don-dang-ky" element={<DonDangKy />} />

        {/* Company Routes */}
        <Route path="/company/home" element={<HomeCompany />} />
        <Route path="/company/applied" element={<AppliedCompany />} />
        <Route path="/company/job-postings" element={<JobPostingCompany />} />
        <Route path="/company/create-job" element={<CreateJobCompany />} />
        <Route path="/company/edit-job/:id" element={<EditJobPostCompany />} />
        {/* Admin Routes */}
        <Route path="/admin/home" element={<HomeAdmin />} />

        {/* <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/company/*" element={<CompanyRoutes />} />
        <Route path="/student/*" element={<StudentRoutes />} /> */}
      </Routes>
    </Router>
  );
}

export default AppRoutes;
