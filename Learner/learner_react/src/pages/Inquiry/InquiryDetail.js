import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Style/InquiryDetail.css';
import {jwtDecode} from 'jwt-decode';

const InquiryDetail = () => {
    const { inquiryId } = useParams();
    const [inquiry, setInquiry] = useState(null);
    const [answer, setAnswer] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isAnswerEditing, setIsAnswerEditing] = useState(false);
    const [isAnswerCreating, setIsAnswerCreating] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [answerContent, setAnswerContent] = useState('');
    const [inquiryStatus, setInquiryStatus] = useState('');
    const navigate = useNavigate();
    const memberIdFromStorage = localStorage.getItem('memberId');
    const memberId = memberIdFromStorage ? parseInt(memberIdFromStorage, 10) : null;

    const getRoleFromCookie = () => {
        const cookies = document.cookie.split('; ');
        const token = cookies.find(row => row.startsWith('Authorization=')).split('=')[1]; // 쿠키에서 JWT 가져오기

        if (token) {
            try {
                const decodedToken = jwtDecode(token); // JWT 디코딩
                return decodedToken.role; // 역할 정보 반환
            } catch (error) {
                console.error('JWT 디코딩 실패:', error);
                return null;
            }
        }
        return null;
    };
    const role = getRoleFromCookie();

    const fetchInquiry = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/inquiries/${inquiryId}`, { withCredentials: true });
            setInquiry(response.data);
            setTitle(response.data.inquiryTitle);
            setContent(response.data.inquiryContent);
            setInquiryStatus(response.data.inquiryStatus);
        } catch (error) {
            console.error('Failed to fetch inquiry:', error);
        }
    };

    const fetchAnswer = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/answers/${inquiryId}`, { withCredentials: true });
            setAnswer(response.data);
            setAnswerContent(response.data.answerContent);
        } catch (error) {
            setAnswer(null);
        }
    };

    useEffect(() => {
        fetchInquiry();
        fetchAnswer();
    }, [inquiryId]);

    const handleDelete = async () => {
        const confirmDelete = window.confirm('정말로 삭제하시겠습니까?');
        if (confirmDelete) {
            try {
                await axios.delete(`http://localhost:8080/inquiries/${inquiryId}`, { withCredentials: true });
                navigate('/inquiries');
            } catch (error) {
                console.error('Failed to delete inquiry:', error);
            }
        }
    };

    const handleAnswerDelete = async () => {
        const confirmDelete = window.confirm('정말로 답변을 삭제하시겠습니까?');
        if (confirmDelete) {
            try {
                await axios.delete(`http://localhost:8080/answers/${inquiryId}`, { withCredentials: true });
                setAnswer(null);
                setAnswerContent('');
                await axios.put(`http://localhost:8080/inquiries/${inquiryId}`, {
                    inquiryTitle: title,
                    inquiryContent: content,
                    memberId: memberId,
                    inquiryStatus: "CONFIRMING"
                }, { withCredentials: true });
            } catch (error) {
                console.error('Failed to delete answer:', error);
            }
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleAnswerEdit = () => {
        setAnswerContent(answer.answerContent);
        setIsAnswerEditing(true);
    };

    const handleAnswerCreate = () => {
        setIsAnswerCreating(true);
    };

    const handleUpdate = async () => {
        try {
            await axios.put(`http://localhost:8080/inquiries/${inquiryId}`, {
                inquiryTitle: title,
                inquiryContent: content,
                memberId: memberId
            }, { withCredentials: true });
            setInquiry({ ...inquiry, inquiryTitle: title, inquiryContent: content });
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update inquiry:', error);
        }
    };

    const handleAnswerUpdate = async () => {
        try {
            await axios.put(`http://localhost:8080/answers/${answer.answerId}`, {
                answerContent: answerContent,
            }, { withCredentials: true });
            setAnswer({ ...answer, answerContent: answerContent });
            await axios.put(`http://localhost:8080/inquiries/${inquiryId}`, {
                inquiryTitle: title,
                inquiryContent: content,
                memberId: memberId,
                inquiryStatus: inquiryStatus
            }, { withCredentials: true });
            await fetchInquiry();
            setIsAnswerEditing(false);
        } catch (error) {
            console.error('Failed to update answer:', error);
        }
    };

    const handleAnswerSave = async () => {
        try {
            const response = await axios.post('http://localhost:8080/answers', {
                inquiryId: inquiryId,
                answerContent: answerContent,
            }, { withCredentials: true });
            setAnswer(response.data);
            await axios.put(`http://localhost:8080/inquiries/${inquiryId}`, {
                inquiryTitle: title,
                inquiryContent: content,
                memberId: memberId,
                inquiryStatus: inquiryStatus
            }, { withCredentials: true });
            await fetchInquiry();
            setIsAnswerCreating(false);
            setAnswerContent('');
        } catch (error) {
            console.error('Failed to save answer:', error);
        }
    };

    const handleBackToList = () => {
        navigate('/inquiries');
    };

    if (!inquiry) return <p>로딩 중...</p>;

    return (
        <div className="inquiry-detail">
            <h1>문의 상세 페이지</h1>

            <div className="answer-area">
                <div className="inquiry-title">
                    <strong>제목:</strong>
                    {isEditing ? (
                        <input value={title} onChange={(e) => setTitle(e.target.value)}/>
                    ) : (
                        inquiry.inquiryTitle
                    )}
                </div>

                <div className="divider"></div>

                <div className="inquiry-info">
                    <div className="info-row"><strong>작성자:</strong> {inquiry.memberNickname}</div>
                    <div className="info-row">
                        <strong>작성일:</strong> {new Date(inquiry.inquiryCreateDate).toLocaleDateString()}</div>
                    <div className="info-row">
                        <strong>수정일:</strong> {new Date(inquiry.inquiryUpdateDate).toLocaleDateString()}</div>
                    <div className="info-row"><strong>상태:</strong> {inquiry.inquiryStatus}</div>
                </div>

                <div className="divider"></div>

                <div className="inquiry-content">
                    <strong>내용:</strong>
                    {isEditing ? (
                        <textarea value={content} onChange={(e) => setContent(e.target.value)}/>
                    ) : (
                        <p>{inquiry.inquiryContent}</p>
                    )}
                </div>

                {inquiry.memberId === memberId && (
                    <div className="inquiry-actions">
                        {isEditing ? (
                            <button className="edit-button" onClick={handleUpdate}>완료</button>
                        ) : (
                            <button className="edit-button" onClick={handleEdit}>수정</button>
                        )}
                        <button className="delete-button" onClick={handleDelete}>삭제</button>
                    </div>
                )}
            </div>

            <div className="answer-area">
                <div className="answer-section">
                    <h2>문의 답변</h2>
                    <div className="divider"></div>
                    {/* 시각적 구분선 추가 */}
                    {answer ? (
                        <div>
                            <strong>답변 내용:</strong>
                            {isAnswerEditing ? (
                                <textarea value={answerContent} onChange={(e) => setAnswerContent(e.target.value)}/>
                            ) : (
                                <p>{answer.answerContent}</p>
                            )}
                            {role === 'ADMIN' && (
                                <div className="answer-actions">
                                    {isAnswerEditing ? (
                                        <>
                                            <select value={inquiryStatus}
                                                    onChange={(e) => setInquiryStatus(e.target.value)}>
                                                <option value="CONFIRMING">확인 중</option>
                                                <option value="ANSWERED">답변 완료</option>
                                                <option value="RESOLVED">해결됨</option>
                                            </select>
                                            <button onClick={handleAnswerUpdate}>수정 완료</button>
                                            <button onClick={handleAnswerDelete}>삭제</button>
                                        </>
                                    ) : (
                                        <button onClick={handleAnswerEdit}>답변 수정</button>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <strong>답변이 없습니다.</strong>
                            {role === 'ADMIN' && (
                                <button onClick={handleAnswerCreate}>답변 작성</button>
                            )}
                        </div>
                    )}
                    {isAnswerCreating && (
                        <div>
                        <textarea
                            value={answerContent}
                            onChange={(e) => setAnswerContent(e.target.value)}
                            placeholder="답변을 작성하세요"
                        />
                            <button onClick={handleAnswerSave}>답변 등록</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="back-button">
                <button onClick={handleBackToList}>목록으로 돌아가기</button>
            </div>
        </div>
    );
};

export default InquiryDetail;
