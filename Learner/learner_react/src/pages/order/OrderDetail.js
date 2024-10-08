import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";

const OrderDetail = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // useNavigate 훅 사용

    useEffect(() => {
        const fetchOrderDetail = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`http://localhost:8080/order/${orderId}`,{ withCredentials: true });
                setOrder(response.data);
            } catch (error) {
                console.error("주문 세부정보를 가져오는 중 오류 발생:", error);
                setError("주문 세부정보를 가져오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetail();
    }, [orderId]);

    if (loading) return <p>로딩 중...</p>;
    if (error) return <p>{error}</p>;
    if (!order) return <p>주문이 없습니다.</p>;

    const handleBackClick = () => {
        navigate(-1); // 이전 페이지로 이동
    };

    return (
        <OrderDetailContainer>
            <h2>주문 상세보기</h2>
            <p>주문 ID: {order.orderId}</p>
            <p>주문 상태: {order.orderStatus}</p>
            <p>총 금액: {order.totalPrice} 원</p>
            <p>주문 항목:</p>
            <ul>
                {order.orderItemDTOList.map((item, index) => (
                    <li key={index}>
                        강의 ID: {item.courseId}, 가격: {item.price} 원
                    </li>
                ))}
            </ul>
            <BackButton onClick={handleBackClick}>뒤로가기</BackButton>
        </OrderDetailContainer>
    );
};

export default OrderDetail;

const OrderDetailContainer = styled.div`
    max-width: 600px;
    margin: 0 auto;
    padding: 1rem;
`;

const BackButton = styled.button`
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
        background-color: #0056b3;
    }
`;
