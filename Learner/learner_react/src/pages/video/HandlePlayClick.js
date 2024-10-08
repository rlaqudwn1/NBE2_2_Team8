import axios from "axios";

const extractVideoId = (url) => {
    const regex = /[?&]v=([^&#]*)/;
    const match = url.match(regex);
    return match ? match[1] : null;
};

export const handlePlayClick = async (courseId, video, navigate, setError) => {
    try {
        // 실제 로그인된 사용자의 ID 가져오기
        const memberId = localStorage.getItem('memberId');
        const response = await axios.get(`http://localhost:8080/course/${courseId}/purchase?memberId=${memberId}`);

        if (response.data) {
            // 구매한 경우 - 비디오 재생 페이지로 이동
            const youtubeId = extractVideoId(video.url);
            navigate(`/video/${video.video_Id}/play`, {
                state: { videoEntityId: video.video_Id, youtubeId: youtubeId }
            });
        } else {
            // 구매하지 않은 경우 - 경고창을 띄우고 주문 페이지로 이동
            window.alert("이 강의를 구매하지 않았습니다. 주문 페이지로 이동합니다.");
            navigate('/orders');
        }
    } catch (error) {
        console.error("구매 확인 중 오류 발생:", error);
        setError("구매 확인에 실패했습니다.");
    }
};
