import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const CreateNews = () => {
    const { courseId } = useParams();
    const [newsName, setNewsName] = useState("");
    const [newsDescription, setNewsDescription] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        // 컴포넌트 마운트 시 권한 확인
        checkAuthorization();
    }, []);

    const checkAuthorization = () => {
        try {
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('Authorization='))
                ?.split('=')[1];

            if (!token) {
                alert('로그인이 필요합니다.');
                navigate(`/courses/${courseId}`);
                return;
            }

            const decodedToken = jwtDecode(token); // jwtDecode 사용
            const userRole = decodedToken.role;

            if (userRole !== 'INSTRUCTOR' && userRole !== 'ADMIN') {
                alert('새소식 등록 권한이 없습니다.');
                navigate(`/courses/${courseId}`);
            }
        } catch (error) {
            console.error("권한 확인 중 오류 발생:", error);
            navigate(`/courses/${courseId}`);
        }
    };

    const handleCreateNews = (e) => {
        e.preventDefault();
        const newsRqDTO = {
            newsName,
            newsDescription,
        };

        // JWT 토큰을 헤더에 포함하여 요청
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('Authorization='))
            ?.split('=')[1];

        fetch(`http://localhost:8080/course/${courseId}/news`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // JWT 토큰을 Authorization 헤더에 추가
            },
            withCredentials: true,
            body: JSON.stringify(newsRqDTO),
        })
            .then(res => {
                if (!res.ok) {
                    if (res.status === 403) {
                        throw new Error('권한이 없습니다.');
                    }
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                alert('새소식이 성공적으로 등록되었습니다.');
                navigate(`/courses/${courseId}`);
            })
            .catch(err => {
                console.error("새소식 등록 실패:", err);
                alert(err.message || '새소식 등록에 실패했습니다. 다시 시도해주세요.');
            });
    };

    const handleCancel = () => {
        navigate(`/courses/${courseId}`); // 취소 시 코스 상세 페이지로 이동
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>새소식 등록</h2>
            <form onSubmit={handleCreateNews} style={styles.form}>
                <input
                    type="text"
                    placeholder="새소식 제목"
                    value={newsName}
                    onChange={(e) => setNewsName(e.target.value)}
                    required
                    style={styles.input}
                />
                <textarea
                    placeholder="새소식 내용"
                    value={newsDescription}
                    onChange={(e) => setNewsDescription(e.target.value)}
                    required
                    style={styles.textarea}
                />
                <div style={styles.buttonContainer}>
                    <button type="submit" style={styles.submitButton}>등록</button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        style={styles.cancelButton}
                    >
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    header: {
        fontSize: '24px',
        color: '#333',
        marginBottom: '20px',
        borderBottom: '2px solid #007bff',
        paddingBottom: '10px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    input: {
        marginBottom: '10px',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '16px',
    },
    textarea: {
        marginBottom: '20px',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        minHeight: '150px',
        resize: 'vertical',
        fontSize: '16px',
    },
    buttonContainer: {
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end',
    },
    submitButton: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
    },
    cancelButton: {
        padding: '10px 20px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
    },
};

export default CreateNews;