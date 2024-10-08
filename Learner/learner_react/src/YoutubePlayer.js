import { useEffect, useRef, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

const YoutubePlayer = () => {
    const { videoId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const playerRef = useRef(null);
    const [totalDuration, setTotalDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [courseVideos, setCourseVideos] = useState([]);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(true);
    const [playerReady, setPlayerReady] = useState(false);
    const timerRef = useRef(null);

    const videoEntityId = location.state?.videoEntityId;
    const youtubeId = location.state?.youtubeId;
    const courseId = location.state?.courseId;

    const embedUrl = `https://www.youtube.com/embed/${youtubeId}?enablejsapi=1`;

    useEffect(() => {
        const fetchCourseVideos = async () => {
            if (!courseId) {
                console.error("courseId is missing!");
                return;
            }

            setIsLoading(true);
            try {
                const response = await axios.get(`http://localhost:8080/course/video/${courseId}`,{ withCredentials: true });
                const videos = response.data;
                setCourseVideos(videos);

                // 현재 비디오의 인덱스 찾기
                const index = videos.findIndex(v => v.video_Id === parseInt(videoId));
                setCurrentVideoIndex(index);
            } catch (error) {
                console.error("강의 목록 가져오기 실패:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourseVideos();
    }, [courseId, videoId]);

    useEffect(() => {
        if (videoId) {
            fetchVideoDuration(videoId).then(duration => {
                setTotalDuration(duration);
                console.log(`동영상 전체 시간: ${duration}초`);
                sendTotalDuration(duration);
            });
        }
    }, [videoId]);

    const fetchVideoDuration = async (videoId) => {
        const apiKey = "AIzaSyDoEwQOJ6Igsm9dCnk1b1y1sqzG3qdoEw0";
        const url = `https://www.googleapis.com/youtube/v3/videos?id=${youtubeId}&key=${apiKey}&part=contentDetails`;

        try {
            const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`비디오 길이 가져오기 오류: ${response.status} ${response.statusText}`);
                }
            const data = await response.json();
            if (data.items && data.items.length > 0) {
                const duration = data.items[0].contentDetails.duration;
                return convertISO8601ToSeconds(duration);
            } else {
                    throw new Error("비디오를 찾을 수 없습니다.");
                }
        } catch (error) {
            console.error(error);
        }
    };

    const convertISO8601ToSeconds = (duration) => {
        const regex = /PT(\d+H)?(\d+M)?(\d+S)?/;
        const matches = regex.exec(duration);

        const hours = parseInt(matches[1]) || 0;
        const minutes = parseInt(matches[2]) || 0;
        const seconds = parseInt(matches[3]) || 0;

        return hours * 3600 + minutes * 60 + seconds;
    };

    // YouTube IFrame API 초기화
    useEffect(() => {
        let player = null;

        const initializeYouTubePlayer = () => {
            if (window.YT && window.YT.Player && youtubeId) {
                player = new window.YT.Player('youtube-player', {
                    videoId: youtubeId,
                    events: {
                        onReady: onPlayerReady,
                        onStateChange: onPlayerStateChange,
                    },
                });
                playerRef.current = player;
            }
        };

        // YouTube IFrame API 스크립트 로드
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';

            window.onYouTubeIframeAPIReady = () => {
                initializeYouTubePlayer();
            };

            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
            initializeYouTubePlayer();
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (player) {
                player.destroy();
            }
        };
    }, [youtubeId]);

    const onPlayerReady = (event) => {
        setPlayerReady(true);
        event.target.playVideo();

        // 타이머 설정 전에 이전 타이머 제거
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        // 현재 시간 즉시 업데이트
        getCurrentTime();

        // 새로운 타이머 설정
        timerRef.current = setInterval(getCurrentTime, 1000);
    };

    const onPlayerStateChange = (event) => {
        if (event.data === window.YT.PlayerState.PLAYING) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            timerRef.current = setInterval(getCurrentTime, 1000);
        } else if (event.data === window.YT.PlayerState.PAUSED ||
            event.data === window.YT.PlayerState.ENDED) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const getCurrentTime = () => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
            const time = playerRef.current.getCurrentTime();
            setCurrentTime(time);

            fetch('http://localhost:8080/video/savePlayTime', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    videoId: videoEntityId,
                    currentTime: time
                }),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('현재 재생 시간 전송 성공:', data);
                })
                .catch((error) => {
                    console.error('오류:', error);
                });
        }
    };

    const sendTotalDuration = (duration) => {
        fetch('http://localhost:8080/video/savePlayTime', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                videoId: videoEntityId,
                totalDuration: duration
            }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('전체 동영상 시간 전송 성공:', data);
            })
            .catch((error) => {
                console.error('오류:', error);
            });
    };

    const handlePrevVideo = async () => {
        if (isLoading || courseVideos.length === 0 || currentVideoIndex <= 0) return;

        const prevVideo = courseVideos[currentVideoIndex - 1];
        const prevYoutubeId = extractVideoId(prevVideo.url);

        try {
            const memberId = localStorage.getItem('memberId');
            const response = await axios.get(
                `http://localhost:8080/course/${courseId}/purchase?memberId=${memberId}`
            );

            if (response.data) {
                navigate(`/video/${prevVideo.video_Id}/play`, {
                    state: {
                        videoEntityId: prevVideo.video_Id,
                        youtubeId: prevYoutubeId,
                        courseId: courseId
                    }
                });
            } else {
                alert("이 강의를 구매하지 않았습니다. 주문 페이지로 이동합니다.");
                navigate('/orders');
            }
        } catch (error) {
            console.error("구매 확인 중 오류 발생:", error);
        }
    };

    const handleNextVideo = async () => {
        if (isLoading || courseVideos.length === 0 || currentVideoIndex >= courseVideos.length - 1) return;

        const nextVideo = courseVideos[currentVideoIndex + 1];
        const nextYoutubeId = extractVideoId(nextVideo.url);

        try {
            const memberId = localStorage.getItem('memberId');
            const response = await axios.get(
                `http://localhost:8080/course/${courseId}/purchase?memberId=${memberId}`
            );

            if (response.data) {
                navigate(`/video/${nextVideo.video_Id}/play`, {
                    state: {
                        videoEntityId: nextVideo.video_Id,
                        youtubeId: nextYoutubeId,
                        courseId: courseId
                    }
                });
            } else {
                alert("이 강의를 구매하지 않았습니다. 주문 페이지로 이동합니다.");
                navigate('/orders');
            }
        } catch (error) {
            console.error("구매 확인 중 오류 발생:", error);
        }
    };

    const extractVideoId = (url) => {
        const regex = /[?&]v=([^&#]*)/;
        const match = url.match(regex);
        return match ? match[1] : null;
    };

    if (!courseId) {
        return <div>잘못된 접근입니다. courseId가 필요합니다.</div>;
    }

    return (
        <PlayerContainer>
            <iframe
                id="youtube-player"
                width="560"
                height="315"
                src={embedUrl}
                title="YouTube Video"
                frameBorder="0"
                allowFullScreen
            ></iframe>
            <div id="youtube-player"></div>
            <InfoContainer>
                <TimeInfo>
                    <div>전체 동영상 길이: {totalDuration}초</div>
                    <div>현재 동영상 길이: {currentTime.toFixed(2)}초</div>
                </TimeInfo>

                <NavigationContainer>
                    <NavButton
                        onClick={handlePrevVideo}
                        disabled={isLoading || currentVideoIndex <= 0}
                    >
                        {isLoading ? "로딩 중..." : currentVideoIndex <= 0 ? "이전 강의 없음" : "이전 강의"}
                    </NavButton>

                    <VideoProgress>
                        {isLoading ? "로딩 중..." : `${currentVideoIndex + 1} / ${courseVideos.length}`}
                    </VideoProgress>

                    <NavButton
                        onClick={handleNextVideo}
                        disabled={isLoading || currentVideoIndex >= courseVideos.length - 1}
                    >
                        {isLoading ? "로딩 중..." : currentVideoIndex >= courseVideos.length - 1 ? "다음 강의 없음" : "다음 강의"}
                    </NavButton>
                </NavigationContainer>
            </InfoContainer>
        </PlayerContainer>
    );
};

const PlayerContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
`;

const InfoContainer = styled.div`
    width: 1280px;
    margin-top: 20px;
`;

const TimeInfo = styled.div`
    text-align: center;
    margin-bottom: 20px;
`;

const NavigationContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
`;

const NavButton = styled.button`
    padding: 10px 20px;
    background-color: ${props => props.disabled ? '#ccc' : '#007bff'};
    color: white;
    border: none;
    border-radius: 5px;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    transition: background-color 0.3s;

    &:hover:not(:disabled) {
        background-color: #0056b3;
    }
`;

const VideoProgress = styled.div`
    font-size: 16px;
    font-weight: bold;
`;

export default YoutubePlayer;