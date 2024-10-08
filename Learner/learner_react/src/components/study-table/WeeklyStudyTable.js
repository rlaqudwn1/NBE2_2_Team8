import React, { useEffect, useState } from 'react';
import axios from 'axios';

const WeeklyStudyTable = () => {
    const [studyData, setStudyData] = useState([]); // weeklySummary 배열을 저장할 state
    const [totalStudyTime, setTotalStudyTime] = useState(0); // 총 학습 시간
    const [totalCompleted, setTotalCompleted] = useState(0); // 총 완료 수업
    const [currentDate, setCurrentDate] = useState(new Date()); // 현재 주차의 기준 날짜
    const [memberId, setMemberId] = useState(null); // memberId state 추가

    // memberId를 localStorage에서 가져오는 useEffect
    useEffect(() => {
        const storedMemberId = localStorage.getItem('memberId');
        if (storedMemberId) {
            setMemberId(storedMemberId);
        }
    }, []);

    // 데이터 fetch 함수
    const fetchData = async (selectedDate) => { // 주차 변경에 따른 데이터 fetch
        if (!memberId) return; // memberId가 없으면 fetch하지 않음
        try {
            const formattedDate = selectedDate.toISOString().split('T')[0]; // 선택한 날짜를 "YYYY-MM-DD" 형식으로 변환
            const response = await axios.get(`http://localhost:8080/study-tables/${memberId}/weekly-summary?date=${formattedDate}`, { withCredentials: true }); // 날짜를 query parameter로 전송

            const { weeklyStudyTime, weeklyCompleted, weeklySummary } = response.data;
            setTotalStudyTime(weeklyStudyTime); // 총 학습 시간 설정
            setTotalCompleted(weeklyCompleted); // 총 완료한 수업 설정
            setStudyData(weeklySummary); // 주간 학습 데이터 배열 설정
        } catch (error) {
            console.error("데이터를 가져오는 중 오류 발생:", error);
        }
    };

    useEffect(() => {
        fetchData(currentDate); // 현재 날짜로 데이터 fetch
    }, [memberId, currentDate]); // memberId와 currentDate가 변경될 때마다 fetch

    const getColorByCompleted = (completed, date) => {
        const today = new Date();
        const isFutureDate = date > today;

        if (isFutureDate) return 'light-gray'; // 미래 날짜는 연한 회색
        if (completed === 0) return 'default-color';
        else if (completed <= 2) return 'light-green';
        else if (completed <= 5) return 'medium-green';
        else return 'dark-green';
    };

    const handlePreviousWeek = () => {
        const previousWeek = new Date(currentDate);
        previousWeek.setDate(currentDate.getDate() - 7); // 주차를 7일 이전으로 변경
        setCurrentDate(previousWeek); // 선택한 주차로 변경
    };

    const handleNextWeek = () => {
        const nextWeek = new Date(currentDate);
        nextWeek.setDate(currentDate.getDate() + 7); // 주차를 7일 이후로 변경

        // 현재 주차가 오늘 주차일 때 다음 주차로 이동을 막음
        const currentWeek = getWeekInfo(currentDate); // 현재 주차
        const todayWeek = getWeekInfo(new Date()); // 오늘 주차

        if (currentWeek === todayWeek) {
            return; // 현재 주차와 오늘 주차가 같으면 이동하지 않음
        }

        setCurrentDate(nextWeek); // 선택한 주차로 변경
    };

    const getWeekInfo = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        // 현재 날짜가 속한 주차 계산
        const week = Math.ceil((date.getDate() + 1) / 7);
        return `${year}년 ${month}월 ${week}주차`;
    };

    // 특정 날짜의 completed 값을 반환하는 함수
    const getCompletedByDate = (dateString) => {
        const data = studyData.find(([date]) => date === dateString); // 날짜를 비교하여 찾음
        return data ? data[1] : 0; // 해당 날짜에 완료된 수업 수를 반환 (없으면 0)
    };

    return (
        <div className="weekly-study-table">
            <h2>주간 학습</h2>
            <div className="week-navigation">
                <div className="arrow left-arrow" onClick={handlePreviousWeek}>{"<"}</div>
                <span>{getWeekInfo(currentDate)}</span>
                <div className="arrow right-arrow" onClick={handleNextWeek}>{">"}</div>
            </div>

            <div className="circle-area">
                <div className="circle-container">
                    {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => {
                        const date = new Date(currentDate);
                        date.setDate(date.getDate() - date.getDay() + index); // 해당 요일의 날짜 계산
                        const dateString = date.toISOString().split('T')[0]; // "YYYY-MM-DD" 형식으로 변환

                        const isToday = dateString === new Date().toISOString().split('T')[0]; // 오늘 날짜 확인

                        return (
                            <div key={index} className="day-circle-wrapper">
                                <div
                                    className={`circle ${getColorByCompleted(getCompletedByDate(dateString), date)} ${isToday ? 'today-circle' : ''}`}
                                    style={{ transform: isToday ? 'scale(1.3)' : 'scale(1)' }} // 오늘 날짜 원 크기 조절
                                    title={`${day}: ${getCompletedByDate(dateString)} 완료`}
                                />
                                <div className={`day-label ${isToday ? 'today-label' : ''}`}>{day}</div>
                            </div>
                        );

                    })}
                </div>
            </div>
            <div className="summary">
                <h3>완료한 수업: {totalCompleted} 개</h3>
                <h3>학습 시간: {totalStudyTime} 분</h3>
            </div>
        </div>
    );
};

const styles = `
.weekly-study-table {
    text-align: center; /* 텍스트 가운데 정렬 */
    border: 1px solid #e0e0e0; /* 테두리 색상 */
    border-radius: 8px; /* 모서리 둥글기 */
    padding: 20px; /* 내부 여백 */
    width: 500px; /* 전체 폭을 더 넓혀줌 */
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* 그림자 효과 */
    background-color: #ffffff; /* 배경 색상 */
    margin-bottom: 3rem;
}

.circle-area {
    padding-top: 10px; /* 원 영역의 상단 여백을 추가 */
}

.circle-container {
    display: flex; /* 가로 정렬 */
    justify-content: center; /* 가운데 정렬 */
    align-items: flex-end; /* 하단 정렬 */
}

.day-circle-wrapper {
    display: flex;
    flex-direction: column; /* 세로 방향으로 정렬 */
    align-items: center; /* 가운데 정렬 */
    margin: 0 15px; /* 원 간의 간격 */
    position: relative; /* 상대 위치 설정 */
}

.circle {
    width: 40px; /* 원의 크기 유지 */
    height: 40px; /* 원의 크기 유지 */
    border-radius: 50%; /* 원형 */
    display: flex; /* flexbox 설정 */
    justify-content: center; /* 중앙 정렬 */
    align-items: center; /* 중앙 정렬 */
    margin-bottom: 5px; /* 원과 요일 간격 */
}

.default-color {
    background-color: white; /* 기본 색을 흰색으로 변경 */
    border: 1px solid lightgray; /* 흰색 원을 강조하기 위한 테두리 추가 */
}

.light-green {
    background-color: #c6e48b;
    border: 1px solid lightgray;
}

.medium-green {
    background-color: #b2e0b2;
    border: 1px solid lightgray;
}

.dark-green {
    background-color: #7ee6b7;
    border: 1px solid lightgray;
}

.day-label {
    position: absolute; /* 절대 위치 설정 */
    bottom: 45px; /* 원 위쪽으로 이동 */
    font-weight: normal; /* 글씨 두께를 기본으로 변경하여 연하게 설정 */
    font-family: 'Arial', sans-serif; /* 폰트 설정 */
    font-size: 14px; /* 요일 폰트 크기 */
    color: rgba(51, 51, 51, 0.5); /* 연한 회색으로 설정 */
    margin-bottom: 5px; /* 원과 요일 간의 간격 조정 */
}

.summary {
    margin-top: 20px; /* 요약 영역과 원 간격 */
    font-family: 'Arial', sans-serif; /* 폰트 설정 */
}

.summary h3 {
    font-size: 16px; /* 요약 제목 폰트 크기 */
    margin: 5px 0; /* 위 아래 여백 */
}

.light-gray {
    background-color: #f0f0f0; /* 연한 회색 */
    border: 1px solid lightgray;
}

.week-navigation {
    display: flex;
    align-items: center; /* 수직 정렬을 위해 추가 */
    justify-content: space-between; /* 양쪽 화살표를 끝으로 배치 */
    font-size: 24px; /* 글씨 크기를 키우기 위한 조정 */
    margin: 20px 0; /* 상하 여백 조정 */
}

.arrow {
    cursor: pointer;
    padding: 10px; /* 클릭 영역 확대 */
    transition: transform 0.3s; /* 애니메이션 효과 추가 */
}

.arrow:hover {
    transform: scale(1.1); /* 마우스 오버 시 크기 확대 효과 */
}
.today-label {
    font-weight: bold; /* 오늘 날짜의 요일 글씨를 진하게 설정 */
    color: rgba(0, 0, 0, 100%); /* 요일 글씨 색상을 진하게 설정 */
    margin-bottom: 10px; /* 원과 요일 간의 간격 조정 */
}
`;

// 스타일을 <style> 태그로 head에 삽입
const insertCSS = (css) => {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
};

insertCSS(styles); // 스타일 적용

export default WeeklyStudyTable;
