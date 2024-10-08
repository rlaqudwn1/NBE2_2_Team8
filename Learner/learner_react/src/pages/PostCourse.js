import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const PostCourse = () => {
    const [courseName, setCourseName] = useState("");
    const [courseDescription, setCourseDescription] = useState("");
    const [courseLevel, setCourseLevel] = useState(0);
    const [courseAttribute, setCourseAttribute] = useState("");
    const [coursePrice, setCoursePrice] = useState(0);
    const [sale, setSale] = useState(false);
    const [nickname, setNickname] = useState("");
    const navigate = useNavigate();

    // sale 체크박스 핸들러
    const handleSaleChange = (e) => {
        setSale(e.target.checked); // 체크박스의 checked 속성을 boolean으로 사용
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post("http://localhost:8080/course", {
                courseName,
                courseDescription,
                courseLevel: parseInt(courseLevel), // int 타입으로 변환
                courseAttribute,
                coursePrice: parseFloat(coursePrice), // Long 타입으로 변환 (float에서 큰 값으로 변환될 수 있음)
                sale,
                nickname,
            });

            if (response.status === 200) {
                alert("강의가 성공적으로 생성되었습니다.");
                navigate("/courses");
            }
        } catch (error) {
            console.error("강의 생성 실패:", error);
            alert("강의 생성 중 문제가 발생했습니다.");
        }
    };

    return (
        <FormContainer>
            <h2>새 강의 생성</h2>
            <Form onSubmit={handleSubmit}>
                <StyledLabel>강의명</StyledLabel>
                <Input
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="강의명을 입력하세요"
                    required
                />

                <StyledLabel>강사명</StyledLabel>
                <Input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="강사명을 입력하세요"
                    required
                />

                <StyledLabel>강의 설명</StyledLabel>
                <TextArea
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    placeholder="강의 설명을 입력하세요"
                    required
                />

                <StyledLabel>강의 수준 (숫자 입력, 예: 1 = 초급, 2 = 중급, 3 = 고급)</StyledLabel>
                <Input
                    type="number"
                    value={courseLevel}
                    onChange={(e) => setCourseLevel(e.target.value)}
                    placeholder="강의 수준을 입력하세요"
                    required
                />

                <StyledLabel>강의 속성</StyledLabel>
                <Input
                    type="text"
                    value={courseAttribute}
                    onChange={(e) => setCourseAttribute(e.target.value)}
                    placeholder="강의 속성을 입력하세요"
                    required
                />

                <StyledLabel>강의 가격</StyledLabel>
                <Input
                    type="number"
                    value={coursePrice}
                    onChange={(e) => setCoursePrice(e.target.value)}
                    placeholder="강의 가격을 입력하세요"
                    required
                />
                <CheckboxLabel>
                    <input
                        type="checkbox"
                        checked={sale} // 체크박스 상태를 sale에 연결
                        onChange={handleSaleChange}
                    />
                    할인 여부
                </CheckboxLabel>
                <SubmitButton type="submit">강의 생성</SubmitButton>
            </Form>
        </FormContainer>
    );
};

export default PostCourse;

// 스타일 컴포넌트
const FormContainer = styled.div`
    max-width: 800px;
    margin: 50px auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const StyledLabel = styled.label`
    font-size: 1.1rem;
    margin-top: 1.5rem;
`;

const Input = styled.input`
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 1.1rem;
`;

const TextArea = styled.textarea`
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 1.1rem;
    height: 150px;
`;

const CheckboxLabel = styled.label`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.1rem;
`;

const SubmitButton = styled.button`
    padding: 0.75rem 1.5rem;
    background-color: #3cb371;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    &:hover {
        background-color: #2a9d63;
    }
`;
