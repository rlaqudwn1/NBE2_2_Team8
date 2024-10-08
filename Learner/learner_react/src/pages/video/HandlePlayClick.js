import axios from "axios";

const extractVideoId = (url) => {
    const regex = /[?&]v=([^&#]*)/;
    const match = url.match(regex);
    return match ? match[1] : null;
};

export const handlePlayClick = async (courseId, video, navigate, setError) => {
    try {
        const memberId = localStorage.getItem('memberId');
        const response = await axios.get(`http://localhost:8080/course/${courseId}/purchase?memberId=${memberId}`,{ withCredentials: true });

        if (response.data) {
            const youtubeId = extractVideoId(video.url);
            navigate(`/video/${video.video_Id}/play`, {
                state: {
                    videoEntityId: video.video_Id,
                    youtubeId: youtubeId,
                    courseId: courseId  // courseId를 state에 추가
                }
            });
        } else {
            window.alert("이 강의를 구매하지 않았습니다. 주문 페이지로 이동합니다.");
            navigate('/orders');
        }
    } catch (error) {
        console.error("구매 확인 중 오류 발생:", error);
        setError("구매 확인에 실패했습니다.");
    }
};
