import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Style/InquiryList.css';

const InquiryListPage = () => {
    const [inquiries, setInquiries] = useState([]);
    const [sortBy, setSortBy] = useState('latest');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [memberId, setMemberId] = useState(null);
    const [isMyInquiries, setIsMyInquiries] = useState(false); // 내 문의 모아보기 상태
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInquiries = async () => {
            try {
                const response = await axios.get('http://localhost:8080/inquiries', { withCredentials: true });
                setInquiries(response.data);
            } catch (error) {
                console.error('Failed to fetch inquiries:', error.response ? error.response.data : error.message);
            }
        };

        const storedMemberId = localStorage.getItem('memberId');
        if (storedMemberId) {
            setMemberId(storedMemberId);
        }

        fetchInquiries();
    }, []);

    // 내 문의를 가져오는 함수
    const fetchMyInquiries = async () => {
        if (!memberId) return; // memberId가 없으면 리턴

        try {
            const response = await axios.get(`http://localhost:8080/inquiries/member/${memberId}`, { withCredentials: true }); // memberId로 문의 조회
            setInquiries(response.data);
            setIsMyInquiries(true); // 내 문의 모아보기 상태 업데이트
        } catch (error) {
            console.error('Failed to fetch my inquiries:', error.response ? error.response.data : error.message);
        }
    };

    // 전체 문의로 되돌리는 함수
    const fetchAllInquiries = async () => {
        try {
            const response = await axios.get('http://localhost:8080/inquiries', { withCredentials: true });
            setInquiries(response.data);
            setIsMyInquiries(false); // 전체 문의로 되돌리기
        } catch (error) {
            console.error('Failed to fetch inquiries:', error.response ? error.response.data : error.message);
        }
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    const handleStatusFilterChange = (e) => {
        setFilterStatus(e.target.value);
    };

    const filteredInquiries = inquiries.filter((inquiry) => {
        if (filterStatus === 'ALL') return true;
        return inquiry.inquiryStatus === filterStatus;
    });

    const sortedInquiries = filteredInquiries.sort((a, b) => {
        if (sortBy === 'status') {
            return a.inquiryStatus.localeCompare(b.inquiryStatus);
        } else if (sortBy === 'latest') {
            return new Date(b.inquiryCreateDate) - new Date(a.inquiryCreateDate);
        }
        return 0;
    });

    return (
        <div className="inquiry-list-page">
            <h1>문의 목록</h1>
            <div className="actions">
                <label>
                    정렬 기준:
                    <select value={sortBy} onChange={handleSortChange}>
                        <option value="latest">최신순</option>
                        <option value="status">상태별</option>
                    </select>
                </label>
                <label>
                    상태 필터:
                    <select value={filterStatus} onChange={handleStatusFilterChange}>
                        <option value="ALL">모두</option>
                        <option value="CONFIRMING">CONFIRMING</option>
                        <option value="PENDING">PENDING</option>
                        <option value="ANSWERED">ANSWERED</option>
                        <option value="RESOLVED">RESOLVED</option>
                    </select>
                </label>
                {/* 내 문의 모아보기 버튼 */}
                <button onClick={isMyInquiries ? fetchAllInquiries : fetchMyInquiries}>
                    {isMyInquiries ? '전체 문의 보기' : '내 문의 모아보기'}
                </button>
                {memberId && (
                    <button onClick={() => navigate('/inquiries/new')}>문의 작성</button>
                )}
            </div>

            {sortedInquiries.length === 0 ? (
                <p>등록된 문의가 없습니다.</p>
            ) : (
                <table>
                    <thead>
                    <tr>
                        <th>번호</th>
                        <th>제목</th>
                        <th>작성자</th>
                        <th>상태</th>
                        <th>등록일</th>
                        <th>수정일</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedInquiries.map((inquiry) => (
                        <tr
                            key={inquiry.inquiryId}
                            onClick={() => navigate(`/inquiries/${inquiry.inquiryId}`)}
                        >
                            <td>{inquiry.inquiryId}</td>
                            <td>{inquiry.inquiryTitle}</td>
                            <td>{inquiry.memberNickname}</td>
                            <td>{inquiry.inquiryStatus}</td>
                            <td>{new Date(inquiry.inquiryCreateDate).toLocaleDateString()}</td>
                            <td>{new Date(inquiry.inquiryUpdateDate).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default InquiryListPage;
