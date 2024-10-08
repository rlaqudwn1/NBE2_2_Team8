import React, { useState } from 'react'; // React 및 훅스 가져오기
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위한 useNavigate 훅 가져오기
import axios from 'axios'; // HTTP 요청을 위해 axios 가져오기
import './Style/InquiryRegistration.css'

const InquiryRegistration = () => {
    const [inquiryTitle, setInquiryTitle] = useState(''); // 문의 제목 상태
    const [inquiryContent, setInquiryContent] = useState(''); // 문의 내용 상태
    const navigate = useNavigate(); // 페이지 이동을 위한 navigate 함수 생성

    // 문의 작성 요청을 처리하는 비동기 함수
    const handleSubmit = async (e) => {
        e.preventDefault(); // 기본 폼 제출 동작 방지

        // LocalStorage에서 memberId 가져오기
        const memberId = localStorage.getItem('memberId');

        // memberId가 존재하지 않을 경우 경고 후 이동
        if (!memberId) {
            alert('로그인이 필요합니다.'); // 로그인이 필요하다는 경고 메시지
            navigate('/login'); // 로그인 페이지로 이동
            return;
        }

        // 서버에 전송할 데이터 구성
        const inquiryDTO = {
            inquiryTitle,
            inquiryContent,
            memberId: Number(memberId), // memberId를 숫자로 변환하여 저장
        };

        try {
            // 서버에 문의 등록 요청 보내기
            await axios.post('http://localhost:8080/inquiries', inquiryDTO, { withCredentials: true });
            alert('문의가 등록되었습니다.'); // 성공 시 메시지
            navigate('/inquiries'); // 문의 목록 페이지로 이동
        } catch (error) {
            // 에러 발생 시 더 자세한 정보를 콘솔에 출력
            console.error('Failed to register inquiry:', error.response ? error.response.data : error.message); // 에러의 응답 데이터 또는 메시지를 출력
            alert('문의 등록에 실패했습니다.'); // 실패 시 메시지
        }
    };

    const handleCancel = () => {
        navigate('/inquiries'); // 목록 페이지로 이동
    };

    return (
        <div className="inquiry-registration">
            <h1>문의 작성</h1>
            <form onSubmit={handleSubmit}> {/* 폼 제출 시 handleSubmit 함수 호출 */}
                <div>
                    <label>제목</label>
                    <input
                        type="text"
                        value={inquiryTitle}
                        onChange={(e) => setInquiryTitle(e.target.value)} // 제목 상태 업데이트
                        required // 필수 입력
                    />
                </div>
                <div>
                    <label>내용</label>
                    <textarea
                        value={inquiryContent}
                        onChange={(e) => setInquiryContent(e.target.value)} // 내용 상태 업데이트
                        required // 필수 입력
                    />
                </div>
                <div className="button-group">
                    <button type="submit" className="submit-button">문의 등록</button>
                    <button type="button" className="cancel-button" onClick={handleCancel}>취소</button>
                </div>
            </form>
        </div>
    );
};

export default InquiryRegistration;
