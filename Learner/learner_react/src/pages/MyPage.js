import React, { useEffect, useState } from "react";
import styled from "styled-components";
import WeeklyStudyTable from "../components/study-table/WeeklyStudyTable";
import YearlyStudyTable from "../components/study-table/YearlyStudyTable";

const MyPage = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [myCourses, setMyCourses] = useState([]); // 사용자 강의 상태 추가
    const [selectedFile, setSelectedFile] = useState(null);
    const [errorMessage, setErrorMessage] = useState(""); // 오류 메시지 상태 추가
    const [isHover, setIsHover] = useState(false);

    useEffect(() => {
        const memberId = localStorage.getItem("memberId");
        const fetchUserInfo = async () => {
            try {
                const response = await fetch(`http://localhost:8080/members/${memberId}`, {
                    credentials: "include",
                });
                if (response.ok) {
                    const data = await response.json();
                    setUserInfo(data);
                } else {
                    console.error("사용자 정보 로드 실패:", response.status);
                }
            } catch (error) {
                console.error("API 호출 중 오류 발생:", error);
            }
        };

        const fetchMyCourses = async () => {
            try {
                const response = await fetch(`http://localhost:8080/members/${memberId}/courses`, {
                    credentials: "include",
                });
                if (response.ok) {
                    const data = await response.json();
                    setMyCourses(data); // 사용자 강의 정보 설정
                } else {
                    console.error("강의 정보 로드 실패:", response.status);
                }
            } catch (error) {
                console.error("강의 정보 API 호출 중 오류 발생:", error);
            }
        };

        fetchUserInfo();
        fetchMyCourses(); // 강의 정보 가져오기
    }, []);

    const handleLogout = () => {
        document.cookie = "Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        localStorage.removeItem("memberId");
        window.location.href = "/";
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            const memberId = localStorage.getItem("memberId");
            const formData = new FormData();
            formData.append("file", file);
            try {
                const response = await fetch(`http://localhost:8080/members/${memberId}/image`, {
                    method: "PUT",
                    body: formData,
                    credentials: "include",
                });

                const responseBody = await response.text(); // 텍스트로 응답을 받음

                if (response.ok) {
                    setUserInfo((prevUserInfo) => ({
                        ...prevUserInfo,
                        profileImage: responseBody.profileImage, // 여기에 프로필 이미지 경로 추가
                    }));
                    setErrorMessage(""); // 성공 시 오류 메시지 초기화
                    alert(responseBody.message || "이미지 업로드 성공!"); // 성공 메시지
                    window.location.reload(); // 페이지 리로드
                } else {
                    console.error("이미지 업로드 실패:", response.status, responseBody);
                    setErrorMessage(`이미지 업로드 실패: ${responseBody || "알 수 없는 오류 발생"}`); // 오류 메시지 상태에 설정
                }
            } catch (error) {
                console.error("이미지 업로드 중 오류 발생:", error);
                setErrorMessage("이미지 업로드 중 오류 발생"); // 오류 메시지 상태에 설정
            }
        }
    };

    const handleUploadClick = () => {
        const fileInput = document.getElementById("fileInput");
        fileInput.click();
    };

    // 이미지 삭제 핸들러
    const handleDeleteImage = async () => {
        const memberId = localStorage.getItem("memberId");
        try {
            const response = await fetch(`http://localhost:8080/members/${memberId}/image`, {
                method: "DELETE",
                credentials: "include",
            });

            if (response.ok) {
                setUserInfo((prevUserInfo) => ({
                    ...prevUserInfo,
                    profileImage: null, // 이미지 삭제 후 프로필 이미지를 null로 설정
                }));
                alert("이미지가 성공적으로 삭제되었습니다."); // 성공 메시지
                window.location.reload(); // 페이지 리로드
            } else {
                console.error("이미지 삭제 실패:", response.status);
                setErrorMessage("이미지 삭제 실패"); // 오류 메시지 상태에 설정
            }
        } catch (error) {
            console.error("이미지 삭제 중 오류 발생:", error);
            setErrorMessage("이미지 삭제 중 오류 발생"); // 오류 메시지 상태에 설정
        }
    };

    // 회원탈퇴 핸들러 추가
    const handleWithdraw = async () => {
        const memberId = localStorage.getItem("memberId");
        try {
            const response = await fetch(`http://localhost:8080/members/${memberId}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (response.ok) {
                alert("회원탈퇴가 완료되었습니다."); // 성공 메시지
                document.cookie = "Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; // 쿠키 삭제
                localStorage.removeItem("memberId"); // 로컬 저장소에서 memberId 삭제
                window.location.href = "/"; // 메인 화면으로 리다이렉트
            } else {
                console.error("회원탈퇴 실패:", response.status);
                setErrorMessage("회원탈퇴 실패"); // 오류 메시지 상태에 설정
            }
        } catch (error) {
            console.error("회원탈퇴 중 오류 발생:", error);
            setErrorMessage("회원탈퇴 중 오류 발생"); // 오류 메시지 상태에 설정
        }
    };

    if (!userInfo) {
        return <LoadingMessage>로딩 중...</LoadingMessage>;
    }

    const profileImageSrc = userInfo.profileImage
        ? `data:image/jpeg;base64,${userInfo.profileImage}`
        : "http://localhost:8080/images/default_profile.jpg";

    return (
        <Container>
            <Title>마이페이지</Title>
            <ProfileSection
                onMouseEnter={() => setIsHover(true)}
                onMouseLeave={() => setIsHover(false)}
            >
                <ProfilePicture src={profileImageSrc} alt="Profile" />
                {isHover && (
                    <>
                        <UploadButton onClick={handleUploadClick}>
                            +
                        </UploadButton>
                    </>
                )}
                {userInfo.profileImage && ( // 프로필 이미지가 있을 때만 삭제 버튼 표시
                    <DeleteButton onClick={handleDeleteImage}>
                        이미지 삭제
                    </DeleteButton>
                )}
                <input
                    type="file"
                    id="fileInput"
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </ProfileSection>
            <UserInfoSection>
                <UserInfo>
                    <InfoItem><strong>닉네임:</strong> {userInfo.nickname}</InfoItem>
                    <InfoItem><strong>이메일:</strong> {userInfo.email}</InfoItem>
                    <InfoItem><strong>전화번호:</strong> {userInfo.phoneNumber}</InfoItem>
                </UserInfo>
                <AboutSection>
                    <AboutTitle>자기소개</AboutTitle>
                    <AboutContent>{userInfo.introduction || "자기소개가 없습니다."}</AboutContent>
                </AboutSection>
                <TableContainer>
                    <WeeklyStudyTable />
                    <YearlyStudyTable />
                </TableContainer>
            </UserInfoSection>
            {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>} {/* 오류 메시지 표시 */}
            <ButtonContainer>
                <StyledButton onClick={() => window.location.href = "/edit-profile"}>회원정보 수정</StyledButton>
                <StyledButton onClick={handleLogout}>로그아웃</StyledButton>
                <StyledButton onClick={handleWithdraw}>회원탈퇴하기</StyledButton> {/* 회원탈퇴하기 버튼 추가 */}
            </ButtonContainer>

        </Container>
    );
};

export default MyPage;

// 스타일 컴포넌트들
const Container = styled.div`
    padding: 4rem;
    max-width: 800px;
    margin: auto;
    text-align: center;
`;

const Title = styled.h1`
    font-size: 2.5rem;
    margin-bottom: 3rem;
`;

const ProfileSection = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 3rem;
    position: relative;
`;

const UploadButton = styled.button`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #3cb371;
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    cursor: pointer;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    &:hover {
        background-color: #218838;
    }
`;

const DeleteButton = styled.button`
    position: absolute;
    top: 10%;
    right: 10%;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 5px; // 버튼의 모서리를 둥글게 변경
    padding: 0.5rem 1rem; // 패딩 추가
    cursor: pointer;
    font-size: 1rem; // 폰트 크기 조정
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    &:hover {
        background-color: #c82333;
    }
`;

const ProfilePicture = styled.img`
    width: 200px;
    height: 200px;
    border-radius: 50%;
    margin-right: 2rem;
    object-fit: cover;
    border: 5px solid #3cb371;
`;

const UserInfoSection = styled.div`
    text-align: left;
`;

const UserInfo = styled.div`
    font-size: 1.2rem;
`;

const InfoItem = styled.p`
    margin: 0.5rem 0;
`;

const AboutSection = styled.div`
    margin: 2rem 0;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 1.5rem;
    background-color: #f9f9f9;
    text-align: left;
`;

const AboutTitle = styled.h2`
    font-size: 1.8rem;
    margin-bottom: 1rem;
`;

const AboutContent = styled.p`
    font-size: 1.2rem;
`;

const MyCoursesSection = styled.div`
    margin: 2rem 0;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 1.5rem;
    background-color: #f9f9f9;
    text-align: left;
`;

const CourseList = styled.ul`
    list-style-type: none;
    padding: 0;
`;

const CourseItem = styled.li`
    padding: 0.5rem 0;
    border-bottom: 1px solid #ddd;
    &:last-child {
        border-bottom: none; // 마지막 항목의 경계 제거
    }
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    gap: 2rem;
`;

const StyledButton = styled.button`
    background-color: #3cb371;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 1rem 2rem;
    cursor: pointer;
    font-size: 1.2rem;
    transition: background-color 0.3s;
    &:hover {
        background-color: #218838;
    }
`;

const ErrorMessage = styled.div`
    color: red;
    font-size: 1.2rem;
    margin-bottom: 1rem;
`;

const LoadingMessage = styled.div`
    font-size: 1.5rem;
    color: #3cb371; // 로딩 메시지 색상
    margin-top: 2rem;
`;

const TableContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center; /* 가로 중앙 정렬 */
    justify-content: center; /* 세로 중앙 정렬 */
    margin-top: 2rem;
`;
