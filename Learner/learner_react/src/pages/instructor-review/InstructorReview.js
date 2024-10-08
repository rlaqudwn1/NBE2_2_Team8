import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const InstructorReview = () => {
    const { nickname } = useParams(); // URL에서 nickname 가져오기
    const [reviewList, setReviewList] = useState([]);
    const [averageRating, setAverageRating] = useState(0); // 평균 평점 상태 추가
    const [userId, setUserId] = useState(''); // 사용자의 memberId를 저장할 상태 추가
    const [courseList, setCourseList] = useState([]); // 강의 목록 상태 추가
    const navigate = useNavigate(); // navigate 추가
    const [writerId, setWriterId] = useState(null); // 토큰에서 가져온 memberId 저장

    // useEffect를 통해 로그인한 사용자의 정보를 로컬 스토리지에서 가져옴
    useEffect(() => {
        const storedMemberId = localStorage.getItem("memberId"); // localStorage에서 memberId 가져옴
        if (storedMemberId) {
            setWriterId(storedMemberId); // memberId 상태 설정
        }
    }, []);

    useEffect(() => {
        const memberId = localStorage.getItem("memberId");
        const token = localStorage.getItem("Authorization");
        if (memberId) {
            fetch(`http://localhost:8080/members/${memberId}`, {
                headers:{
                    "Authorization": `Bearer ${token}`
                },
                credentials: 'include',
            })
                .then(res => res.json())
                .then(data => {
                    console.log("사용자 정보:", data);
                    setUserId(data.memberId); // 사용자 memberId 설정
                })
                .catch(err => console.error("사용자 정보 가져오기 실패:", err));
        }
    }, []);

    const fetchReviews = () => {
        fetch(`http://localhost:8080/members/instructor/${nickname}/reviews/list`, {
            credentials: 'include',
        })
            .then(res => res.json())
            .then(data => {
                console.log("Fetched instructor reviews:", data);
                setReviewList(data);
                calculateAverageRating(data); // 평균 평점 계산
            })
            .catch(err => console.error("리뷰 가져오기 실패:", err));
    };

    const fetchCourses = () => {
        const memberId = localStorage.getItem("memberId");
        if (memberId) {
            fetch(`http://localhost:8080/courses/list/${memberId}`, {
                credentials: 'include',
            })
                .then(res => res.json())
                .then(data => {
                    console.log("Fetched courses:", data);
                    setCourseList(data); // courseList에 데이터를 설정
                })
                .catch(err => console.error("강의 목록 가져오기 실패:", err));
        }
    };

    const calculateAverageRating = (reviews) => {
        if (reviews.length === 0) {
            setAverageRating(0); // 리뷰가 없을 경우 평균 평점 0으로 설정
            return;
        }
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        setAverageRating((totalRating / reviews.length).toFixed(1)); // 소수점 첫째 자리까지 표시
    };

    useEffect(() => {
        fetchReviews();
        fetchCourses();
    }, [nickname]); // nickname에 따라 API 호출

    const handleDelete = (reviewId) => {
        const token = localStorage.getItem("Authorization");
        if (window.confirm("정말 삭제하시겠습니까?")) {
            fetch(`http://localhost:8080/members/instructor/${nickname}/reviews/${reviewId}`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                    'memberId': token
                },
                credentials: 'include',
                body: JSON.stringify({ writerId })
            })
                .then(() => {
                    setReviewList(reviewList.filter(review => review.reviewId !== reviewId));

                    alert("리뷰가 삭제되었습니다.");
                })
                .catch(err => console.error("리뷰 삭제 실패:", err));
        }
    };

    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false // 24시간 형식
        };
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', options).replace(',', ''); // 한국 형식으로 반환
    };

    return (
        <div>
            <div className="course-list">
                {Array.isArray(courseList) ? ( // courseList가 배열인지 확인
                    courseList.map(course => (
                        <li key={course.courseId} className="course-item">
                            <Link to={`/courses/${course.courseId}`}>{course.courseName}</Link>
                        </li>
                    ))
                ) : (
                    <p>강의 목록을 불러오는 데 실패했습니다.</p> // 에러 메시지
                )}
            </div>
            <div className="review-container">
                <h2 className="review-header">강사 리뷰</h2>
                <h3 className="average-rating">평균 평점: {averageRating} / 5</h3> {/* 평균 평점 표시 */}
                <button
                    className="add-review-button"
                    onClick={() => navigate(`/members/instructor/${nickname}/reviews/create`)} // 리뷰 작성 페이지로 이동
                >
                    리뷰 작성
                </button>
                <ul className="review-list">
                    {reviewList.map(review => (
                        <li key={review.reviewId} className="review-item">
                            <div className="review-content">
                                <h3 className="review-title">{review.reviewName}</h3>
                                <p className="review-detail">{review.reviewDetail}</p>
                                <p className="review-detail"> 강의 제목 : {review.courseName}</p>
                                <span className="review-rating">평점: {review.rating} / 5</span>
                                <p className="review-author">
                                    {/* userId와 review.writerId가 같으면 MyPage로, 다르면 OtherUserPage로 이동 */}
                                    <Link
                                        to={userId === review.writerId ? `/내정보` : `/members/other/${review.writerName}`}>
                                        작성자: {review.writerName}
                                    </Link>
                                </p>
                                <p className="review-updatedDate"> 수정일 : {formatDate(review.reviewUpdatedDate)}</p>
                            </div>
                            <div className="button-group">
                                {userId === review.writerId && ( // userId와 review의 writerId가 일치할 때만 버튼 표시
                                    <>
                                        <button onClick={() => handleDelete(review.reviewId)}
                                                className="delete-button">삭제
                                        </button>
                                        <Link to={`/members/instructor/${nickname}/reviews/${review.reviewId}`}
                                              className="edit-button">수정</Link> {/* 수정 페이지로 이동 */}
                                    </>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
                <style jsx>{`
                    .review-container {
                        max-width: 1000px;
                        margin: 0 auto;
                        padding: 30px;
                        background-color: #f8f9fa;
                        border-radius: 12px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                        position: relative; /* 버튼 위치 조정을 위해 relative 추가 */
                    }

                    .review-header {
                        font-size: 28px;
                        color: #333;
                        margin-bottom: 10px;
                        border-bottom: 2px solid #28a745;
                        padding-bottom: 15px;
                    }

                    .average-rating {
                        font-size: 20px;
                        color: #28a745;
                        margin-bottom: 30px; /* 간격 조정 */
                    }

                    .add-review-button {
                        position: absolute; /* 버튼을 절대 위치로 설정 */
                        top: 30px; /* 상단 여백 */
                        right: 30px; /* 오른쪽 여백 */
                        padding: 10px 15px;
                        background-color: #28a745; /* 초록색 */
                        color: white;
                        border: none;
                        border-radius: 6px; /* 모서리 둥글게 */
                        cursor: pointer;
                        font-size: 16px;
                    }

                    .add-review-button:hover {
                        background-color: #218838; /* 버튼 호버 시 색상 변경 */
                    }

                    .review-list {
                        list-style-type: none;
                        padding: 0;
                    }

                    .review-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        background-color: #fff;
                        border-radius: 10px;
                        padding: 20px;
                        margin-bottom: 20px;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        transition: transform 0.2s;
                    }

                    .review-item:hover {
                        transform: translateY(-3px);
                    }

                    .review-content {
                        flex-grow: 1;
                        margin-right: 20px;
                    }

                    .review-title {
                        font-weight: bold;
                        font-size: 18px;
                        margin: 0 0 10px;
                    }

                    .review-detail {
                        margin: 0 0 10px;
                    }

                    .review-rating {
                        color: #ffcc00; /* 평점 색상 */
                        font-weight: bold;
                        margin-right: 10px;
                    }

                    .review-author {
                        font-size: 14px;
                        color: #777;
                    }

                    .review-updatedDate {
                        font-size: 12px;
                        color: #999;
                    }

                    .button-group {
                        display: flex;
                        align-items: center; /* 버튼 수직 정렬 */
                    }

                    .delete-button {
                        padding: 8px 12px;
                        background-color: #dc3545; /* 빨간색 */
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        margin-right: 10px; /* 삭제 버튼과 수정 버튼 간의 간격 */
                    }

                    .delete-button:hover {
                        background-color: #c82333; /* 삭제 버튼 호버 시 색상 변경 */
                    }

                    .edit-button {
                        padding: 8px 12px;
                        background-color: #007bff; /* 파란색 */
                        color: white;
                        border: none;
                        border-radius: 5px;
                        margin-top: 10px;
                        text-decoration: none; /* 링크 스타일 제거 */
                    }

                    .edit-button:hover {
                        background-color: #0069d9; /* 수정 버튼 호버 시 색상 변경 */
                    }

                    .button-group {
                        display: flex;
                        justify-content: flex-end; /* 버튼을 오른쪽으로 정렬 */
                        gap: 10px; /* 버튼 간의 간격 */
                    }
                `}</style>
            </div>
        </div>
    );
};

export default InstructorReview;
