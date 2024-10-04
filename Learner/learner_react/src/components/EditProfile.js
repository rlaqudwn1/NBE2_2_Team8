import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const EditProfile = () => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState({
        nickname: "",
        email: "",
        introduction: "",
        password: "",
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [isPasswordVerified, setIsPasswordVerified] = useState(false);
    const [isOAuthUser, setIsOAuthUser] = useState(false);

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
                    if (data.password.includes("naver") || data.password.includes("google")) {
                        setIsOAuthUser(true);
                    } else {
                        setIsOAuthUser(false);
                    }
                } else {
                    console.error("사용자 정보 로드 실패:", response.status);
                }
            } catch (error) {
                console.error("API 호출 중 오류 발생:", error);
            }
        };

        fetchUserInfo();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserInfo((prevUserInfo) => ({
            ...prevUserInfo,
            [name]: value,
        }));
    };

    const handleVerifyPassword = async () => {
        const memberId = localStorage.getItem("memberId");

        try {
            const response = await fetch(`http://localhost:8080/members/${memberId}/verify-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain",
                },
                body: currentPassword,
                credentials: "include",
            });

            if (response.ok) {
                setIsPasswordVerified(true);
                setErrorMessage("");
                setSuccessMessage("비밀번호 인증 성공! 정보를 수정할 수 있습니다.");
            } else {
                const errorBody = await response.text();
                setErrorMessage(`비밀번호 인증 실패: ${errorBody || "알 수 없는 오류 발생"}`);
                setIsPasswordVerified(false);
            }
        } catch (error) {
            console.error("비밀번호 인증 중 오류 발생:", error);
            setErrorMessage("비밀번호 인증 중 오류 발생");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isOAuthUser) {
            setIsPasswordVerified(true); // 자동으로 인증 성공 처리
        } else if (!isPasswordVerified) {
            setErrorMessage("먼저 비밀번호를 인증하세요.");
            return;
        }

        const memberId = localStorage.getItem("memberId");

        try {
            const response = await fetch(`http://localhost:8080/members/${memberId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nickname: userInfo.nickname,
                    email: userInfo.email,
                    introduction: userInfo.introduction,
                    password: isOAuthUser ? undefined : userInfo.password,
                }),
                credentials: "include",
            });

            if (response.ok) {
                setSuccessMessage("회원 정보가 성공적으로 수정되었습니다.");
                setErrorMessage("");
                navigate(`/내정보`);
            } else {
                const errorBody = await response.text();
                setErrorMessage(`수정 실패: ${errorBody || "알 수 없는 오류 발생"}`);
                setSuccessMessage("");
            }
        } catch (error) {
            console.error("회원 정보 수정 중 오류 발생:", error);
            setErrorMessage("회원 정보 수정 중 오류 발생");
            setSuccessMessage("");
        }
    };

    const handleWithdraw = async () => {
        const confirmWithdraw = window.confirm("회원탈퇴를 하시겠습니까?"); // 회원 탈퇴 확인 창
        if (confirmWithdraw) {
            const memberId = localStorage.getItem("memberId");

            try {
                const response = await fetch(`http://localhost:8080/members/${memberId}`, {
                    method: "DELETE",
                    credentials: "include",
                });

                if (response.ok) {
                    // 성공적으로 회원 탈퇴 후 쿠키 및 로컬 저장소 삭제
                    localStorage.removeItem("memberId");
                    // 쿠키 삭제를 위한 로직 추가 (필요한 경우)
                    navigate("/"); // 메인 화면으로 리다이렉트
                    setSuccessMessage("회원탈퇴가 완료되었습니다."); // 회원탈퇴 완료 메시지
                } else {
                    const errorBody = await response.text();
                    setErrorMessage(`회원 탈퇴 실패: ${errorBody || "알 수 없는 오류 발생"}`);
                }
            } catch (error) {
                console.error("회원 탈퇴 중 오류 발생:", error);
                setErrorMessage("회원 탈퇴 중 오류 발생");
            }
        } else {
            // 사용자가 확인 창에서 '취소'를 클릭했을 때
            setErrorMessage("회원탈퇴가 취소되었습니다."); // 탈퇴 취소 메시지 (선택사항)
        }
    };


    return (
        <Container>
            <Title>회원정보 수정</Title>
            <Form onSubmit={handleSubmit}>
                <Label>
                    닉네임:
                    <Input type="text" name="nickname" value={userInfo.nickname} onChange={handleChange} required />
                </Label>
                <Label>
                    이메일:
                    <Input type="email" name="email" value={userInfo.email} readOnly />
                </Label>
                <Label>
                    자기소개:
                    <Textarea name="introduction" value={userInfo.introduction} onChange={handleChange} />
                </Label>
                {!isOAuthUser && (
                    <>
                        <Label>
                            현재 비밀번호:
                            <Input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                            <VerifyButton type="button" onClick={handleVerifyPassword}>비밀번호 인증</VerifyButton>
                        </Label>
                        <Label>
                            새로운 비밀번호:
                            <Input
                                type="text"
                                name="password"
                                value={userInfo.password}
                                onChange={handleChange}
                                placeholder="변경할 비밀번호를 입력하세요."
                            />
                        </Label>
                    </>
                )}
                <Button type="submit">수정하기</Button>
            </Form>
            <WithdrawButton onClick={handleWithdraw}>회원탈퇴하기</WithdrawButton>
            {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
            {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
        </Container>
    );
};

export default EditProfile;

// 스타일 컴포넌트들
const Container = styled.div`
    padding: 4rem;
    max-width: 600px;
    margin: auto;
    text-align: center;
`;

const Title = styled.h1`
    font-size: 2.5rem;
    margin-bottom: 2rem;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const Label = styled.label`
    text-align: left;
`;

const Input = styled.input`
    width: 100%;
    padding: 0.5rem;
    border-radius: 5px;
    border: 1px solid #ddd;
`;

const Textarea = styled.textarea`
    width: 100%;
    padding: 0.5rem;
    border-radius: 5px;
    border: 1px solid #ddd;
    resize: none;
`;

const Button = styled.button`
    background-color: #3cb371;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-size: 1.2rem;
    &:hover {
        background-color: #218838;
    }
`;

const WithdrawButton = styled.button`
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-size: 1.2rem;
    margin-top: 1rem;
    &:hover {
        background-color: #c82333;
    }
`;

const VerifyButton = styled.button`
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-size: 1.2rem;
    margin-top: 0.5rem;
    &:hover {
        background-color: #0056b3;
    }
`;

const ErrorMessage = styled.div`
    color: red;
    font-size: 1.2rem;
    margin-top: 1rem;
`;

const SuccessMessage = styled.div`
    color: green;
    font-size: 1.2rem;
    margin-top: 1rem;
`;
