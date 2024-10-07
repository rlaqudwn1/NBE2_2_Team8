import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import { jwtDecode } from "jwt-decode";

const Course_Url = "http://localhost:8080/course";
const Member_Url = "http://localhost:8080/members";

const CourseList = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [role, setRole] = useState("null");
    const [userName, setUserName] = useState("");
    const navigate = useNavigate();
    const memberId = localStorage.getItem("memberId");

    useEffect(() => {
        checkUserRole(); // 사용자 역할 체크
    }, []);

    const checkUserRole = async () => {
        try {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('Authorization='))
                ?.split('=')[1];

            if (token) {
                const decodedToken = jwtDecode(token);
                setRole(decodedToken.role);
                const email = decodedToken.mid;

                const response = await fetch(`http://localhost:8080/member/nickname?email=${email}`);
                if (!response.ok) {
                    throw new Error("닉네임을 가져오는 데 실패했습니다.");
                }
                const nickname = await response.text();
                setUserName(nickname);
            }
        } catch (error) {
            console.error("토큰 확인 중 오류 발생:", error);
        }
    };

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            if (!memberId) {
                setError("로그인이 필요합니다.");
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(`${Course_Url}/list/${memberId}`);
                setCourses(response.data);
            } catch (error) {
                console.error("강좌 목록 가져오는 중 오류 발생:", error);
                setError("강좌 목록을 가져오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [memberId]);

    const handleUpdateClick = (courseId) => {
        navigate(`/courses/update/${courseId}`);
    };

    const handleDeleteClick = async (courseId) => {
        if (window.confirm("정말로 이 강좌를 삭제하시겠습니까?")) {
            try {
                await axios.delete(`${Course_Url}/${courseId}`);
                setCourses(courses.filter(course => course.courseId !== courseId));
            } catch (error) {
                console.error("강좌 삭제 중 오류 발생:", error);
                setError("강좌를 삭제하는 데 실패했습니다.");
            }
        }
    };

    if (loading) return <LoadingMessage>로딩 중...</LoadingMessage>;
    if (error) return <ErrorMessage>{error}</ErrorMessage>;

    return (
        <CourseListContainer>
            <Header>강좌 목록</Header>
            {role === "ROLE_INSTRUCTOR" && (
                <Link to="/courses/create">
                    <StyledButton primary>강좌 생성</StyledButton>
                </Link>
            )}
            {courses.length > 0 ? (
                courses.map(course => (
                    <CourseItem key={course.courseId}>
                        <CourseDetails>
                            <p>강좌 ID: <strong>{course.courseId}</strong></p>
                            <p>강좌 이름: <strong>{course.courseName}</strong></p>
                            <p>등록 날짜: <strong>{new Date(course.createdDate).toLocaleDateString()}</strong></p>
                        </CourseDetails>
                        <ButtonContainer>
                            <StyledButton color="#28a745" onClick={() => handleUpdateClick(course.courseId)}>수정</StyledButton>
                            <StyledButton color="#dc3545" onClick={() => handleDeleteClick(course.courseId)}>삭제</StyledButton>
                            <Link to={`/video/${course.courseId}`}>
                                <StyledButton color="#17a2b8">비디오 확인</StyledButton>
                            </Link>
                            <Link to={`/course/${course.courseId}`}>
                                <StyledButton color="#ffc107">상세정보</StyledButton>
                            </Link>
                        </ButtonContainer>
                    </CourseItem>
                ))
            ) : (
                <p>강좌가 없습니다.</p>
            )}
        </CourseListContainer>
    );
};

// 스타일 컴포넌트들
const CourseListContainer = styled.div`
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
    background: #f0f4f8;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const Header = styled.h2`
    text-align: center;
    color: #333;
    margin-bottom: 2rem;
    font-family: 'Arial', sans-serif;
`;

const LoadingMessage = styled.p`
    text-align: center;
    color: #007bff;
    font-size: 1.2rem;
`;

const ErrorMessage = styled.p`
    text-align: center;
    color: #dc3545;
    font-weight: bold;
    font-size: 1.2rem;
`;

const CourseItem = styled.div`
    padding: 1.5rem;
    border: 1px solid #ddd;
    border-radius: 12px;
    margin-bottom: 1rem;
    background-color: #ffffff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const CourseDetails = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
    gap: 1rem;
`;

const StyledButton = styled.button`
    padding: 0.5rem 1rem;
    background-color: ${props => props.color || "#007bff"};
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s;
    flex: 1;

    &:hover {
        background-color: ${props => props.color ? darkenColor(props.color) : "#0056b3"};
    }
`;

// 색상 어두운 버전 생성 함수
const darkenColor = (color) => {
    let c = color.substring(1);
    let rgb = parseInt(c, 16);
    let r = (rgb >> 16) & 0xff;
    let g = (rgb >> 8) & 0xff;
    let b = (rgb >> 0) & 0xff;

    r = Math.max(0, r - 30);
    g = Math.max(0, g - 30);
    b = Math.max(0, b - 30);

    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
};

export default CourseList;
