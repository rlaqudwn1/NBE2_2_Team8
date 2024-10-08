import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import CourseNewsList from "../CourseNewsList";
import CourseReview from "../course-review/CourseReview";
import VideoList from "../video/VideoList"; // VideoList 컴포넌트 임포트


// 기본 이미지 경로
const defaultImage = "/images/course_default_img.png";

const CourseDetail = () => {
    const { courseId } = useParams(); // URL에서 courseId 가져오기
    const navigate = useNavigate(); //useNavigate 추가
    const [course, setCourse] = useState(null);
    const [activeTab, setActiveTab] = useState("curriculum");
    const [inquiries, setInquiries] = useState([]); // 강의 문의 데이터를 저장할 상태
    const [selectedInquiry, setSelectedInquiry] = useState(null); // 선택된 강의 문의 상세 데이터
    const [answers, setAnswers] = useState([]); // 강의 문의 답변 데이터
    const [newAnswer, setNewAnswer] = useState(""); // 답변 입력 칸 데이터
    const [loading, setLoading] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false); // 상세 로딩 상태

    useEffect(() => {
        // courseId를 이용해서 해당 강의 정보를 가져옴
        axios.get(`http://localhost:8080/course/${courseId}`,{ withCredentials: true })
            .then((response) => {
                setCourse(response.data); // 강의 데이터 설정
            })
            .catch((error) => {
                console.error("Error fetching the course data:", error);
            });
    }, [courseId]);

    useEffect(() => {
        if (activeTab === "questions") {
            // 강의 문의 탭이 선택될 때 강의 문의 데이터 가져오기
            setLoading(true);
            axios.get(`http://localhost:8080/course-inquiry?courseId=${courseId}`)
                .then((response) => {
                    setInquiries(response.data); // 문의 데이터를 저장
                    setLoading(false);
                })
                .catch((error) => {
                    console.error("Error fetching the course inquiries:", error);
                    setLoading(false);
                });
        }
    }, [activeTab, courseId]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSelectedInquiry(null); // 탭 변경 시 문의 상세 정보 초기화
    };

    const handleInquiryClick = (inquiryId) => {
        setLoadingDetail(true);
        // 강의 문의 상세 정보 및 답변 가져오기
        axios.get(`http://localhost:8080/course-inquiry/${inquiryId}`)
            .then((response) => {
                setSelectedInquiry(response.data); // 선택된 문의의 상세 데이터 저장
                // 강의 문의 답변 가져오기
                return axios.get(`http://localhost:8080/course-answer/${inquiryId}`);
            })
            .then((response) => {
                setAnswers(response.data); // 답변 데이터 저장
                setLoadingDetail(false);
            })
            .catch((error) => {
                console.error("Error fetching inquiry details or answers:", error);
                setLoadingDetail(false);
            });
    };

    const handleAnswerSubmit = () => {
        if (!newAnswer.trim()) return;
        // 답변을 POST로 전송
        axios.post("http://localhost:8080/course-answer", {
            inquiryId: selectedInquiry.inquiryId,
            answerContent: newAnswer
        })
            .then(() => {
                // 답변이 성공적으로 등록되면 답변 목록을 업데이트
                return axios.get(`http://localhost:8080/course-answer/${selectedInquiry.inquiryId}`);
            })
            .then((response) => {
                setAnswers(response.data); // 새로운 답변 목록으로 업데이트
                setNewAnswer(""); // 입력란 초기화
            })
            .catch((error) => {
                console.error("Error posting the answer:", error);
            });
    };

    return (
        <DetailPage>
            {/* 강의 상세 정보 */}
            {course && (
                <CourseInfo>
                    <CourseImage src={defaultImage} alt="Course Image"/>
                    <CourseDetails>
                        <CourseTitle>{course.courseName}</CourseTitle>
                        <CourseDescription>{course.courseDescription}</CourseDescription>
                        <Instructor>
                            <InstructorName>강사 : {course.memberNickname}</InstructorName>
                            <StyledButton onClick={() => navigate(`/members/instructor/${course.memberNickname}`)}>강사 페이지</StyledButton>
                        </Instructor>

                    </CourseDetails>
                </CourseInfo>
            )}

            {/* 구분선 */}
            <Separator/>

            {/* 탭 메뉴 */}
            <TabMenu>
                <Tab onClick={() => handleTabChange("curriculum")} active={activeTab === "curriculum"}>
                    커리큘럼
                </Tab>
                <Tab onClick={() => handleTabChange("reviews")} active={activeTab === "reviews"}>
                    수강평
                </Tab>
                <Tab onClick={() => handleTabChange("questions")} active={activeTab === "questions"}>
                    강의 문의
                </Tab>
                <Tab onClick={() => handleTabChange("news")} active={activeTab === "news"}>
                    새소식
                </Tab>
            </TabMenu>

            <Separator/>

            {/* 탭에 따라 내용 변경 */}
            <TabContent>
                {activeTab === "curriculum" && <VideoList /> } {/* VideoList 컴포넌트 추가 */}
                {activeTab === "reviews" && (
                    <>
                        <CourseReview courseId={courseId}/>
                    </>
                )}

                {activeTab === "questions" && (
                    <>
                        {loading ? (
                            <p>로딩 중...</p>
                        ) : (
                            <>
                                <ButtonContainer>
                                    {selectedInquiry ? (
                                        <WriteButton onClick={() => setSelectedInquiry(null)}>이전 목록으로</WriteButton> // 이전 목록으로 버튼
                                    ) : (
                                        <WriteButton onClick={() => navigate(`/courses/${courseId}/post`)}>글
                                            작성하기</WriteButton> // 글 작성하기 버튼
                                    )}
                                </ButtonContainer>

                                {selectedInquiry ? (
                                    loadingDetail ? (
                                        <p>문의 상세 정보를 로딩 중입니다...</p>
                                    ) : (
                                        <>
                                            <InquiryDetail>
                                                <h3>{selectedInquiry.inquiryTitle}</h3>
                                                <p><strong>문의 내용:</strong> {selectedInquiry.inquiryContent}</p>
                                                <p><strong>작성자:</strong> {selectedInquiry.memberId}</p>
                                                <p>
                                                    <strong>작성일:</strong> {new Date(selectedInquiry.createdDate).toLocaleDateString()}
                                                </p>
                                            </InquiryDetail>

                                            {/* 답변 목록 */}
                                            <AnswerList>
                                                <h4>답변 목록</h4>
                                                {answers.length > 0 ? (
                                                    answers.map((answer) => (
                                                        <AnswerItem key={answer.answerId}>
                                                            <p><strong>답변 내용:</strong> {answer.answerContent}</p>
                                                            <p>
                                                                <strong>작성일:</strong> {new Date(answer.createdDate).toLocaleDateString()}
                                                            </p>
                                                        </AnswerItem>
                                                    ))
                                                ) : (
                                                    <p>답변이 없습니다.</p>
                                                )}
                                            </AnswerList>

                                            {/* 답변 작성 폼 */}
                                            <AnswerForm>
                                                <textarea
                                                    value={newAnswer}
                                                    onChange={(e) => setNewAnswer(e.target.value)}
                                                    placeholder="답변 내용을 입력하세요"
                                                />
                                                <SubmitButton onClick={handleAnswerSubmit}>답변 달기</SubmitButton>
                                            </AnswerForm>
                                        </>
                                    )
                                ) : (
                                    inquiries.length > 0 ? (
                                        <InquiryList>
                                            {inquiries.map((inquiry) => (
                                                <InquiryItem key={inquiry.inquiryId}
                                                             onClick={() => handleInquiryClick(inquiry.inquiryId)}>
                                                    <p><strong>문의 제목:</strong> {inquiry.inquiryTitle}</p>
                                                    <p><strong>작성자:</strong> {inquiry.memberId}</p>
                                                    <p>
                                                        <strong>작성일:</strong> {new Date(inquiry.createdDate).toLocaleDateString()}
                                                    </p>
                                                </InquiryItem>
                                            ))}
                                        </InquiryList>
                                    ) : (
                                        <p>문의가 없습니다.</p>
                                    )
                                )}
                            </>
                        )}
                    </>
                )}
                {activeTab === "news" && <CourseNewsList courseId={courseId}/>}
            </TabContent>
        </DetailPage>
    );
};

export default CourseDetail;

// 스타일 컴포넌트들

const DetailPage = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
`;

const CourseInfo = styled.div`
    display: flex;
    margin-top: 2rem;
`;

const CourseImage = styled.img`
    width: 250px;
    height: 150px;
    object-fit: cover;
    border-radius: 10px;
`;

const CourseDetails = styled.div`
    margin-left: 2rem;
    display: flex;
    flex-direction: column;
`;

const CourseTitle = styled.h2`
    font-size: 1.8rem;
`;

const CourseDescription = styled.p`
    margin: 0.5rem 0;
`;

const Instructor = styled.p`
    font-size: 1rem;
    color: #555;
    margin-top: 1rem; /* 위쪽 여백 추가 */
    display: flex;
    align-items: center; /* 세로 정렬 */
`;

const InstructorName = styled.span`
    margin-right: 1rem; /* 버튼과의 간격 추가 */
`;

const TabMenu = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
`;

const Tab = styled.button`
    padding: 1rem 2rem;
    background-color: ${(props) => (props.active ? "#3cb371" : "#f9f9f9")};  /* 기본 배경색 설정 */
    border: none;
    border-bottom: ${(props) => (props.active ? "2px solid #3cb371" : "2px solid #ddd")};  /* 탭 활성화 시 구분선 */
    font-size: 1rem;
    color: ${(props) => (props.active ? "#fff" : "#333")};  /* 활성화된 탭의 글자색 */
    cursor: pointer;
    &:hover {
        background-color: #3cb371;  /* 호버 시 배경색 변경 */
        color: #fff;  /* 호버 시 글자색 변경 */
        border-bottom: 2px solid #3cb371;
    }
`;


const TabContent = styled.div`
    margin-top: 1rem;
    padding: 1rem;
    background-color: #f9f9f9;
    border-radius: 10px;
`;

const Separator = styled.div`
    height: 1px;
    background-color: #ddd;
    margin: 0; /* 구분선 간격 조정 */
`;

const InquiryList = styled.div`
    margin-top: 1rem;
`;

const InquiryItem = styled.div`
    margin-bottom: 1rem;
    padding: 1rem;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
`;

const InquiryDetail = styled.div`
    margin-top: 1rem;
    padding: 1.5rem;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const AnswerList = styled.div`
    margin-top: 1.5rem;
`;

const AnswerItem = styled.div`
    margin-bottom: 1rem;
    padding: 1rem;
    background-color: #f9f9f9;
    border-radius: 5px;
    border: 1px solid #ddd;
`;

const AnswerForm = styled.div`
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 20px;  /* 내부 여백 추가 */
    background-color: #f9f9f9;  /* 배경색 설정 */
    border-radius: 10px;  /* 모서리 둥글게 */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);  /* 그림자 추가 */
    max-width: 800px;  /* 최대 너비 설정 */
    width: 100%;  /* 너비를 100%로 설정 */
    box-sizing: border-box;  /* 패딩 포함한 너비 계산 */
`;

const SubmitButton = styled.button`
    padding: 0.75rem 1.5rem;
    background-color: #3cb371;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    &:hover {
        background-color: #2a9d63;
    }
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;
`;

const WriteButton = styled.button`
    padding: 0.75rem 1.5rem;
    background-color: #3cb371;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    &:hover {
        background-color: #2a9d63;
    }
`;

const StyledButton = styled.button`
    padding: 0.75rem 1.5rem; /* 상하, 좌우 패딩 */
    background-color: #3cb371; /* 버튼 기본 색상 */
    color: white; /* 글자 색상 */
    border: none; /* 경계선 없음 */
    border-radius: 8px; /* 둥근 모서리 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 그림자 효과 */
    font-size: 1rem; /* 글자 크기 */
    cursor: pointer; /* 마우스 포인터 */
    transition: background-color 0.3s, transform 0.3s; /* 애니메이션 효과 */

    &:hover {
        background-color: #2a9d63; /* 호버 시 색상 변경 */
        transform: translateY(-2px); /* 호버 시 약간 위로 이동 */
    }

    &:active {
        transform: translateY(0); /* 클릭 시 원래 위치로 돌아옴 */
    }
`;