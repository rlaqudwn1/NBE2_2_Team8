import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Orders from "./pages/Orders";
import OrderDetail from './pages/OrderDetail';
import OrderCreate from "./pages/OrderCreate";
import SignUp from "./pages/SignUp";
import LoginModal from "./components/LoginModal";
import PostCourseInquiry from "./pages/PostCourseInquiry";
import CourseNews from "./pages/CourseNews";
import MyPage from "./pages/MyPage"; // MyPage 컴포넌트 import
import CreateNews from "./pages/CreateNews";
import UpdateNews from "./pages/UpdateNews";
import EditProfile from './components/EditProfile';


function App() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <Router>
            <Header openModal={openModal} />
            {isModalOpen && <LoginModal closeModal={closeModal} />}
            <Routes>
                <Route path="/" element={<Navigate to="/courses" />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:courseId" element={<CourseDetail />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/courses/:courseId/post" element={<PostCourseInquiry />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:orderId" element={<OrderDetail />} />
                <Route path="/order/create" element={<OrderCreate />} />
                <Route path="/courses/:courseId/news/:newsId" element={<CourseNews />} />
                <Route path="/내정보" element={<MyPage />} /> {/* MyPage 라우트 추가 */}
                <Route path="/courses/:courseId/news/create" element={<CreateNews />} />
                <Route path="/courses/:courseId/news/:newsId/edit" element={<UpdateNews />} />
                <Route path="/edit-profile" element={<EditProfile />} />
            </Routes>
        </Router>
    );
}

export default App;

