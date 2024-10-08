import { useEffect, useRef, useState } from 'react';
import {useLocation, useParams} from 'react-router-dom';

const YoutubePlayer =() => {
    const { videoId } = useParams();
    const location = useLocation();
    const playerRef = useRef(null);
    const [totalDuration, setTotalDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const videoEntityId = location.state.videoEntityId; // 비디오 엔티티 ID
    const youtubeId = location.state.youtubeId; // 유튜브 비디오 ID

    const embedUrl = `https://www.youtube.com/embed/${youtubeId}?enablejsapi=1`;

    useEffect(() => {
        if (videoId) {
            fetchVideoDuration(videoId).then(duration => {
                setTotalDuration(duration);
                console.log(`동영상 전체 시간: ${duration}초`);
                sendTotalDuration(duration); // 전체 동영상 시간을 백엔드로 전송
            });
        }
    }, [videoId]);

    const fetchVideoDuration = (videoId) => {
        const apiKey = "AIzaSyDoEwQOJ6Igsm9dCnk1b1y1sqzG3qdoEw0"; // 여기에 유효한 API 키를 입력하세요
        const url = `https://www.googleapis.com/youtube/v3/videos?id=${youtubeId}&key=${apiKey}&part=contentDetails`;

        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`비디오 길이 가져오기 오류: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(data); // 응답 확인
                if (data.items && data.items.length > 0) {
                    const duration = data.items[0].contentDetails.duration;
                    return convertISO8601ToSeconds(duration);
                } else {
                    throw new Error("비디오를 찾을 수 없습니다.");
                }
            });
    };

    const convertISO8601ToSeconds = (duration) => {
        const regex = /PT(\d+H)?(\d+M)?(\d+S)?/;
        const matches = regex.exec(duration);

        const hours = parseInt(matches[1]) || 0;
        const minutes = parseInt(matches[2]) || 0;
        const seconds = parseInt(matches[3]) || 0;

        return hours * 3600 + minutes * 60 + seconds;
    };

    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(script);

        window.onYouTubeIframeAPIReady = () => {
            playerRef.current = new window.YT.Player('youtube-player', {
                events: {
                    'onReady': onPlayerReady,
                },
            });
        };

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const onPlayerReady = (event) => {
        event.target.playVideo();
        setInterval(() => {
            getCurrentTime();
        }, 5000);
    };

    const getCurrentTime = () => {
        if (playerRef.current) {
            const currentTime = playerRef.current.getCurrentTime();
            setCurrentTime(currentTime);

            fetch('http://localhost:8080/video/savePlayTime', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    videoId: videoEntityId, // 비디오 엔티티의 ID로 수정
                    currentTime: currentTime
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
                videoId: videoEntityId, // 비디오 엔티티의 ID로 수정
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

    return (
        <div>
            <iframe
                id="youtube-player"
                width="560"
                height="315"
                src={embedUrl}
                title="YouTube Video"
                frameBorder="0"
                allowFullScreen
            ></iframe>
            <div>전체 동영상 길이: {totalDuration}초</div>
            <div>현재 동영상 길이: {currentTime.toFixed(2)}초</div>
        </div>
    );
};

export default YoutubePlayer;
