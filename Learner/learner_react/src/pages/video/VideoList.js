import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import { handlePlayClick } from "./HandlePlayClick";

const Video_Url = "http://localhost:8080/video";
const Course_Url = "http://localhost:8080/course";

const VideoList = () => {
    const { courseId } = useParams();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVideos = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${Course_Url}/video/${courseId}`);
                setVideos(response.data);
            } catch (error) {
                console.error("비디오 목록 가져오는 중 오류 발생:", error);
                setError("비디오 목록을 가져오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, [courseId]);

    const extractVideoId = (url) => {
        const regex = /[?&]v=([^&#]*)/;
        const match = url.match(regex);
        return match ? match[1] : null; // 유튜브 비디오 ID 반환
    };

    const handleDeleteClick = async (videoId) => {
        if (window.confirm("정말로 이 비디오를 삭제하시겠습니까?")) {
            try {
                await axios.delete(`${Video_Url}/${videoId}`);
                setVideos(videos.filter(video => video.video_Id !== videoId));
            } catch (error) {
                console.error("비디오 삭제 중 오류 발생:", error);
                setError("비디오를 삭제하는 데 실패했습니다.");
            }
        }
    };

    if (loading) return <LoadingMessage>로딩 중...</LoadingMessage>;
    if (error) return <ErrorMessage>{error}</ErrorMessage>;

    return (
        <VideoListContainer>
            <Header>비디오 목록</Header>
            <Link to={`/video/create/${courseId}`}>
                <StyledButton primary>비디오 추가</StyledButton>
            </Link>
            {videos.length > 0 ? (
                videos.map(video => {
                    const youtubeId = extractVideoId(video.url); // URL에서 유튜브 ID 추출
                    return (
                        <VideoItem key={video.video_Id}>
                            <VideoDetails>
                                <p>비디오 ID: <strong>{video.video_Id}</strong></p>
                                <p>비디오 제목: <strong>{video.title}</strong></p>
                            </VideoDetails>
                            <ButtonContainer>
                                <Link to={`/video/update/${video.video_Id}`}>
                                    <StyledButton secondary>수정</StyledButton>
                                </Link>
                                <StyledButton onClick={() => handlePlayClick(courseId, video, navigate, setError)} secondary>
                                    재생
                                </StyledButton>
                                <StyledButton onClick={() => handleDeleteClick(video.video_Id)} secondary>삭제</StyledButton>
                            </ButtonContainer>
                        </VideoItem>
                    );
                })
            ) : (
                <p>비디오가 없습니다.</p>
            )}
        </VideoListContainer>
    );
};

// 스타일 컴포넌트들
const VideoListContainer = styled.div`
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    background: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Header = styled.h2`
    text-align: center;
    color: #333;
    margin-bottom: 1.5rem;
`;

const LoadingMessage = styled.p`
    text-align: center;
    color: #007bff;
`;

const ErrorMessage = styled.p`
    text-align: center;
    color: red;
    font-weight: bold;
`;

const VideoItem = styled.div`
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 1rem;
    background-color: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const VideoDetails = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
`;

const StyledButton = styled.button`
    padding: 0.5rem 1rem;
    background-color: ${props => (props.primary ? "#007bff" : props.secondary ? "#dc3545" : "#007bff")};
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
        background-color: ${props => (props.primary ? "#0056b3" : props.secondary ? "#c82333" : "#0056b3")};
    }
`;

export default VideoList;
