import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

const Course_Url = "http://localhost:8080/course";

const CourseUpdate = () => {
    const { courseId } = useParams();
    const [courseName, setCourseName] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await axios.get(`${Course_Url}/${courseId}`,{ withCredentials: true });
                setCourseName(response.data.courseName);
            } catch (err) {
                setError("강좌를 불러오는 데 실패했습니다.");
            }
        };
        fetchCourse();
    }, [courseId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(Course_Url, { courseId, courseName });
            navigate("/course/list");
        } catch (err) {
            setError("강좌 수정에 실패했습니다.");
        }
    };

    return (
        <Container>
            <h2>강좌 수정</h2>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <form onSubmit={handleSubmit}>
                <Label>
                    강좌 이름:
                    <Input type="text" value={courseName} onChange={(e) => setCourseName(e.target.value)} required />
                </Label>
                <Button type="submit">수정</Button>
            </form>
        </Container>
    );
};

export default CourseUpdate;

const Container = styled.div`
    max-width: 400px;
    margin: 0 auto;
    padding: 2rem;
    background: #f9f9f9;
    border-radius: 8px;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 1rem;
`;

const Input = styled.input`
    width: 100%;
    padding: 0.5rem;
    margin-top: 0.5rem;
`;

const Button = styled.button`
    padding: 0.5rem 1rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
`;

const ErrorMessage = styled.p`
    color: red;
    font-weight: bold;
`;
