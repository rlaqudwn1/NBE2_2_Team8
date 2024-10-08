import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const CourseNewsList = ({ courseId }) => {
    const [newsList, setNewsList] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [userRole, setUserRole] = useState(null);
    const [userName, setUserName] = useState(null);
    const [instructorName, setInstructorName] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const newsPerPage = 5;
    const navigate = useNavigate();

    useEffect(() => {
        checkUserRole();
        fetchInstructorName();
    }, [courseId]); // courseId가 변경될 때마다 실행

    const fetchInstructorName = async () => {
        try {
            const response = await fetch(`http://localhost:8080/course/${courseId}/member-nickname`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const nickname = await response.text();
            // console.log("Instructor Nickname:", nickname);
            setInstructorName(nickname);
        } catch (err) {
            console.error("Failed to fetch instructor nickname:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const checkUserRole = async () => {
        try {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('Authorization='))
                ?.split('=')[1];

            if (token) {
                const decodedToken = jwtDecode(token);
                setUserRole(decodedToken.role);
                const email = decodedToken.mid;

                const response = await fetch(`http://localhost:8080/member/nickname?email=${email}`, {
                    credentials: 'include',
                });
                if (!response.ok) {
                    throw new Error("닉네임을 가져오는 데 실패했습니다.");
                }
                const nickname = await response.text();
                // console.log("User Nickname:", nickname);
                setUserName(nickname);
            }
        } catch (error) {
            console.error("토큰 확인 중 오류 발생:", error);
        }
    };

    const canCreateNews = () => {
        // console.log("Current state:", {
        //     userRole,
        //     userName,
        //     instructorName
        // });
        // console.log("User role:", userRole);
        return (userRole === 'INSTRUCTOR' && userName === instructorName) ||
            userRole === 'ADMIN';
    };


    const fetchNews = (page) => {
        fetch(`http://localhost:8080/course/${courseId}/news?page=${page}&size=${newsPerPage}`, {
            credentials: 'include',
        })
            .then(res => res.json())
            .then(data => {
                // console.log("Fetched news:", data);
                setNewsList(data.content);
                setTotalPages(data.totalPages);
            })
            .catch(err => console.error("새소식 가져오기 실패:", err));
    };

    useEffect(() => {
        fetchNews(currentPage);
    }, [courseId, currentPage]);

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleCreateNews = () => {
        if (isLoading) {
            return; // 로딩 중일 때는 처리하지 않음
        }
        // console.log("Can create news?", canCreateNews());
        if (canCreateNews()) {
            navigate(`/courses/${courseId}/news/create`);
        } else {
            alert('새소식 등록은 강사 또는 관리자만 가능합니다.');
        }
    };

    return (
        <div style={styles.newsContainer}>
            <h2 style={styles.newsHeader}>과정 새소식</h2>
            {canCreateNews() && (
                <button onClick={handleCreateNews} style={styles.createNewsButton}>
                    새소식 등록하기
                </button>
            )}
            <ul style={styles.newsList}>
                {newsList.map(news => (
                    <li key={news.newsId} style={styles.newsItem}>
                        <Link
                            to={`/courses/${courseId}/news/${news.newsId}`}
                            style={styles.newsLink}
                        >
                            <span style={styles.newsTitle}>{news.newsName}</span>
                            <span style={styles.newsArrow}>→</span>
                        </Link>
                    </li>
                ))}
            </ul>
            <div style={styles.pagination}>
                <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                    style={currentPage === 0 ? {...styles.paginationButton, ...styles.disabledButton} : styles.paginationButton}
                >
                    이전
                </button>
                <span>{currentPage + 1} / {totalPages}</span>
                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages - 1}
                    style={currentPage === totalPages - 1 ? {...styles.paginationButton, ...styles.disabledButton} : styles.paginationButton}
                >
                    다음
                </button>
            </div>
        </div>
    );
};

const styles = {
    newsContainer: {
        maxWidth: '900px',
        margin: '40px auto',
        padding: '30px',
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.3s ease',
    },
    newsHeader: {
        fontSize: '32px',
        color: '#333',
        marginBottom: '30px',
        borderBottom: '3px solid #007bff',
        paddingBottom: '15px',
        fontWeight: 'bold',
    },
    createNewsButton: {
        padding: '12px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '30px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        letterSpacing: '1px',
        transition: 'background-color 0.3s ease, transform 0.2s ease',
        marginBottom: '30px',
    },
    createNewsButtonHover: {
        backgroundColor: '#0056b3',
        transform: 'scale(1.05)',
    },
    newsList: {
        listStyleType: 'none',
        padding: 0,
        marginBottom: '20px',
    },
    newsItem: {
        marginBottom: '20px',
        transition: 'transform 0.3s ease',
    },
    newsItemHover: {
        transform: 'translateY(-5px)',
    },
    newsLink: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '10px',
        color: '#333',
        textDecoration: 'none',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        transition: 'box-shadow 0.3s ease, transform 0.3s ease',
    },
    newsLinkHover: {
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
        transform: 'translateY(-5px)',
    },
    newsTitle: {
        fontWeight: 'bold',
        fontSize: '18px',
    },
    newsArrow: {
        fontSize: '20px',
        color: '#007bff',
        transition: 'transform 0.3s ease',
    },
    pagination: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '30px',
    },
    paginationButton: {
        padding: '12px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '30px',
        cursor: 'pointer',
        fontSize: '16px',
        transition: 'background-color 0.3s ease, transform 0.3s ease',
        fontWeight: 'bold',
    },
    paginationButtonHover: {
        backgroundColor: '#0056b3',
        transform: 'scale(1.05)',
    },
    disabledButton: {
        backgroundColor: '#ccc',
        cursor: 'not-allowed',
    },
    paginationText: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#333',
    },
};


export default CourseNewsList;