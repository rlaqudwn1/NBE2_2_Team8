import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Video_Url = "http://localhost:8080/video";

const AddVideo = ({ courseId }) => {
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [description, setDescription] = useState("");
    const [totalVideoDuration, setTotalVideoDuration] = useState(0);
    const [currentVideoTime, setCurrentVideoTime] = useState(0);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(Video_Url, {
                title,
                url,
                description,
                course_Id: courseId,
                totalVideoDuration,
                currentVideoTime
            });
            navigate(`/videos/${courseId}`); // 비디오 목록으로 이동
        } catch (error) {
            console.error("비디오 추가 중 오류 발생:", error);
        }
    };

    return (
        <FormContainer>
            <h2>비디오 추가</h2>
            <form onSubmit={handleSubmit}>
                <Label>
                    제목:
                    <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </Label>
                <Label>
                    URL:
                    <Input type="text" value={url} onChange={(e) => setUrl(e.target.value)} required />
                </Label>
                <Label>
                    설명:
                    <Input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
                </Label>
                <Label>
                    전체 동영상 시간:
                    <Input type="number" value={totalVideoDuration} onChange={(e) => setTotalVideoDuration(e.target.value)} />
                </Label>
                <Label>
                    현재 동영상 시간:
                    <Input type="number" value={currentVideoTime} onChange={(e) => setCurrentVideoTime(e.target.value)} />
                </Label>
                <Button type="submit">추가</Button>
            </form>
        </FormContainer>
    );
};

// 스타일 컴포넌트들
const FormContainer = styled.div`
    max-width: 400px;
    margin: 0 auto;
    padding: 2rem;
    background: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Label = styled.label`
    display: block;
    margin-bottom: 0.5rem;
`;

const Input = styled.input`
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
`;

const Button = styled.button`
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

export default AddVideo;
