import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const OrderCreate = () => {
    const [orderItems, setOrderItems] = useState([{ courseId: "", price: "" }]);
    const [courses, setCourses] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const memberId = localStorage.getItem("memberId");

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get("http://localhost:8080/course/list");
                setCourses(response.data);
            } catch (error) {
                console.error("Error fetching courses:", error);
                setError("강의 목록을 가져오는 데 실패했습니다.");
            }
        };

        fetchCourses();
    }, []);

    const handleChange = (index, event) => {
        const values = [...orderItems];
        values[index][event.target.name] = event.target.value;
        setOrderItems(values);
    };

    const handleAddItem = () => {
        setOrderItems([...orderItems, { courseId: "", price: "" }]);
    };

    const handleRemoveItem = (index) => {
        const values = [...orderItems];
        values.splice(index, 1);
        setOrderItems(values);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post(`http://localhost:8080/order/${memberId}`, {
                memberId: memberId,
            },{
                withCredentials: true, // 쿠키 포함 설정
            });
            setError("주문이 성공적으로 생성되었습니다!");

            setTimeout(() => {
                navigate("/orders");
            }, 2000);
        } catch (error) {
            console.error("Error creating order:", error);
            setError("주문 생성에 실패했습니다.");
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <OrderCreateContainer>
            <h2>주문 생성</h2>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <BackButton onClick={handleBack}>뒤로가기</BackButton>
            <form onSubmit={handleSubmit}>
                {orderItems.map((item, index) => (
                    <ItemContainer key={index}>
                        <Select
                            name="courseId"
                            value={item.courseId}
                            onChange={(event) => {
                                handleChange(index, event);
                                const selectedCourse = courses.find(course => course.courseId === event.target.value);
                                if (selectedCourse) {
                                    item.price = selectedCourse.coursePrice;
                                }
                            }}
                            required
                        >
                            <option value="">강의 선택</option>
                            {courses.map((course) => (
                                <option key={course.courseId} value={course.courseId}>
                                    {course.courseName} - {course.coursePrice} 원
                                </option>
                            ))}
                        </Select>
                        <PriceDisplay>{item.price} 원</PriceDisplay>
                        <RemoveButton type="button" onClick={() => handleRemoveItem(index)}>
                            삭제
                        </RemoveButton>
                    </ItemContainer>
                ))}
                <AddButton type="button" onClick={handleAddItem}>
                    항목 추가
                </AddButton>
                <SubmitButton type="submit">주문 생성</SubmitButton>
            </form>
        </OrderCreateContainer>
    );
};

export default OrderCreate;

const OrderCreateContainer = styled.div`
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ItemContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
`;

const Select = styled.select`
    flex: 1;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
    transition: border 0.3s;

    &:focus {
        border-color: #007bff;
        outline: none;
    }
`;

const PriceDisplay = styled.span`
    font-size: 16px;
    margin-left: 10px;
`;

const RemoveButton = styled.button`
    padding: 8px 12px;
    background-color: #ff4d4d;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
        background-color: #ff1a1a;
    }
`;

const AddButton = styled.button`
    margin-top: 10px;
    padding: 8px 12px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
        background-color: #218838;
    }
`;

const SubmitButton = styled.button`
    margin-top: 10px;
    padding: 8px 12px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;

    &:hover {
        background-color: #0056b3;
    }
`;

const BackButton = styled.button`
    margin-bottom: 15px;
    padding: 10px;
    background-color: #6c757d;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;

    &:hover {
        background-color: #5a6268;
    }
`;

const ErrorMessage = styled.p`
    color: red;
    font-weight: bold;
    margin-bottom: 15px;
`;
